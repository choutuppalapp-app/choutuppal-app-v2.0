import type { Metadata } from 'next'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { ExploreGrid } from '@/components/explore/explore-grid'

export const revalidate = 3600

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Explore | Choutuppal App',
  description: 'Browse businesses, services, and real estate across Choutuppal mandal.',
  alternates: { canonical: `${SITE_URL}/explore` },
}

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; village?: string; q?: string }>
}) {
  const params = await searchParams

  const [listings, realEstates, villages, categories] = await Promise.all([
    safeDbQuery(
      () =>
        prisma.listing.findMany({
          where: {
            status: 'APPROVED',
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
    <ExploreGrid
      listings={listings}
      realEstates={realEstates}
      villages={villages}
      categories={categories}
      initialCategory={params.category ?? 'all'}
      initialVillage={params.village ?? 'all'}
      initialQuery={params.q ?? ''}
    />
  )
}
