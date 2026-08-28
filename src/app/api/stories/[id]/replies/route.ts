import { safeDbQuery } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiUser } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

/**
 * GET /api/stories/[id]/replies
 * Owner-only: lists all private replies to their story.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id: storyId } = await params
  const story = await prisma.story.findUnique({ where: { id: storyId } })
  if (!story) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (story.ownerId !== auth.user.id) {
    return NextResponse.json({ error: 'Only the owner can view replies' }, { status: 403 })
  }

  const replies = (await (async () => { try { return await prisma.storyReply.findMany({
    where: { storyId },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { id: true, name: true, username: true, image: true },
      },
    },
  }); } catch(e) { return [] as any; } })())
  return NextResponse.json({ ok: true, replies })
}

const ReplySchema = z.object({ content: z.string().min(1).max(500) })

/**
 * POST /api/stories/[id]/replies
 * Any logged-in user can reply. The reply is PRIVATE — only the story owner
 * sees it (via GET above). It does NOT appear publicly.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id: storyId } = await params
  const story = await prisma.story.findUnique({ where: { id: storyId } })
  if (!story) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Owners can't reply to their own story.
  if (story.ownerId === auth.user.id) {
    return NextResponse.json({ error: 'Cannot reply to your own story' }, { status: 400 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = ReplySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }

  const reply = await prisma.storyReply.create({
    data: { storyId, userId: auth.user.id, content: parsed.data.content },
  })
  return NextResponse.json({ ok: true, reply }, { status: 201 })
}
