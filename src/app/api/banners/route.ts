import { safeDbQuery } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiUser } from '@/lib/session'
import { getSafeTenantId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { invalidateHomeDataCache } from '@/lib/home-data'
import { saveOfflineBanner, getOfflineBanners } from '@/lib/offline-data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TTL_HOURS = 24

const CreateSchema = z.object({
  imageUrl: z.string().min(1),
  title: z.string().optional(),
  link: z.string().optional(),
  position: z.enum(['HOME_TOP', 'HOME_MIDDLE', 'SIDEBAR']).default('HOME_TOP'),
})

/** POST /api/banners — create a banner ad (Link/URL based) that auto-expires in 24h. */
export async function POST(request: NextRequest) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON data received' }, { status: 400 })
  }

  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid URL or parameters' }, { status: 400 })
  }

  const tenantId = (await getSafeTenantId().catch(() => null)) || 'tenant_choutuppal'
  const expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000)

  // 1. Save directly into Offline Disk Store
  const offlineBanner = saveOfflineBanner({
    title: parsed.data.title || 'Special Promotion Banner',
    imageUrl: parsed.data.imageUrl,
    link: parsed.data.link || '/dashboard',
    position: parsed.data.position,
    ownerId: auth.user.id,
    expiresAt: expiresAt.toISOString(),
    status: 'APPROVED',
    isActive: true,
  })

  // 2. Try saving to Prisma DB
  let dbBanner = null
  try {
    dbBanner = await prisma.banner.create({
      data: {
        id: offlineBanner.id,
        imageUrl: parsed.data.imageUrl,
        title: parsed.data.title || undefined,
        link: parsed.data.link || undefined,
        position: parsed.data.position,
        expiresAt,
        ownerId: auth.user.id,
        tenantId,
        isActive: true,
      },
    })
  } catch (err) {
    console.warn('[API Banner POST] Prisma save fallback to offline store:', err)
  }

  invalidateHomeDataCache()
  try {
    revalidatePath('/')
    revalidatePath('/dashboard')
  } catch {}

  return NextResponse.json({ ok: true, banner: dbBanner || offlineBanner }, { status: 201 })
}

/** GET /api/banners — current user's banners. */
export async function GET() {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const offlineList = getOfflineBanners()
  let userBanners = offlineList.filter((b) => b.ownerId === auth.user.id || !b.ownerId)

  try {
    const dbBanners = await prisma.banner.findMany({
      where: { ownerId: auth.user.id },
      orderBy: { createdAt: 'desc' },
    })
    if (dbBanners && dbBanners.length > 0) {
      const map = new Map<string, any>()
      for (const b of dbBanners) map.set(b.id, b)
      for (const b of userBanners) {
        if (!map.has(b.id)) map.set(b.id, b)
      }
      userBanners = Array.from(map.values())
    }
  } catch {}

  return NextResponse.json({ ok: true, banners: userBanners })
}
