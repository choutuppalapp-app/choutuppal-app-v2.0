import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdminRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/admin/listings — fetch all listings & real estate for admin management */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const [listings, realEstates] = await Promise.all([
      prisma.listing.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          category: { select: { name: true } },
          village: { select: { name: true } },
          owner: { select: { id: true, name: true, email: true, phone: true } },
        },
      }),
      prisma.realEstate.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          village: { select: { name: true } },
          owner: { select: { id: true, name: true, email: true, phone: true } },
        },
      }),
    ])

    return NextResponse.json({ ok: true, listings, realEstates })
  } catch (err) {
    console.error('[AdminListingsAPI] GET error:', err)
    return NextResponse.json({ ok: false, listings: [], realEstates: [] }, { status: 500 })
  }
}

/** PATCH /api/admin/listings — update listing or real estate status/isFeatured/isPremium */
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { type, id, isFeatured, isPremium, status, planTier } = body

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 })
    }

    if (type === 'realestate') {
      const dataToUpdate: any = {}
      if (typeof isFeatured === 'boolean') dataToUpdate.isFeatured = isFeatured
      if (typeof status === 'string') dataToUpdate.status = status

      const updated = await prisma.realEstate.update({
        where: { id },
        data: dataToUpdate,
      })
      return NextResponse.json({ ok: true, updated })
    } else {
      // business listing
      const dataToUpdate: any = {}
      if (typeof isFeatured === 'boolean') dataToUpdate.isFeatured = isFeatured
      if (typeof isPremium === 'boolean') dataToUpdate.isPremium = isPremium
      if (typeof status === 'string') dataToUpdate.status = status

      const updated = await prisma.listing.update({
        where: { id },
        data: dataToUpdate,
      })

      if (planTier && updated.ownerId) {
        await prisma.user.update({
          where: { id: updated.ownerId },
          data: { planTier },
        }).catch(() => {})
      }

      return NextResponse.json({ ok: true, updated })
    }
  } catch (err) {
    console.error('[AdminListingsAPI] PATCH error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to update' }, { status: 500 })
  }
}

/** DELETE /api/admin/listings — delete listing or real estate */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const type = searchParams.get('type')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 })
    }

    if (type === 'realestate') {
      await prisma.realEstate.delete({ where: { id } })
    } else {
      await prisma.listing.delete({ where: { id } })
    }

    return NextResponse.json({ ok: true, message: 'Deleted successfully' })
  } catch (err) {
    console.error('[AdminListingsAPI] DELETE error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to delete' }, { status: 500 })
  }
}
