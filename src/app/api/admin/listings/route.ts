import { NextResponse, NextRequest } from 'next/server'
import { requireApiAdmin } from '@/lib/session'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { getOfflineCategories, getOfflineVillages } from '@/lib/offline-data'
import { invalidateHomeDataCache } from '@/lib/home-data'
import { invalidateCache } from '@/lib/cache'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

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
    const [dbListings, dbCategories, dbVillages] = await Promise.all([
      safeDbQuery(
        () =>
          prisma.listing.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
              category: true,
              village: true,
              owner: { select: { id: true, name: true, phone: true, email: true, username: true } },
            },
          }),
        []
      ),
      safeDbQuery(() => prisma.category.findMany({ orderBy: { name: 'asc' } }), null),
      safeDbQuery(() => prisma.village.findMany({ orderBy: { name: 'asc' } }), null),
    ])

    let listings = dbListings || []

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
      listings = listings.filter(
        (l: any) =>
          l.categoryId === categoryId ||
          l.category?.id === categoryId ||
          l.category?.slug === categoryId
      )
    }

    if (villageId !== 'ALL') {
      listings = listings.filter(
        (l: any) =>
          l.villageId === villageId ||
          l.village?.id === villageId ||
          l.village?.slug === villageId
      )
    }

    const categories = (dbCategories && dbCategories.length > 0) ? dbCategories : getOfflineCategories()
    const villages = (dbVillages && dbVillages.length > 0) ? dbVillages : getOfflineVillages()

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
      .replace(/[^a-z0-9\u0C00-\u0C7F]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) + '-' + Math.random().toString(36).substring(2, 6)

    // 1. Prisma DB insert
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
            coverImage: coverImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            categoryId: categoryId || 'cat-services',
            villageId: villageId || 'cmsepb40r0000jv04tdwwd5cw',
            ownerId: auth.user.id,
          },
          include: { category: true, village: true, owner: true },
        }),
      null
    )

    invalidateHomeDataCache()
    invalidateCache('listings_')
    invalidateCache('listing_')
    try {
      revalidatePath('/')
      revalidatePath('/explore')
      revalidatePath('/listings')
      revalidatePath('/admin/listings')
      revalidatePath('/admin')
    } catch {}

    return NextResponse.json({ ok: true, listing: createdDb, message: 'Listing created successfully' })
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
    const { id, status, isPremium, isFeatured, title, description, phone, whatsapp, address, categoryId, villageId } = body

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
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp
    if (address !== undefined) updateData.address = address
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (villageId !== undefined) updateData.villageId = villageId

    // Try DB update
    const updated = await safeDbQuery(
      () =>
        prisma.listing.update({
          where: { id },
          data: updateData,
        }),
      null
    )

    invalidateHomeDataCache()
    invalidateCache('listings_')
    invalidateCache('listing_')
    try {
      revalidatePath('/')
      revalidatePath('/explore')
      revalidatePath('/listings')
      revalidatePath('/admin/listings')
      revalidatePath('/admin')
    } catch {}

    return NextResponse.json({ ok: true, listing: updated, message: 'Listing updated successfully' })
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

    invalidateHomeDataCache()
    invalidateCache('listings_')
    invalidateCache('listing_')
    try {
      revalidatePath('/')
      revalidatePath('/explore')
      revalidatePath('/listings')
      revalidatePath('/admin/listings')
      revalidatePath('/admin')
    } catch {}

    return NextResponse.json({ ok: true, message: 'Listing deleted' })
  } catch (error: any) {
    console.error('[Admin Listings DELETE] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete listing' }, { status: 500 })
  }
}
