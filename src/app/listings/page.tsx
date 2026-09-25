import type { Metadata } from 'next'
import { cache } from 'react'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { getCurrentTenant, getTenantWhereClause } from '@/lib/tenant'
import { ExploreGrid } from '@/components/explore/explore-grid'
import { swrCache } from '@/lib/cache'
import { FALLBACK_FEATURED_LISTINGS, FALLBACK_REAL_ESTATE } from '@/lib/home-data'
import {
  getOfflineCategories,
  getOfflineVillages,
  getOfflineListings,
  getOfflineRealEstates,
  STANDARD_CATEGORIES,
  STANDARD_VILLAGES,
} from '@/lib/offline-data'

export const dynamic = 'force-dynamic'
export const revalidate = 10

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'https://choutuppal.in').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Listings & Services | Choutuppal App',
  description: 'Explore all approved business listings, real estate properties, and services in Choutuppal.',
  alternates: { canonical: `${SITE_URL}/listings` },
}

const getListingsPageData = cache(async (tenantId: string, category?: string, village?: string, q?: string) => {
  const cacheKey = `listings_page_${tenantId}_${category || 'all'}_${village || 'all'}_${q || ''}`

  return swrCache(
    cacheKey,
    async () => {
      const tenantFilter = getTenantWhereClause(tenantId)

      const [dbListings, dbRealEstates, dbVillages, dbCategories] = await Promise.all([
        safeDbQuery(
          () =>
            prisma.listing.findMany({
              where: {
                ...tenantFilter,
                status: 'APPROVED',
                OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
                ...(category && category !== 'all'
                  ? { category: { slug: category } }
                  : {}),
                ...(village && village !== 'all'
                  ? { village: { slug: village } }
                  : {}),
                ...(q && q.trim()
                  ? {
                      OR: [
                        { title: { contains: q.trim(), mode: 'insensitive' } },
                        { phone: { contains: q.trim(), mode: 'insensitive' } },
                        { secondaryPhone: { contains: q.trim(), mode: 'insensitive' } },
                        { whatsapp: { contains: q.trim(), mode: 'insensitive' } },
                        { village: { name: { contains: q.trim(), mode: 'insensitive' } } },
                      ],
                    }
                  : {}),
              },
              orderBy: { createdAt: 'desc' },
              take: 300,
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
          1,
          30,
          1800
        ),
        safeDbQuery(
          () =>
            prisma.realEstate.findMany({
              where: {
                ...tenantFilter,
                status: 'APPROVED',
                ...(village && village !== 'all'
                  ? { village: { slug: village } }
                  : {}),
                ...(q && q.trim()
                  ? {
                      OR: [
                        { title: { contains: q.trim(), mode: 'insensitive' } },
                        { village: { name: { contains: q.trim(), mode: 'insensitive' } } },
                      ],
                    }
                  : {}),
              },
              orderBy: { createdAt: 'desc' },
              take: 24,
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
          1,
          30,
          1800
        ),
        safeDbQuery(() => prisma.village.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true } }), [], 1, 30, 1500),
        safeDbQuery(() => prisma.category.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true, icon: true } }), [], 1, 30, 1500),
      ])

      // 1. Merge listings from DB and offline store
      const listingsMap = new Map<string, any>()
      if (Array.isArray(dbListings)) {
        dbListings.forEach((item) => item?.id && listingsMap.set(item.id, item))
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
            listingsMap.set(item.id, {
              ...item,
              category: cat,
              village: vil,
              status: item.status || 'APPROVED',
            })
          }
        })
      }
      const mergedListings = Array.from(listingsMap.values())
      const listings = mergedListings.length > 0 ? mergedListings : FALLBACK_FEATURED_LISTINGS

      // 2. Merge Real Estate properties
      const reMap = new Map<string, any>()
      if (Array.isArray(dbRealEstates)) {
        dbRealEstates.forEach((item) => item?.id && reMap.set(item.id, item))
      }
      const offlineRE = getOfflineRealEstates().filter((r) => r.status === 'APPROVED' || !r.status)
      if (Array.isArray(offlineRE)) {
        offlineRE.forEach((item) => {
          if (item?.id) {
            let vil = item.village
            if (!vil || !vil.name) {
              const foundVil = STANDARD_VILLAGES.find((v) => v.id === item.villageId || v.slug === item.villageId) || STANDARD_VILLAGES[0]
              vil = { id: foundVil.id, name: foundVil.name, slug: foundVil.slug }
            }
            reMap.set(item.id, {
              ...item,
              village: vil,
              status: item.status || 'APPROVED',
            })
          }
        })
      }
      const mergedRE = Array.from(reMap.values())
      const realEstates = mergedRE.length > 0 ? mergedRE : FALLBACK_REAL_ESTATE

      const villages = dbVillages && dbVillages.length > 0 ? dbVillages : getOfflineVillages()
      const categories = dbCategories && dbCategories.length > 0 ? dbCategories : getOfflineCategories()

      return { listings, realEstates, villages, categories }
    },
    { ttlMs: 60 * 1000, staleTtlMs: 30 * 60 * 1000 }
  )
})

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; village?: string; q?: string }>
}) {
  const params = await searchParams
  const tenant = await getCurrentTenant()
  const { listings, realEstates, villages, categories } = await getListingsPageData(
    tenant.id,
    params.category,
    params.village,
    params.q,
  )

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


