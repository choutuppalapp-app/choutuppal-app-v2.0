import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/stories/[id]/like
 * Toggles a like on a story (unique per user+story).
 * - Owners cannot like their own story.
 * - Returns { liked, likeCount } — but likeCount is only meaningful to the
 *   owner (non-owners don't see the count in the UI).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id: storyId } = await params
  const story = await prisma.story.findUnique({ where: { id: storyId } })
  if (!story) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Owners can't like their own story.
  if (story.ownerId === auth.user.id) {
    return NextResponse.json({ error: 'Cannot like your own story' }, { status: 400 })
  }

  const existing = await prisma.storyLike.findUnique({
    where: { storyId_userId: { storyId, userId: auth.user.id } },
  })

  if (existing) {
    // Unlike
    await prisma.storyLike.delete({ where: { id: existing.id } })
    return NextResponse.json({ ok: true, liked: false })
  }

  // Like
  await prisma.storyLike.create({ data: { storyId, userId: auth.user.id } })
  return NextResponse.json({ ok: true, liked: true })
}

/**
 * GET /api/stories/[id]/like
 * Returns whether the current user has liked this story (for the heart state).
 * Does NOT return the count — that's owner-only (see /analytics).
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id: storyId } = await params
  const existing = await prisma.storyLike.findUnique({
    where: { storyId_userId: { storyId, userId: auth.user.id } },
  })
  return NextResponse.json({ ok: true, liked: !!existing })
}
