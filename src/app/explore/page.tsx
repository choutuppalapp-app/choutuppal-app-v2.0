import type { Metadata } from 'next'
import { cache } from 'react'
import { prisma, safeDbQuery } from '@/lib/prisma'
import {
  getOfflineListings,
  getOfflineRealEstates,
  getOfflineCategories,
  getOfflineVillages,
  STANDARD_CATEGORIES,
  STANDARD_VILLAGES,
} from '@/lib/offline-data'
import { ExploreGrid } from '@/components/explore/explore-grid'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Explore | Choutuppal App',
  description: 'Browse businesses, services, and real estate across Choutuppal mandal.',
  alternates: { canonical: `${SITE_URL}/explore` },
}

const getExplorePageData = cache(async (category?: string, village?: string, q?: string) => {
  const [dbListings, dbRealEstates, dbVillages, dbCategories] = await Promise.all([
    safeDbQuery(
      () =>
        prisma.listing.findMany({
          where: {
            status: { in: ['APPROVED', 'ACTIVE'] },
          },
          orderBy: { createdAt: 'desc' },
          take: 1000,
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
            isPremium: true,
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
            status: { in: ['APPROVED', 'ACTIVE'] },
          },
          orderBy: { createdAt: 'desc' },
          take: 200,
          select: {
            id: true,
            title: true,
            slug: true,
            coverImage: true,
            price: true,
            type: true,
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

  // Merge listings
  const offlineListings = getOfflineListings().filter((l) => l.status === 'APPROVED' || l.status === 'ACTIVE' || !l.status)
  const listingMap = new Map<string, any>()
  if (Array.isArray(dbListings)) {
    dbListings.forEach((item: any) => { if (item?.id) listingMap.set(item.id, item) })
  }
  if (Array.isArray(offlineListings)) {
    offlineListings.forEach((item: any) => { if (item?.id) listingMap.set(item.id, item) })
  }
  let mergedListings = Array.from(listingMap.values())

  // Apply filters to listings
  if (category && category !== 'all') {
    mergedListings = mergedListings.filter(
      (l) => l.categoryId === category || l.category?.slug === category || l.category?.id === category
    )
  }
  if (village && village !== 'all') {
    mergedListings = mergedListings.filter(
      (l) => l.villageId === village || l.village?.slug === village || l.village?.id === village
    )
  }
  if (q && q.trim()) {
    const search = q.trim().toLowerCase()
    mergedListings = mergedListings.filter(
      (l) =>
        l.title?.toLowerCase().includes(search) ||
        l.phone?.includes(search) ||
        l.whatsapp?.includes(search) ||
        l.village?.name?.toLowerCase().includes(search) ||
        l.category?.name?.toLowerCase().includes(search)
    )
  }

  // Merge real estates
  const offlineRealEstates = getOfflineRealEstates().filter((r) => r.status === 'APPROVED' || r.status === 'ACTIVE' || !r.status)
  const reMap = new Map<string, any>()
  if (Array.isArray(dbRealEstates)) {
    dbRealEstates.forEach((item: any) => { if (item?.id) reMap.set(item.id, item) })
  }
  if (Array.isArray(offlineRealEstates)) {
    offlineRealEstates.forEach((item: any) => { if (item?.id) reMap.set(item.id, item) })
  }
  let mergedRealEstates = Array.from(reMap.values())

  if (village && village !== 'all') {
    mergedRealEstates = mergedRealEstates.filter(
      (r) => r.villageId === village || r.village?.slug === village || r.village?.id === village
    )
  }
  if (q && q.trim()) {
    const search = q.trim().toLowerCase()
    mergedRealEstates = mergedRealEstates.filter(
      (r) =>
        r.title?.toLowerCase().includes(search) ||
        r.village?.name?.toLowerCase().includes(search) ||
        r.type?.toLowerCase().includes(search)
    )
  }

  const villages = (dbVillages && dbVillages.length > 0) ? dbVillages : STANDARD_VILLAGES
  const categories = (dbCategories && dbCategories.length > 0) ? dbCategories : STANDARD_CATEGORIES

  return { listings: mergedListings, realEstates: mergedRealEstates, villages, categories }
})

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; village?: string; q?: string; tab?: string; type?: string }>
}) {
  const params = await searchParams
  const { listings, realEstates, villages, categories } = await getExplorePageData(
    params.category,
    params.village,
    params.q,
  )

  const initialTab = (params.tab || (params.type === 'SERVICE' ? 'services' : params.type === 'REAL_ESTATE' ? 'realestate' : 'businesses')) as 'businesses' | 'services' | 'realestate'

  return (
    <ExploreGrid
      listings={listings}
      realEstates={realEstates}
      villages={villages}
      categories={categories}
      initialCategory={params.category ?? 'all'}
      initialVillage={params.village ?? 'all'}
      initialQuery={params.q ?? ''}
      initialTab={initialTab}
    />
  )
}

