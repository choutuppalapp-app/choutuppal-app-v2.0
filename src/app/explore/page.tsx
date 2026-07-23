import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ExploreGrid } from '@/components/explore/explore-grid'

export const dynamic = 'force-dynamic'

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
    prisma.listing.findMany({
      where: {
        status: 'APPROVED',
        ...(params.category && params.category !== 'all'
          ? { category: { slug: params.category } }
          : {}),
        ...(params.village && params.village !== 'all'
          ? { village: { slug: params.village } }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        category: { select: { name: true, slug: true } },
        village: { select: { name: true, slug: true } },
      },
    }),
    prisma.realEstate.findMany({
      where: {
        status: 'APPROVED',
        ...(params.village && params.village !== 'all'
          ? { village: { slug: params.village } }
          : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: { village: { select: { name: true, slug: true } } },
    }),
    prisma.village.findMany({ orderBy: { name: 'asc' } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
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
