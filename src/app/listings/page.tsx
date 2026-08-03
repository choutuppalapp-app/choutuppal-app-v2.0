import type { Metadata } from 'next'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { ExploreGrid } from '@/components/explore/explore-grid'

export const dynamic = 'force-dynamic'

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

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
          },
          orderBy: { createdAt: 'desc' },
          include: {
            category: { select: { name: true, slug: true } },
            village: { select: { name: true, slug: true } },
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
          },
          orderBy: { createdAt: 'desc' },
          include: { village: { select: { name: true, slug: true } } },
        }),
      [],
    ),
    safeDbQuery(() => prisma.village.findMany({ orderBy: { name: 'asc' } }), []),
    safeDbQuery(() => prisma.category.findMany({ orderBy: { name: 'asc' } }), []),
  ])

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-amber-950 text-white py-10 px-4 text-center">
        <h1 className="text-2xl sm:text-4xl font-black">All Listings & Services</h1>
        <p className="text-sm text-slate-300 mt-2 max-w-xl mx-auto">
          Discover trusted local businesses, service providers, and real estate properties across Choutuppal.
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
