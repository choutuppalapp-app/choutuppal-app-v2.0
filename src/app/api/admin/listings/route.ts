import { NextResponse, NextRequest } from 'next/server'
import { requireApiAdmin } from '@/lib/session'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { getCurrentTenant, DEFAULT_TENANT, getTenantWhereClause } from '@/lib/tenant'
import {
  getOfflineCategories,
  getOfflineVillages,
  getOfflineListings,
  saveOfflineListing,
  deleteOfflineListing,
  STANDARD_CATEGORIES,
  STANDARD_VILLAGES,
} from '@/lib/offline-data'
import { invalidateHomeDataCache } from '@/lib/home-data'
import { invalidateCache } from '@/lib/cache'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

/**
 * Merge listings from DB and offline persistent disk store.
 * Offline store contains the latest additions and edits.
 */
function mergeListings(dbItems: any[], offlineItems: any[]): any[] {
  const map = new Map<string, any>()

  // 1. Add DB items
  if (Array.isArray(dbItems)) {
    for (const item of dbItems) {
      if (item && item.id) {
        map.set(item.id, item)
        if (item.slug) map.set(`slug_${item.slug.toLowerCase()}`, item)
      }
    }
  }

  // 2. Overlay offline items (taking precedence for newly uploaded listings)
  if (Array.isArray(offlineItems)) {
    for (const item of offlineItems) {
      if (item && item.id) {
        map.set(item.id, item)
        if (item.slug) map.set(`slug_${item.slug.toLowerCase()}`, item)
      }
    }
  }

  // Deduplicate objects
  const uniqueItems = Array.from(new Set(Array.from(map.values())))

  // Enrich with proper category & village objects
  const enriched = uniqueItems.map((l: any) => {
    let cat = l.category
    if (!cat || !cat.name) {
      const foundCat =
        STANDARD_CATEGORIES.find((c) => c.id === l.categoryId || c.slug === l.categoryId) ||
        STANDARD_CATEGORIES[0]
      cat = { id: foundCat.id, name: foundCat.name, slug: foundCat.slug, icon: foundCat.icon, telugu: foundCat.telugu }
    }
    let vil = l.village
    if (!vil || !vil.name) {
      const foundVil =
        STANDARD_VILLAGES.find((v) => v.id === l.villageId || v.slug === l.villageId) ||
        STANDARD_VILLAGES[0]
      vil = { id: foundVil.id, name: foundVil.name, slug: foundVil.slug }
    }
    return {
      ...l,
      category: cat,
      village: vil,
      status: l.status || 'APPROVED',
      isFeatured: Boolean(l.isFeatured),
      isPremium: Boolean(l.isPremium),
      avgRating: l.avgRating || 4.8,
      views: l.views || 50,
    }
  })

  // Sort by createdAt descending
  enriched.sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
    return timeB - timeA
  })

  return enriched
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
  const type = searchParams.get('type') || 'ALL'
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
      safeDbQuery(() => prisma.category.findMany({ orderBy: { name: 'asc' } }), []),
      safeDbQuery(() => prisma.village.findMany({ orderBy: { name: 'asc' } }), []),
    ])

    const offlineListings = getOfflineListings()
    let listings = mergeListings(dbListings, offlineListings)

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

    if (type !== 'ALL') {
      listings = listings.filter((l: any) => (l.type || 'BUSINESS').toUpperCase() === type.toUpperCase())
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
    const tenant = await getCurrentTenant()
    const body = await req.json()
    const {
      title,
      description = '',
      type = 'BUSINESS',
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

    const tenantId = tenant?.id || DEFAULT_TENANT.id

    // 1. Save in offline persistent disk store immediately
    const offlineSaved = saveOfflineListing({
      title,
      slug,
      description: description || title,
      type,
      phone,
      whatsapp: whatsapp || phone,
      address: address || 'Choutuppal',
      status: status || 'APPROVED',
      isPremium: !!isPremium,
      isFeatured: !!isFeatured,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
      categoryId: categoryId || 'cat-services',
      villageId: villageId || 'v-choutuppal',
      tenantId,
      owner: { id: auth.user.id, name: auth.user.name || 'Admin', username: auth.user.username || 'admin', phone: auth.user.phone },
    })

    // 2. Also try Prisma DB insert safely
    const createdDb = await safeDbQuery(
      async () => {
        // Try to ensure an owner user exists in DB
        let dbOwner = await prisma.user.findFirst({
          where: {
            OR: [
              { id: auth.user.id },
              ...(auth.user.email ? [{ email: { equals: auth.user.email, mode: 'insensitive' as const } }] : []),
              { username: 'admin' },
            ],
          },
        })

        if (!dbOwner) {
          dbOwner = await prisma.user.create({
            data: {
              id: auth.user.id,
              name: auth.user.name || 'Admin',
              email: auth.user.email || 'mailmosin@gmail.com',
              username: auth.user.username || 'admin',
              role: 'ADMIN',
              planTier: 'PREMIUM',
            },
          }).catch(() => null)
        }

        // Try to resolve DB category & village
        const [dbCat, dbVil] = await Promise.all([
          prisma.category.findFirst({
            where: { OR: [{ id: categoryId }, { slug: categoryId }] },
          }).catch(() => null),
          prisma.village.findFirst({
            where: { OR: [{ id: villageId }, { slug: villageId }] },
          }).catch(() => null),
        ])

        return prisma.listing.create({
          data: {
            id: offlineSaved.id,
            title,
            slug,
            description: description || title,
            type,
            phone,
            whatsapp: whatsapp || phone,
            address: address || 'Choutuppal',
            status: status || 'APPROVED',
            isPremium: !!isPremium,
            isFeatured: !!isFeatured,
            coverImage: coverImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            categoryId: dbCat?.id || categoryId || 'cat-services',
            villageId: dbVil?.id || villageId || 'v-choutuppal',
            tenantId,
            ownerId: dbOwner?.id || auth.user.id,
          },
          include: { category: true, village: true, owner: true },
        })
      },
      null
    )

    invalidateHomeDataCache()
    invalidateCache('listings_')
    invalidateCache('listing_')
    invalidateCache('home_data_')
    try {
      revalidatePath('/')
      revalidatePath('/explore')
      revalidatePath('/listings')
      revalidatePath('/admin/listings')
      revalidatePath('/admin')
    } catch {}

    return NextResponse.json({ ok: true, listing: createdDb || offlineSaved, message: 'Listing created successfully' })
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
    const { id, status, type, isPremium, isFeatured, title, description, phone, whatsapp, address, categoryId, villageId } = body

    if (!id) {
      return NextResponse.json({ error: 'Listing ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (status !== undefined) updateData.status = status
    if (type !== undefined) updateData.type = type
    if (isPremium !== undefined) updateData.isPremium = Boolean(isPremium)
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured)
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (phone !== undefined) updateData.phone = phone
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp
    if (address !== undefined) updateData.address = address
    if (categoryId !== undefined) updateData.categoryId = categoryId
    if (villageId !== undefined) updateData.villageId = villageId

    // 1. Update in offline persistent store
    const offlineUpdated = saveOfflineListing({ id, ...updateData })

    // 2. Update in DB
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
    invalidateCache('home_data_')
    try {
      revalidatePath('/')
      revalidatePath('/explore')
      revalidatePath('/listings')
      revalidatePath('/admin/listings')
      revalidatePath('/admin')
    } catch {}

    return NextResponse.json({ ok: true, listing: updated || offlineUpdated, message: 'Listing updated successfully' })
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

    // 1. Delete from offline store
    deleteOfflineListing(id)

    // 2. Delete from DB
    await safeDbQuery(() => prisma.listing.delete({ where: { id } }), null)

    invalidateHomeDataCache()
    invalidateCache('listings_')
    invalidateCache('listing_')
    invalidateCache('home_data_')
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
