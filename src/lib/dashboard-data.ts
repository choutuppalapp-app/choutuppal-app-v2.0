import { prisma, safeDbQuery } from '@/lib/prisma'
import { getOfflineCategories, getOfflineVillages, getOfflineListings } from '@/lib/offline-data'
import type { User } from '@prisma/client'

/** Fetch everything the dashboard needs in one fast pass with instant fallback. */
export async function getDashboardData(user: User) {
  let listings: any[] = []
  let realEstates: any[] = []
  let banners: any[] = []
  let stories: any[] = []
  let villages: any[] = []
  let categories: any[] = []
  let communityPosts: any[] = []

  try {
    const res = await Promise.all([
      safeDbQuery(
        () =>
          prisma.listing.findMany({
            where: { ownerId: user.id },
            orderBy: { createdAt: 'desc' },
            include: { category: true, village: true },
          }),
        []
      ),
      safeDbQuery(
        () =>
          prisma.realEstate.findMany({
            where: { ownerId: user.id },
            orderBy: { createdAt: 'desc' },
            include: { village: true },
          }),
        []
      ),
      safeDbQuery(
        () =>
          prisma.banner.findMany({
            where: { ownerId: user.id },
            orderBy: { createdAt: 'desc' },
          }),
        []
      ),
      safeDbQuery(
        () =>
          prisma.story.findMany({
            where: { ownerId: user.id },
            orderBy: { createdAt: 'desc' },
            include: {
              _count: { select: { storyViews: true, storyReplies: true, storyLikes: true } },
            },
          }),
        []
      ),
      safeDbQuery(
        () => prisma.village.findMany({ orderBy: { name: 'asc' } }),
        []
      ),
      safeDbQuery(
        () => prisma.category.findMany({ orderBy: { name: 'asc' } }),
        []
      ),
      safeDbQuery(
        () =>
          prisma.communityPost.findMany({
            where: { authorId: user.id },
            orderBy: { createdAt: 'desc' },
            include: {
              _count: { select: { comments: true, likesRel: true } },
            },
          }),
        []
      ),
    ])

    listings = res[0] || []
    realEstates = res[1] || []
    banners = res[2] || []
    stories = res[3] || []
    villages = res[4] || []
    categories = res[5] || []
    communityPosts = res[6] || []
  } catch (err) {
    console.error('[DashboardData] Query error:', err)
  }

  // Ensure villages and categories are always populated instantly
  if (!villages || villages.length === 0) {
    villages = getOfflineVillages()
  }
  if (!categories || categories.length === 0) {
    categories = getOfflineCategories()
  }

  // If user has no listings from DB query, also check offline dataset matching their ownerId, username, or phone
  if (listings.length === 0) {
    const allOffline = getOfflineListings()
    const owned = allOffline.filter(
      (l) =>
        (l.ownerId && l.ownerId === user.id) ||
        (l.owner && l.owner.id === user.id) ||
        (user.phone && l.phone === user.phone) ||
        (user.role === 'ADMIN' && l.ownerId === 'cms0du1m40000v32slild2p1s')
    )
    if (owned.length > 0) {
      listings = owned
    }
  }

  // Analytics (aggregated from the user's content)
  const totalViews = listings.reduce((s, l) => s + l.views, 0)
  const totalWhatsappClicks = listings.reduce((s, l) => s + l.whatsappClicks, 0)
  const totalClicks = listings.reduce((s, l) => s + l.clicks, 0)
  // Call clicks = total clicks minus WhatsApp clicks (the rest are call/listing interactions)
  const totalCallClicks = Math.max(0, totalClicks - totalWhatsappClicks)
  const totalListings = listings.length
  const approvedListings = listings.filter((l) => l.status === 'APPROVED').length
  const pendingListings = listings.filter((l) => l.status === 'PENDING').length
  const totalProperties = realEstates.length
  const activeBanners = banners.filter((b) => b.expiresAt > new Date()).length
  const activeStories = stories.filter((s) => s.expiresAt > new Date()).length

  return {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      bio: user.bio,
      image: user.image,
      coverImage: user.coverImage,
      isPublic: user.isPublic,
      role: user.role,
      planTier: user.planTier,
      
      planExpiresAt: user.planExpiresAt ? user.planExpiresAt.toISOString() : null,
      villageId: user.villageId,
      facebookUrl: (user as any).facebookUrl ?? null,
      instagramUrl: (user as any).instagramUrl ?? null,
      youtubeUrl: (user as any).youtubeUrl ?? null,
      twitterUrl: (user as any).twitterUrl ?? null,
    },
    listings,
    realEstates,
    banners,
    stories,
    communityPosts: communityPosts.map(p => ({ ...p, createdAt: p.createdAt.toISOString(), updatedAt: p.updatedAt.toISOString() })),
    villages,
    categories,
    analytics: {
      totalViews,
      totalWhatsappClicks,
      totalCallClicks,
      totalClicks,
      totalListings,
      approvedListings,
      pendingListings,
      totalProperties,
      activeBanners,
      activeStories,
    },
  }
}

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>
