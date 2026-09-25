import { safeDbQuery } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiUser } from '@/lib/session'
import { getSafeTenantId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'
import { invalidateHomeDataCache } from '@/lib/home-data'
import { saveOfflineStory, getOfflineStories } from '@/lib/offline-data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TTL_HOURS = 24

const CreateSchema = z.object({
  mediaUrl: z.string().min(1),
  mediaType: z.enum(['IMAGE', 'VIDEO']).default('IMAGE'),
  caption: z.string().max(500).optional(),
  link: z.string().optional(),
})

/** POST /api/stories — create a story (Link/URL based) that auto-expires in 24h. */
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

  const expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000)

  // 1. Save directly to Offline Store & Disk
  const offlineStory = saveOfflineStory({
    mediaUrl: parsed.data.mediaUrl,
    mediaType: parsed.data.mediaType,
    caption: parsed.data.caption || 'Choutuppal Story',
    link: parsed.data.link || '/dashboard',
    ownerId: auth.user.id,
    expiresAt: expiresAt.toISOString(),
    isActive: true,
  })

  // 2. Try saving to Prisma DB
  let dbStory = null
  try {
    dbStory = await prisma.story.create({
      data: {
        id: offlineStory.id,
        mediaUrl: parsed.data.mediaUrl,
        mediaType: parsed.data.mediaType,
        caption: parsed.data.caption || undefined,
        expiresAt,
        ownerId: auth.user.id,
      },
    })
  } catch (err) {
    console.warn('[API Story POST] Prisma save fallback to offline store:', err)
  }

  invalidateHomeDataCache()
  try {
    revalidatePath('/')
    revalidatePath('/dashboard')
  } catch {}

  const responseStory = {
    id: dbStory?.id || offlineStory.id,
    mediaUrl: parsed.data.mediaUrl,
    mediaType: parsed.data.mediaType,
    caption: parsed.data.caption || null,
    views: 0,
    expiresAt: expiresAt.toISOString(),
    createdAt: new Date().toISOString(),
    owner: {
      id: auth.user.id,
      name: auth.user.name || auth.user.username || 'User',
      username: auth.user.username,
      image: auth.user.image,
    },
  }

  return NextResponse.json({ ok: true, story: responseStory }, { status: 201 })
}

/** GET /api/stories — current user's stories. */
export async function GET() {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const offlineList = getOfflineStories()
  let userStories = offlineList.filter((s) => s.ownerId === auth.user.id || !s.ownerId)

  try {
    const dbStories = await prisma.story.findMany({
      where: { ownerId: auth.user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { storyViews: true, storyReplies: true, storyLikes: true } },
      },
    })
    if (dbStories && dbStories.length > 0) {
      const map = new Map<string, any>()
      for (const s of dbStories) map.set(s.id, s)
      for (const s of userStories) {
        if (!map.has(s.id)) map.set(s.id, s)
      }
      userStories = Array.from(map.values())
    }
  } catch {}

  return NextResponse.json({ ok: true, stories: userStories })
}
