import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'
import { deleteFromR2, keyFromUrl } from '@/lib/r2-storage'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** DELETE /api/admin/content/blogs/[id] — delete a blog + its cover image. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const item = await prisma.blog.findUnique({ where: { id } })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (item.coverImage) {
    const k = keyFromUrl(item.coverImage)
    if (k) await deleteFromR2(k).catch(() => {})
  }
  await prisma.blog.delete({ where: { id } })

  // Trigger ISR cache revalidation
  revalidatePath('/blog')
  revalidatePath(`/blog/${item.slug}`)
  revalidatePath('/')

  return NextResponse.json({ ok: true })
}
