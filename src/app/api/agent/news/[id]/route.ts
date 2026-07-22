import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAgent } from '@/lib/session'
import { deleteFromR2, keyFromUrl } from '@/lib/r2-storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** DELETE /api/agent/news/[id]?type=news|blog — delete own post + its image. */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAgent()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const type = request.nextUrl.searchParams.get('type') ?? 'news'

  if (type === 'blog') {
    const item = await prisma.blog.findUnique({ where: { id } })
    if (!item || item.authorId !== auth.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (item.coverImage) {
      const k = keyFromUrl(item.coverImage)
      if (k) await deleteFromR2(k).catch(() => {})
    }
    await prisma.blog.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  }

  const item = await prisma.news.findUnique({ where: { id } })
  if (!item || item.authorId !== auth.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (item.image) {
    const k = keyFromUrl(item.image)
    if (k) await deleteFromR2(k).catch(() => {})
  }
  await prisma.news.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
