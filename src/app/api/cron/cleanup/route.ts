import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { deleteFromR2, keyFromUrl } from '@/lib/r2-storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * 24-hour auto-delete cron job.
 *
 * Finds every Story and Banner whose `expiresAt < NOW()`, deletes the media
 * file from Cloudflare R2 FIRST (so we never orphan blobs), then deletes the
 * DB record.
 *
 * Auth: `Authorization: Bearer <CRON_SECRET>` header. Accepts both GET (Netlify
 * Scheduled Functions / most cron services) and POST.
 */
async function runCleanup() {
  const checkedAt = new Date()
  const now = checkedAt

  const [expiredStories, expiredBanners] = await Promise.all([
    prisma.story.findMany({ where: { expiresAt: { lt: now } } }),
    prisma.banner.findMany({ where: { expiresAt: { lt: now } } }),
  ])

  let deletedStories = 0
  let deletedBanners = 0
  let fileDeleteFailures = 0
  const errors: string[] = []

  // ---- Stories: delete R2 file first, then DB row -------------------------
  for (const story of expiredStories) {
    const key = keyFromUrl(story.mediaUrl)
    if (key) {
      try {
        await deleteFromR2(key)
      } catch (err) {
        fileDeleteFailures++
        errors.push(`story:${story.id} file delete failed`)
        // Per the blueprint, the file must be gone before we drop the row.
        // If R2 deletion fails we keep the row so it can be retried next run.
        continue
      }
    }
    try {
      await prisma.story.delete({ where: { id: story.id } })
      deletedStories++
    } catch (err) {
      errors.push(`story:${story.id} db delete failed`)
    }
  }

  // ---- Banners: delete R2 file first, then DB row -------------------------
  for (const banner of expiredBanners) {
    const key = keyFromUrl(banner.imageUrl)
    if (key) {
      try {
        await deleteFromR2(key)
      } catch (err) {
        fileDeleteFailures++
        errors.push(`banner:${banner.id} file delete failed`)
        continue
      }
    }
    try {
      await prisma.banner.delete({ where: { id: banner.id } })
      deletedBanners++
    } catch (err) {
      errors.push(`banner:${banner.id} db delete failed`)
    }
  }

  return {
    ok: true,
    checkedAt: checkedAt.toISOString(),
    expiredStories: expiredStories.length,
    expiredBanners: expiredBanners.length,
    deletedStories,
    deletedBanners,
    fileDeleteFailures,
    errors,
  }
}

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) return false
  const header = request.headers.get('authorization') ?? ''
  const query = request.nextUrl.searchParams.get('secret') ?? ''
  return header === `Bearer ${secret}` || query === secret
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const result = await runCleanup()
    return NextResponse.json(result)
  } catch (err) {
    console.error('[cron:cleanup] fatal', err)
    return NextResponse.json(
      { ok: false, error: 'Internal error' },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  return GET(request)
}
