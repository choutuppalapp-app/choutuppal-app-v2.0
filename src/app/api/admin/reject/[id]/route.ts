import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'
import { deleteFromR2, keyFromUrl } from '@/lib/r2-storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/reject/[id]?type=listing|realestate|banner
 * Rejects: deletes the DB record AND its media from R2.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const type = request.nextUrl.searchParams.get('type') ?? 'listing'

  if (type === 'banner') {
    const item = await prisma.banner.findUnique({ where: { id } })
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    // Delete R2 image first.
    const k = keyFromUrl(item.imageUrl)
    if (k) await deleteFromR2(k).catch(() => {})
    await prisma.banner.delete({ where: { id } })
    if (item.ownerId) {
      await prisma.notification.create({
        data: {
          userId: item.ownerId,
          type: 'LISTING_REJECTED',
          title: 'Banner Rejected',
          message: `Your banner "${item.title ?? 'Ad'}" was not approved.`,
        },
      }).catch(() => {})
    }
    return NextResponse.json({ ok: true })
  }

  if (type === 'realestate') {
    const item = await prisma.realEstate.findUnique({ where: { id } })
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Clean up media from R2 first.
    const keys = [item.coverImage]
    if (Array.isArray(item.images)) {
      for (const g of item.images as unknown[]) keys.push(g as string)
    }
    await Promise.all(
      keys.filter(Boolean).map((u) => {
        const k = keyFromUrl(u as string)
        return k ? deleteFromR2(k).catch(() => {}) : null
      }),
    )

    await prisma.realEstate.delete({ where: { id } })
    await prisma.notification.create({
      data: {
        userId: item.ownerId,
        type: 'LISTING_REJECTED',
        title: 'Property Rejected',
        message: `Your property "${item.title}" was not approved.`,
      },
    }).catch(() => {})
    return NextResponse.json({ ok: true })
  }

  const item = await prisma.listing.findUnique({ where: { id } })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const keys = [item.coverImage, item.logo]
  if (Array.isArray(item.gallery)) {
    for (const g of item.gallery as unknown[]) keys.push(g as string)
  }
  await Promise.all(
    keys.filter(Boolean).map((u) => {
      const k = keyFromUrl(u as string)
      return k ? deleteFromR2(k).catch(() => {}) : null
    }),
  )

  await prisma.listing.delete({ where: { id } })
  await prisma.notification.create({
    data: {
      userId: item.ownerId,
      type: 'LISTING_REJECTED',
      title: 'Listing Rejected',
      message: `Your listing "${item.title}" was not approved.`,
    },
  }).catch(() => {})
  return NextResponse.json({ ok: true })
}
