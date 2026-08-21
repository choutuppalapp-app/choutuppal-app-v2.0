import { prisma, safeDbQuery } from '@/lib/prisma'
import { getCurrentTenant, getTenantWhereClause } from '@/lib/tenant'

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
  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)
  return safeDbQuery(
    () =>
      prisma.banner.findMany({
        where: { ...tenantFilter, expiresAt: { gt: new Date() }, status: 'APPROVED' },
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
  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)
  return safeDbQuery(
    () =>
      prisma.listing.findMany({
        where: {
          ...tenantFilter,
          status: 'APPROVED',
          isFeatured: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          logo: true,
          avgRating: true,
          views: true,
          isFeatured: true,
          villageId: true,
          categoryId: true,
          category: { select: { id: true, name: true, slug: true } },
          village: { select: { id: true, name: true, slug: true } },
        },
      }),
    [],
  )
}

export async function getPremiumRealEstate() {
  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)
  return safeDbQuery(
    () =>
      prisma.realEstate.findMany({
        where: { ...tenantFilter, status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 10,
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
  )
}

export async function getShorts() {
  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)
  return safeDbQuery(
    () =>
      prisma.short.findMany({
        where: tenantFilter,
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
  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)
  return safeDbQuery(
    () =>
      prisma.news.findMany({
        where: { ...tenantFilter, isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
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
  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)
  return safeDbQuery(
    () =>
      prisma.blog.findMany({
        where: { ...tenantFilter, isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
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
