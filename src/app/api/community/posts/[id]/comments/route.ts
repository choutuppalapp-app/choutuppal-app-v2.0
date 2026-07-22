import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/community/posts/[id]/comments — list comments for a post. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: postId } = await params
  const comments = await prisma.communityComment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
    take: 100,
    include: {
      author: {
        select: { id: true, name: true, username: true, image: true, politicalTag: true },
      },
    },
  })
  return NextResponse.json({ ok: true, comments })
}

const Schema = z.object({ content: z.string().min(1).max(1000) })

/** POST /api/community/posts/[id]/comments — add a comment (logged-in only). */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const viewer = await getCurrentUser()
  if (!viewer) return NextResponse.json({ error: 'Login required' }, { status: 401 })
  if (viewer.isBanned) return NextResponse.json({ error: 'Banned' }, { status: 403 })

  const { id: postId } = await params
  const body = await request.json().catch(() => ({}))
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }

  const post = await prisma.communityPost.findUnique({ where: { id: postId } })
  if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

  const comment = await prisma.communityComment.create({
    data: { content: parsed.data.content, postId, authorId: viewer.id },
    include: {
      author: {
        select: { id: true, name: true, username: true, image: true, politicalTag: true },
      },
    },
  })
  return NextResponse.json({ ok: true, comment }, { status: 201 })
}
