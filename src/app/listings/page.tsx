import type { Metadata } from 'next'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { getCurrentTenant, getTenantWhereClause } from '@/lib/tenant'
import { ExploreGrid } from '@/components/explore/explore-grid'

export const revalidate = 3600

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'https://choutuppal.in').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Listings | Choutuppal App',
  description: 'Explore all approved business listings, real estate properties, and services in Choutuppal.',
  alternates: { canonical: `${SITE_URL}/listings` },
}

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; village?: string; q?: string }>
}) {
  const params = await searchParams
  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)

  const [listings, realEstates, villages, categories] = await Promise.all([
    safeDbQuery(
      () =>
        prisma.listing.findMany({
          where: {
            ...tenantFilter,
            status: 'APPROVED',
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
            ...(params.category && params.category !== 'all'
              ? { category: { slug: params.category } }
              : {}),
            ...(params.village && params.village !== 'all'
              ? { village: { slug: params.village } }
              : {}),
            ...(params.q && params.q.trim()
              ? {
                  OR: [
                    { title: { contains: params.q.trim(), mode: 'insensitive' } },
                    { phone: { contains: params.q.trim(), mode: 'insensitive' } },
                    { secondaryPhone: { contains: params.q.trim(), mode: 'insensitive' } },
                    { whatsapp: { contains: params.q.trim(), mode: 'insensitive' } },
                    { village: { name: { contains: params.q.trim(), mode: 'insensitive' } } },
                  ],
                }
              : {}),
          },
          orderBy: { createdAt: 'desc' },
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
    safeDbQuery(
      () =>
        prisma.realEstate.findMany({
          where: {
            ...tenantFilter,
            status: 'APPROVED',
            ...(params.village && params.village !== 'all'
              ? { village: { slug: params.village } }
              : {}),
            ...(params.q && params.q.trim()
              ? {
                  OR: [
                    { title: { contains: params.q.trim(), mode: 'insensitive' } },
                    { village: { name: { contains: params.q.trim(), mode: 'insensitive' } } },
                  ],
                }
              : {}),
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            price: true,
            listingType: true,
            bedrooms: true,
            areaSqft: true,
            villageId: true,
            village: { select: { id: true, name: true, slug: true } },
          },
        }),
      [],
    ),
    safeDbQuery(() => prisma.village.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true } }), []),
    safeDbQuery(() => prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true, icon: true } }), []),
  ])

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-amber-950 text-white py-10 px-4 text-center">
        <h1 className="text-2xl sm:text-4xl font-black">All Listings & Services</h1>
        <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto">
          Discover trusted local businesses, service providers, and real estate properties across {tenant.name}.
        </p>
      </div>

      <ExploreGrid
        listings={listings}
        realEstates={realEstates}
        villages={villages}
        categories={categories}
        initialCategory={params.category ?? 'all'}
        initialVillage={params.village ?? 'all'}
        initialQuery={params.q ?? ''}
      />
    </div>
  )
}
