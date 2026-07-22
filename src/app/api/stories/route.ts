import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

  const body = await request.json().catch(() => ({}))
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }

  // expiresAt = exactly 24 hours from now (cron deletes R2 file first, then row).
  const expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000)
  const story = await prisma.story.create({
    data: { ...parsed.data, expiresAt, ownerId: auth.user.id },
  })
  return NextResponse.json({ ok: true, story }, { status: 201 })
}

/** GET /api/stories — current user's stories (for dashboard). */
export async function GET() {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const stories = await prisma.story.findMany({
    where: { ownerId: auth.user.id },
    orderBy: { createdAt: 'desc' },
    include: {
      _count: { select: { storyViews: true, storyReplies: true } },
    },
  })
  return NextResponse.json({ ok: true, stories })
}
