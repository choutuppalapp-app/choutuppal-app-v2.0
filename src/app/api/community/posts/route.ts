import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/community/posts
 * Public feed — only posts from PUBLIC authors, newest first. Includes author
 * (public fields only), comment count, and whether the viewer has liked each
 * post.
 */
export async function GET(request: NextRequest) {
  const tag = request.nextUrl.searchParams.get('tag') // optional filter
  const viewer = await getCurrentUser()

  const posts = await prisma.communityPost.findMany({
    where: {
      author: { isPublic: true, isBanned: false },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      author: {
        select: {
          id: true, name: true, username: true, image: true,
        },
      },
      _count: { select: { comments: true } },
      likesRel: viewer ? { where: { userId: viewer.id }, select: { id: true } } : false,
    },
  })

  const serialised = posts.map((p) => ({
    id: p.id,
    content: p.content,
    likes: p.likes,
    commentCount: p._count.comments,
    likedByMe: viewer ? p.likesRel.length > 0 : false,
    createdAt: p.createdAt,
    author: p.author,
  }))

  return NextResponse.json({ ok: true, posts: serialised })
}

const CreateSchema = z.object({
  content: z.string().min(1).max(2000),
})

/** POST /api/community/posts — create a post (logged-in users only). */
export async function POST(request: NextRequest) {
  const viewer = await getCurrentUser()
  if (!viewer) return NextResponse.json({ error: 'Login required' }, { status: 401 })
  if (viewer.isBanned) return NextResponse.json({ error: 'Account banned' }, { status: 403 })

  const body = await request.json().catch(() => ({}))
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }

  const post = await prisma.communityPost.create({
    data: {
      content: parsed.data.content,
      authorId: viewer.id,
    },
    include: {
      author: {
      },
    },
  })

  return NextResponse.json({ ok: true, post: { ...post, likedByMe: false, commentCount: 0 } }, { status: 201 })
}
