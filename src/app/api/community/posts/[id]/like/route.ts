import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** POST /api/community/posts/[id]/like — toggle like on a post. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const viewer = await getCurrentUser()
  if (!viewer) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const { id: postId } = await params
  const post = await prisma.communityPost.findUnique({ where: { id: postId } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const existing = await prisma.communityLike.findUnique({
    where: { userId_postId: { userId: viewer.id, postId } },
  })

  if (existing) {
    // Unlike
    await prisma.$transaction([
      prisma.communityLike.delete({ where: { id: existing.id } }),
      prisma.communityPost.update({ where: { id: postId }, data: { likes: { decrement: 1 } } }),
    ])
    return NextResponse.json({ ok: true, liked: false, likes: post.likes - 1 })
  }

  // Like
  await prisma.$transaction([
    prisma.communityLike.create({ data: { userId: viewer.id, postId } }),
    prisma.communityPost.update({ where: { id: postId }, data: { likes: { increment: 1 } } }),
  ])
  return NextResponse.json({ ok: true, liked: true, likes: post.likes + 1 })
}
