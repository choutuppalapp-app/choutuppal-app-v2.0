import { NextResponse } from 'next/server'
import { requireApiAdmin } from '@/lib/session'
import { prisma, safeDbQuery } from '@/lib/prisma'
import {
  getOfflineListings,
  getOfflineUsers,
  getOfflineNews,
  getOfflineBlogs,
  getOfflineBanners,
} from '@/lib/offline-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    // 1. Fetch live or fallback data
    const [
      dbUsersCount,
      dbListings,
      dbRealEstatesCount,
      dbBanners,
      dbStoriesCount,
      dbNewsCount,
      dbBlogsCount,
      dbShortsCount,
    ] = await Promise.all([
      safeDbQuery(() => prisma.user.count(), null),
      safeDbQuery(
        () =>
          prisma.listing.findMany({
            orderBy: { createdAt: 'desc' },
            take: 20,
            include: {
              category: { select: { id: true, name: true, slug: true } },
              village: { select: { id: true, name: true, slug: true } },
              owner: { select: { id: true, name: true, phone: true, email: true } },
            },
          }),
        null
      ),
      safeDbQuery(() => prisma.realEstate.count(), 0),
      safeDbQuery(() => prisma.banner.findMany({ orderBy: { createdAt: 'desc' } }), null),
      safeDbQuery(() => prisma.story.count(), 0),
      safeDbQuery(() => prisma.news.count(), null),
      safeDbQuery(() => prisma.blog.count(), null),
      safeDbQuery(() => prisma.short.count(), 0),
    ])

    // Fallbacks if DB is empty or during offline fallback
    const offlineListings = getOfflineListings()
    const offlineUsers = getOfflineUsers()
    const offlineNews = getOfflineNews()
    const offlineBlogs = getOfflineBlogs()
    const offlineBanners = getOfflineBanners()

    const totalUsers = dbUsersCount !== null && dbUsersCount !== undefined ? dbUsersCount : offlineUsers.length
    const allListings = dbListings !== null && dbListings !== undefined ? dbListings : offlineListings

    const totalListings = allListings.length
    const pendingListings = allListings.filter((l) => l.status === 'PENDING').length
    const approvedListings = allListings.filter((l) => l.status === 'APPROVED').length
    const premiumListings = allListings.filter((l) => l.isPremium).length
    const featuredListings = allListings.filter((l) => l.isFeatured).length

    const allBanners = dbBanners !== null && dbBanners !== undefined ? dbBanners : offlineBanners
    const activeBanners = allBanners.filter((b) => b.isActive !== false).length

    const totalViews = allListings.reduce((sum, l) => sum + (l.views || 0), 0)
    const totalClicks = allListings.reduce((sum, l) => sum + (l.clicks || 0), 0)
    const totalWhatsappClicks = allListings.reduce((sum, l) => sum + (l.whatsappClicks || 0), 0)

    const recentListings = allListings.slice(0, 8).map((l) => ({
      id: l.id,
      title: l.title,
      slug: l.slug,
      category: l.category?.name || 'General',
      village: l.village?.name || 'Choutuppal',
      phone: l.phone || l.whatsapp || 'N/A',
      status: l.status || 'PENDING',
      isPremium: !!l.isPremium,
      isFeatured: !!l.isFeatured,
      views: l.views || 0,
      createdAt: l.createdAt,
      owner: l.owner ? { name: l.owner.name, phone: l.owner.phone } : null,
    }))

    return NextResponse.json({
      ok: true,
      stats: {
        totalUsers,
        totalListings,
        pendingListings,
        approvedListings,
        premiumListings,
        featuredListings,
        totalRealEstates: dbRealEstatesCount ?? 0,
        activeBanners,
        totalStories: dbStoriesCount ?? 0,
        totalNews: dbNewsCount ?? offlineNews.length,
        totalBlogs: dbBlogsCount ?? offlineBlogs.length,
        totalShorts: dbShortsCount ?? 0,
        totalViews,
        totalClicks,
        totalWhatsappClicks,
        estimatedRevenue: premiumListings * 499 + activeBanners * 99 * 30,
      },
      recentListings,
    })
  } catch (error: any) {
    console.error('[Admin Dashboard API] Error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch admin stats' },
      { status: 500 }
    )
  }
}
