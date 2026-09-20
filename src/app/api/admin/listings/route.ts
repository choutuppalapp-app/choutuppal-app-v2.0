import { NextResponse, NextRequest } from 'next/server'
import { requireApiAdmin } from '@/lib/session'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { getOfflineListings, getOfflineCategories, getOfflineVillages } from '@/lib/offline-data'
import { invalidateHomeDataCache } from '@/lib/home-data'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

function persistOfflineListings(_listings: any[]) {
  // In-memory or database persistence only in serverless environment
}

/** GET /api/admin/listings - List all shops/listings with filters */
export async function GET(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')?.toLowerCase() || ''
  const status = searchParams.get('status') || 'ALL'
  const categoryId = searchParams.get('categoryId') || 'ALL'
  const villageId = searchParams.get('villageId') || 'ALL'

  try {
    const dbListings = await safeDbQuery(
      () =>
        prisma.listing.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            category: true,
            village: true,
            owner: { select: { id: true, name: true, phone: true, email: true, username: true } },
          },
        }),
      null
    )

    let listings = dbListings !== null && dbListings !== undefined ? dbListings : getOfflineListings()

    // Apply Filters
    if (search) {
      listings = listings.filter((l: any) =>
        l.title?.toLowerCase().includes(search) ||
        l.description?.toLowerCase().includes(search) ||
        l.phone?.includes(search) ||
        l.category?.name?.toLowerCase().includes(search) ||
        l.village?.name?.toLowerCase().includes(search)
      )
    }

    if (status !== 'ALL') {
      listings = listings.filter((l: any) => l.status === status)
    }

    if (categoryId !== 'ALL') {
      listings = listings.filter((l: any) => l.categoryId === categoryId || l.category?.id === categoryId)
    }

    if (villageId !== 'ALL') {
      listings = listings.filter((l: any) => l.villageId === villageId || l.village?.id === villageId)
    }

    const categories = getOfflineCategories()
    const villages = getOfflineVillages()

    return NextResponse.json({
      ok: true,
      listings,
      categories,
      villages,
      total: listings.length,
    })
  } catch (error: any) {
    console.error('[Admin Listings GET] Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

/** POST /api/admin/listings - Create new listing */
export async function POST(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const {
      title,
      description = '',
      phone,
      whatsapp,
      address,
      categoryId,
      villageId,
      status = 'APPROVED',
      isPremium = false,
      isFeatured = false,
      coverImage,
    } = body

    if (!title || !phone) {
      return NextResponse.json({ error: 'Title and Phone are required' }, { status: 400 })
    }

    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) + '-' + Math.random().toString(36).substring(2, 6)

    // 1. Try Prisma DB insert
    const createdDb = await safeDbQuery(
      () =>
        prisma.listing.create({
          data: {
            title,
            slug,
            description: description || title,
            phone,
            whatsapp: whatsapp || phone,
            address: address || 'Choutuppal',
            status,
            isPremium: !!isPremium,
            isFeatured: !!isFeatured,
            coverImage: coverImage || null,
            categoryId: categoryId || 'cat-services',
            villageId: villageId || 'cmsepb40r0000jv04tdwwd5cw',
            ownerId: auth.user.id,
          },
          include: { category: true, village: true, owner: true },
        }),
      null
    )

    // 2. Also keep offline backup updated
    const offlineList = getOfflineListings()
    const newOfflineItem = createdDb || {
      id: `list_${Date.now()}`,
      title,
      slug,
      description,
      phone,
      whatsapp: whatsapp || phone,
      address,
      status,
      isPremium: !!isPremium,
      isFeatured: !!isFeatured,
      coverImage,
      categoryId,
      villageId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      views: 1,
      avgRating: 5.0,
      owner: { id: auth.user.id, name: auth.user.name || 'Admin', phone: auth.user.phone },
    }

    offlineList.unshift(newOfflineItem)
    persistOfflineListings(offlineList)

    invalidateHomeDataCache()
    try { revalidatePath('/'); revalidatePath('/explore'); revalidatePath('/listings') } catch {}

    return NextResponse.json({ ok: true, listing: createdDb || newOfflineItem })
  } catch (error: any) {
    console.error('[Admin Listings POST] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create listing' }, { status: 500 })
  }
}

/** PATCH /api/admin/listings - Update listing (approve, reject, toggle premium, edit) */
export async function PATCH(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const { id, status, isPremium, isFeatured, title, description, phone, address } = body

    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (isPremium !== undefined) updateData.isPremium = Boolean(isPremium)
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured)
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (phone !== undefined) updateData.phone = phone
    if (address !== undefined) updateData.address = address

    // 1. Try DB update
    await safeDbQuery(
      () =>
        prisma.listing.update({
          where: { id },
          data: updateData,
        }),
      null
    )

    // 2. Also update in offline store
    const offlineList = getOfflineListings()
    const index = offlineList.findIndex((l: any) => l.id === id)
    if (index >= 0) {
      offlineList[index] = { ...offlineList[index], ...updateData, updatedAt: new Date().toISOString() }
      persistOfflineListings(offlineList)
    }

    invalidateHomeDataCache()
    try { revalidatePath('/'); revalidatePath('/explore'); revalidatePath('/listings') } catch {}

    return NextResponse.json({ ok: true, message: 'Listing updated successfully' })
  } catch (error: any) {
    console.error('[Admin Listings PATCH] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update listing' }, { status: 500 })
  }
}

/** DELETE /api/admin/listings - Delete listing */
export async function DELETE(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }

    await safeDbQuery(() => prisma.listing.delete({ where: { id } }), null)

    const offlineList = getOfflineListings()
    const filtered = offlineList.filter((l: any) => l.id !== id)
    persistOfflineListings(filtered)

    invalidateHomeDataCache()
    try { revalidatePath('/'); revalidatePath('/explore'); revalidatePath('/listings') } catch {}

    return NextResponse.json({ ok: true, message: 'Listing deleted' })
  } catch (error: any) {
    console.error('[Admin Listings DELETE] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete listing' }, { status: 500 })
  }
}
