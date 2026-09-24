import type { Metadata } from 'next'
import { cache } from 'react'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { ExploreGrid } from '@/components/explore/explore-grid'

export const dynamic = 'force-dynamic'

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Explore | Choutuppal App',
  description: 'Browse businesses, services, and real estate across Choutuppal mandal.',
  alternates: { canonical: `${SITE_URL}/explore` },
}

const getExplorePageData = cache(async (category?: string, village?: string, q?: string) => {
  const [listings, realEstates, villages, categories] = await Promise.all([
    safeDbQuery(
      () =>
        prisma.listing.findMany({
          where: {
            status: 'APPROVED',
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
          take: 500,
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
    safeDbQuery(
      () =>
        prisma.realEstate.findMany({
          where: {
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
          take: 50,
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

  return { listings, realEstates, villages, categories }
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

