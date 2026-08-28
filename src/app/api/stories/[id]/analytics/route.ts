import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiUser } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

/**
 * GET /api/stories/[id]/analytics
 * Owner-only: returns viewers list + reply count + likes list.
 * Non-owners get 403.
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
    return NextResponse.json({ error: 'Only the owner can view analytics' }, { status: 403 })
  }

  const [viewers, replyCount, likers] = await Promise.all([
    prisma.storyView.findMany({
      where: { storyId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
      },
    }),
    prisma.storyReply.count({ where: { storyId } }),
    prisma.storyLike.findMany({
      where: { storyId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, username: true, image: true } },
      },
    }),
  ])

  return NextResponse.json({
    ok: true,
    analytics: {
      totalViews: story.views,
      viewers: viewers.map((v) => ({
        id: v.id,
        createdAt: v.createdAt,
        user: v.user,
      })),
      replyCount,
      likeCount: likers.length,
      likers: likers.map((l) => ({
        id: l.id,
        createdAt: l.createdAt,
        user: l.user,
      })),
    },
  })
}
