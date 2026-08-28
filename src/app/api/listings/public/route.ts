import { NextRequest, NextResponse } from 'next/server'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { getCurrentTenant, getTenantWhereClause } from '@/lib/tenant'

export const runtime = 'nodejs'
export const revalidate = 3600

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
    const q = searchParams.get('q')?.trim()

    const where: any = {
      ...tenantFilter,
      status: 'APPROVED',
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
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

    const [listings, total] = await Promise.all([
      safeDbQuery(
        () =>
          prisma.listing.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
            select: {
              id: true,
              title: true,
              slug: true,
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

    const totalPages = Math.ceil(total / limit)
    const hasMore = page < totalPages

    return NextResponse.json({
      ok: true,
      listings,
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
