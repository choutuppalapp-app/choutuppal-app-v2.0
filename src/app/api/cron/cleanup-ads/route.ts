import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const revalidate = 3600
export const maxDuration = 60

export async function GET(req: Request) {
  try {
    const now = new Date()

    // 1. Cleanup expired Stories
    const expiredStories = await prisma.story.updateMany({
      where: {
        expiresAt: { lt: now },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    })

    // 2. Cleanup expired Banners
    const expiredBanners = await prisma.banner.updateMany({
      where: {
        expiresAt: { lt: now },
        isActive: true,
      },
      data: {
        isActive: false,
      },
    })

    return NextResponse.json({
      ok: true,
      message: 'Cleanup successful',
      storiesCleaned: expiredStories.count,
      bannersCleaned: expiredBanners.count,
    })
  } catch (error: any) {
    console.error('[Cron Cleanup Ads] Error:', error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
