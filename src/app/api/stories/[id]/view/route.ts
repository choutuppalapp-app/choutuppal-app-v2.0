import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

/**
 * POST /api/stories/[id]/view
 * Silently records a view (unique per user+story) and increments the counter.
 * Does NOT return the view list — that's owner-only (see /analytics).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: storyId } = await params
  const viewer = await getCurrentUser()

  const story = await prisma.story.findUnique({ where: { id: storyId } })
  if (!story) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Don't count the owner viewing their own story.
  if (viewer && viewer.id === story.ownerId) {
    return NextResponse.json({ ok: true, counted: false })
  }

  // Anonymous viewers just increment the counter (no StoryView row).
  if (!viewer) {
    await prisma.story.update({
      where: { id: storyId },
      data: { views: { increment: 1 } },
    })
    return NextResponse.json({ ok: true, counted: true })
  }

  // Logged-in non-owner: record a unique StoryView (idempotent via upsert).
  const existing = await prisma.storyView.findUnique({
    where: { storyId_userId: { storyId, userId: viewer.id } },
  })
  if (!existing) {
    await prisma.$transaction([
      prisma.storyView.create({ data: { storyId, userId: viewer.id } }),
      prisma.story.update({ where: { id: storyId }, data: { views: { increment: 1 } } }),
    ])
  }
  return NextResponse.json({ ok: true, counted: !existing })
}
