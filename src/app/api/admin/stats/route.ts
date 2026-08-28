import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

/** GET /api/admin/stats — dashboard statistics. */
export async function GET() {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const now = new Date()
    const [
      totalUsers,
      totalListings,
      pendingListings,
      pendingRealEstate,
      activeBanners,
      activeStories,
      totalProperties,
      bannedUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'PENDING' } }),
      prisma.realEstate.count({ where: { status: 'PENDING' } }),
      prisma.banner.count({ where: { expiresAt: { gt: now } } }),
      prisma.story.count({ where: { expiresAt: { gt: now } } }),
      prisma.realEstate.count(),
      prisma.user.count({ where: { isBanned: true } }),
    ])

    return NextResponse.json({
      ok: true,
      stats: {
        totalUsers,
        totalListings,
        pendingApprovals: pendingListings + pendingRealEstate,
        pendingListings,
        pendingRealEstate,
        activeBanners,
        activeStories,
        totalProperties,
        bannedUsers,
      },
    })
  } catch (err) {
    console.error('[AdminStatsAPI] Error fetching stats:', err)
    return NextResponse.json({
      ok: true,
      stats: {
        totalUsers: 0,
        totalListings: 0,
        pendingApprovals: 0,
        pendingListings: 0,
        pendingRealEstate: 0,
        activeBanners: 0,
        activeStories: 0,
        totalProperties: 0,
        bannedUsers: 0,
      },
    })
  }
}
