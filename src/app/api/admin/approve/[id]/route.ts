import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

/**
 * PATCH /api/admin/approve/[id]?type=listing|realestate|banner
 * Sets status to APPROVED.
 */
export async function PATCH(
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
    const updated = await prisma.banner.update({
      where: { id },
      data: { status: 'APPROVED' },
    })
    if (item.ownerId) {
      await prisma.notification.create({
        data: {
          userId: item.ownerId,
          type: 'LISTING_APPROVED',
          title: 'Banner Approved',
          message: `Your banner "${item.title ?? 'Ad'}" is now live on the Home page.`,
          link: '/',
        },
      }).catch(() => {})
    }
    return NextResponse.json({ ok: true, item: updated })
  }

  if (type === 'realestate') {
    const item = await prisma.realEstate.findUnique({ where: { id } })
    if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const updated = await prisma.realEstate.update({
      where: { id },
      data: { status: 'APPROVED' },
    })
    await prisma.notification.create({
      data: {
        userId: item.ownerId,
        type: 'LISTING_APPROVED',
        title: 'Property Approved',
        message: `Your property "${item.title}" is now live.`,
        link: `/business/${item.slug}`,
      },
    }).catch(() => {})
    return NextResponse.json({ ok: true, item: updated })
  }

  const item = await prisma.listing.findUnique({ where: { id } })
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const updated = await prisma.listing.update({
    where: { id },
    data: { status: 'APPROVED' },
  })
  await prisma.notification.create({
    data: {
      userId: item.ownerId,
      type: 'LISTING_APPROVED',
      title: 'Listing Approved',
      message: `Your listing "${item.title}" is now live.`,
      link: `/business/${item.slug}`,
    },
  }).catch(() => {})
  return NextResponse.json({ ok: true, item: updated })
}
