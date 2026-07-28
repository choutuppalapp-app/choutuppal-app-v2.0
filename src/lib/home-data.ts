import { prisma } from '@/lib/prisma'

/**
 * Server-side data fetchers for the Home page. Each returns plain serializable
 * objects (safe to pass from a Server Component to Client Components as props).
 */

export async function getActiveStories() {
  return prisma.story.findMany({
    where: { expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    take: 12,
    include: { owner: { select: { username: true, name: true, image: true } } },
  })
}

export async function getActiveBanners() {
  return prisma.banner.findMany({
    where: { expiresAt: { gt: new Date() }, status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    take: 6,
  })
}

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    take: 12,
  })
}

export async function getFeaturedListings() {
  return prisma.listing.findMany({
    where: { status: 'APPROVED', isFeatured: true },
    orderBy: { createdAt: 'desc' },
    take: 12,
    include: {
      category: { select: { name: true, slug: true } },
      village: { select: { name: true, slug: true } },
    },
  })
}

export async function getPremiumRealEstate() {
  return prisma.realEstate.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { village: { select: { name: true, slug: true } } },
  })
}

export async function getShorts() {
  return prisma.short.findMany({
    orderBy: { createdAt: 'desc' },
    take: 10,
    include: { owner: { select: { username: true, name: true } } },
  })
}

export async function getVillages() {
  return prisma.village.findMany({ orderBy: { name: 'asc' } })
}

export async function getHomePageData() {
  try {
    const [
      stories,
      banners,
      categories,
      featured,
      realEstate,
      shorts,
      villages,
    ] = await Promise.all([
      getActiveStories().catch((err) => { console.error('[HomeData] stories error:', err); return [] }),
      getActiveBanners().catch((err) => { console.error('[HomeData] banners error:', err); return [] }),
      getCategories().catch((err) => { console.error('[HomeData] categories error:', err); return [] }),
      getFeaturedListings().catch((err) => { console.error('[HomeData] featured error:', err); return [] }),
      getPremiumRealEstate().catch((err) => { console.error('[HomeData] realEstate error:', err); return [] }),
      getShorts().catch((err) => { console.error('[HomeData] shorts error:', err); return [] }),
      getVillages().catch((err) => { console.error('[HomeData] villages error:', err); return [] }),
    ])
    return { stories, banners, categories, featured, realEstate, shorts, villages }
  } catch (err) {
    console.error('[HomeData] getHomePageData failed:', err)
    return { stories: [], banners: [], categories: [], featured: [], realEstate: [], shorts: [], villages: [] }
  }
}

export type HomePageData = Awaited<ReturnType<typeof getHomePageData>>
