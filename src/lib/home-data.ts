import { prisma, safeDbQuery } from '@/lib/prisma'

/**
 * Server-side data fetchers for the Home page. Each returns plain serializable
 * objects (safe to pass from a Server Component to Client Components as props).
 */

export async function getActiveStories() {
  return safeDbQuery(
    () =>
      prisma.story.findMany({
        where: { expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
        take: 12,
        include: { owner: { select: { username: true, name: true, image: true } } },
      }),
    [],
  )
}

export async function getActiveBanners() {
  return safeDbQuery(
    () =>
      prisma.banner.findMany({
        where: { expiresAt: { gt: new Date() }, status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    [],
  )
}

export async function getCategories() {
  return safeDbQuery(
    () =>
      prisma.category.findMany({
        orderBy: { name: 'asc' },
        take: 12,
      }),
    [],
  )
}

export async function getFeaturedListings() {
  return safeDbQuery(
    () =>
      prisma.listing.findMany({
        where: { status: 'APPROVED', isFeatured: true },
        orderBy: { createdAt: 'desc' },
        take: 12,
        include: {
          category: { select: { name: true, slug: true } },
          village: { select: { name: true, slug: true } },
        },
      }),
    [],
  )
}

export async function getPremiumRealEstate() {
  return safeDbQuery(
    () =>
      prisma.realEstate.findMany({
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          village: { select: { name: true, slug: true } },
        },
      }),
    [],
  )
}

export async function getShorts() {
  return safeDbQuery(
    () =>
      prisma.short.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          owner: { select: { username: true, name: true } },
        },
      }),
    [],
  )
}

export async function getLatestNews() {
  return safeDbQuery(
    () =>
      prisma.news.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          image: true,
          createdAt: true,
        },
      }),
    [],
  )
}

export async function getLatestBlogs() {
  return safeDbQuery(
    () =>
      prisma.blog.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          createdAt: true,
        },
      }),
    [],
  )
}

export async function getVillages() {
  return safeDbQuery(
    () => prisma.village.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true } }),
    [],
  )
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
      latestNews,
      latestBlogs,
    ] = await Promise.all([
      getActiveStories(),
      getActiveBanners(),
      getCategories(),
      getFeaturedListings(),
      getPremiumRealEstate(),
      getShorts(),
      getVillages(),
      getLatestNews(),
      getLatestBlogs(),
    ])
    return { stories, banners, categories, featured, realEstate, shorts, villages, latestNews, latestBlogs }
  } catch (err) {
    console.error('[HomeData] getHomePageData failed:', err)
    return { stories: [], banners: [], categories: [], featured: [], realEstate: [], shorts: [], villages: [], latestNews: [], latestBlogs: [] }
  }
}

export type HomePageData = Awaited<ReturnType<typeof getHomePageData>>
