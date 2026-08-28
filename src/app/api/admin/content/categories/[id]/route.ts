import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

/**
 * DELETE /api/admin/content/categories/[id]
 * Safe delete: nulls out categoryId on all listings that reference this
 * category BEFORE deleting it, so existing listings are not broken.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const item = await prisma.category.findUnique({ where: { id } })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Detach this category from all listings (set categoryId to null) so they
  // don't break. The listings remain live with no category.
  await prisma.listing.updateMany({
    where: { categoryId: id },
    data: { categoryId: null },
  })

  await prisma.category.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
