import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** DELETE /api/community/posts/[id] — delete own post (owner or admin). */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const viewer = await getCurrentUser()
  if (!viewer) return NextResponse.json({ error: 'Login required' }, { status: 401 })

  const { id } = await params
  const post = await prisma.communityPost.findUnique({ where: { id } })
  if (!post) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const isOwner = post.authorId === viewer.id
  const isAdmin = viewer.role === 'ADMIN' || viewer.role === 'SUPER_ADMIN'
  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  await prisma.communityPost.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
