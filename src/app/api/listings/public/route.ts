import { NextRequest, NextResponse } from 'next/server'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { getCurrentTenant, getTenantWhereClause } from '@/lib/tenant'
import { getOfflineListings, STANDARD_CATEGORIES, STANDARD_VILLAGES } from '@/lib/offline-data'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/listings/public — Paginated public listings for infinite scroll grid */
export async function GET(request: NextRequest) {
  try {
    const tenant = await getCurrentTenant()
    const tenantFilter = getTenantWhereClause(tenant.id)

    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '24', 10)))
    const skip = (page - 1) * limit

    const category = searchParams.get('category')
    const village = searchParams.get('village')
    const type = searchParams.get('type') // BUSINESS, SERVICE, REAL_ESTATE
    const q = searchParams.get('q')?.trim().toLowerCase()

    const where: any = {
      ...tenantFilter,
      status: 'APPROVED',
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    }

    if (type && type !== 'ALL') {
      where.type = type.toUpperCase()
    }

    if (category && category !== 'all') {
      where.category = { slug: category }
    }
    if (village && village !== 'all') {
      where.village = { slug: village }
    }
    if (q) {
      where.AND = [
        {
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
            { secondaryPhone: { contains: q, mode: 'insensitive' } },
            { whatsapp: { contains: q, mode: 'insensitive' } },
            { village: { name: { contains: q, mode: 'insensitive' } } },
          ],
        },
      ]
    }

    const [dbListings, totalDb] = await Promise.all([
      safeDbQuery(
        () =>
          prisma.listing.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 200,
            select: {
              id: true,
              title: true,
              slug: true,
              type: true,
              coverImage: true,
              logo: true,
              avgRating: true,
              views: true,
              isFeatured: true,
              phone: true,
              secondaryPhone: true,
              whatsapp: true,
              categoryId: true,
              villageId: true,
              category: { select: { id: true, name: true, slug: true, icon: true } },
              village: { select: { id: true, name: true, slug: true } },
            },
          }),
        [],
      ),
      safeDbQuery(() => prisma.listing.count({ where }), 0),
    ])

    // Merge offline items
    const map = new Map<string, any>()
    if (Array.isArray(dbListings)) {
      dbListings.forEach((item) => item?.id && map.set(item.id, item))
    }
    const offlineList = getOfflineListings().filter((l) => l.status === 'APPROVED' || !l.status)
    if (Array.isArray(offlineList)) {
      offlineList.forEach((item) => {
        if (item?.id) {
          let cat = item.category
          if (!cat || !cat.name) {
            const foundCat = STANDARD_CATEGORIES.find((c) => c.id === item.categoryId || c.slug === item.categoryId) || STANDARD_CATEGORIES[0]
            cat = { id: foundCat.id, name: foundCat.name, slug: foundCat.slug, icon: foundCat.icon }
          }
          let vil = item.village
          if (!vil || !vil.name) {
            const foundVil = STANDARD_VILLAGES.find((v) => v.id === item.villageId || v.slug === item.villageId) || STANDARD_VILLAGES[0]
            vil = { id: foundVil.id, name: foundVil.name, slug: foundVil.slug }
          }
          map.set(item.id, {
            ...item,
            category: cat,
            village: vil,
            status: item.status || 'APPROVED',
          })
        }
      })
    }

    let allListings = Array.from(map.values())

    // Apply filters
    if (type && type !== 'ALL') {
      allListings = allListings.filter((l) => (l.type || 'BUSINESS').toUpperCase() === type.toUpperCase())
    }
    if (category && category !== 'all') {
      allListings = allListings.filter((l) => l.category?.slug === category || l.categoryId === category)
    }
    if (village && village !== 'all') {
      allListings = allListings.filter((l) => l.village?.slug === village || l.villageId === village)
    }
    if (q) {
      allListings = allListings.filter((l) =>
        l.title?.toLowerCase().includes(q) ||
        l.phone?.includes(q) ||
        l.village?.name?.toLowerCase().includes(q)
      )
    }

    const total = allListings.length
    const paginated = allListings.slice(skip, skip + limit)
    const totalPages = Math.ceil(total / limit)
    const hasMore = page < totalPages

    return NextResponse.json({
      ok: true,
      listings: paginated,
      total,
      page,
      limit,
      totalPages,
      hasMore,
    })
  } catch (err) {
    console.error('[PublicListingsAPI] GET error:', err)
    return NextResponse.json({ ok: false, listings: [], total: 0, hasMore: false }, { status: 500 })
  }
}
