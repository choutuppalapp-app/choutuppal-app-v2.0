import { prisma } from '@/lib/prisma'
import type { User } from '@prisma/client'

/** Fetch everything the dashboard needs in one pass (for the server component). */
export async function getDashboardData(user: User) {
  const [listings, realEstates, banners, stories, villages, categories, communityPosts] =
    await Promise.all([
      prisma.listing.findMany({
        where: { ownerId: user.id },
        orderBy: { createdAt: 'desc' },
        include: { category: true, village: true },
      }),
      prisma.realEstate.findMany({
        where: { ownerId: user.id },
        orderBy: { createdAt: 'desc' },
        include: { village: true },
      }),
      prisma.banner.findMany({
        where: { ownerId: user.id },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.story.findMany({
        where: { ownerId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { storyViews: true, storyReplies: true, storyLikes: true } },
        },
      }),
      prisma.village.findMany({ orderBy: { name: 'asc' } }),
      prisma.category.findMany({ orderBy: { name: 'asc' } }),
      prisma.communityPost.findMany({
        where: { authorId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { comments: true, likesRel: true } },
        },
      }),
    ])

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
