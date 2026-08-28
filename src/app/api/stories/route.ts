import { safeDbQuery } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiUser } from '@/lib/session'
import { getSafeTenantId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'
export const revalidate = 3600

const TTL_HOURS = 24

const CreateSchema = z.object({
  mediaUrl: z.string().min(1),
  mediaType: z.enum(['IMAGE', 'VIDEO']).default('IMAGE'),
  caption: z.string().max(500).optional(),
  link: z.string().optional(),
})

/**
 * POST /api/stories — create a story that auto-expires in exactly 24h.
 * PREMIUM ONLY: user.planTier must be PREMIUM (or ADMIN/SUPER_ADMIN).
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  // Premium gate — only PREMIUM users (or admins/agents) can post stories.
  const isPremium =
    auth.user.planTier === 'PREMIUM' ||
    auth.user.planTier === 'PRO' ||
    auth.user.role === 'ADMIN' ||
    auth.user.role === 'SUPER_ADMIN' ||
    auth.user.role === 'AGENT'
  if (!isPremium) {
    return NextResponse.json(
      { error: 'PREMIUM_REQUIRED', message: 'స్టోరీలు పోస్ట్ చేయడం కేవలం ప్రీమియం యూజర్లకే. ఇప్పుడే అప్‌గ్రేడ్ చేయండి!' },
      { status: 403 },
    )
  }

  let body: unknown;
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON data received' }, { status: 400 })
  }
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }

  const tenantId = await getSafeTenantId()
  if (!tenantId) {
    return NextResponse.json({ ok: false, error: 'Could not resolve or create a tenant.' }, { status: 500 })
  }

  const expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000)
  try {
    const story = await prisma.story.create({
      data: { ...parsed.data, expiresAt, ownerId: auth.user.id },
    })
    revalidatePath('/')
    return NextResponse.json({ ok: true, story }, { status: 201 })
  } catch (err: any) {
    console.error('Story Creation Error:', err)
    return NextResponse.json({ error: err.message || 'Database error occurred while saving' }, { status: 500 })
  }
}

/** GET /api/stories — current user's stories (for dashboard). */
export async function GET() {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const stories = (await (async () => { try { return await prisma.story.findMany({
    where: { ownerId: auth.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { storyViews: true, storyReplies: true, storyLikes: true } },
    },
  }); } catch(e) { return [] as any; } })())
  return NextResponse.json({ ok: true, stories })
}
