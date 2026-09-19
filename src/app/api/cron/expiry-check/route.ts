import { safeDbQuery } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CRON_SECRET = process.env.CRON_SECRET || 'choutuppal_cron_secret_2026'

/**
 * GET /api/cron/expiry-check — Daily automated cron task to check:
 * 1. City Partner Tenant subscription expiries (sets status EXPIRED)
 * 2. User Free Listings 30-day expiries (sets status EXPIRED and notifies owner)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const authHeader = request.headers.get('authorization')
    const tokenParam = searchParams.get('token')

    const isAuthorized =
      authHeader === `Bearer ${CRON_SECRET}` ||
      authHeader === CRON_SECRET ||
      tokenParam === CRON_SECRET

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 })
    }

    const now = new Date()

    // --------------------------------------------------------------------------
    // Task 1: Partner City Tenant Subscriptions Expiry
    // --------------------------------------------------------------------------
    const expiredTenants = (await (async () => { try { return await prisma.tenant.findMany({
      where: {
        subscriptionExpiresAt: { lt: now },
        subscriptionStatus: { not: 'EXPIRED' },
      },
    }); } catch(e) { return [] as any; } })())

    let tenantsUpdated = 0
    if (expiredTenants.length > 0) {
      const tenantIds = expiredTenants.map((t) => t.id)
      const res = await prisma.tenant.updateMany({
        where: { id: { in: tenantIds } },
        data: { subscriptionStatus: 'EXPIRED' },
      })
      tenantsUpdated = res.count
    }

    // --------------------------------------------------------------------------
    // Task 2: Free User Listings 30-Day Expiry & Alerts
    // --------------------------------------------------------------------------
    const expiredListings = (await (async () => { try { return await prisma.listing.findMany({
      where: {
        expiresAt: { lt: now },
        status: { not: 'EXPIRED' },
      },
      include: {
        owner: { select: { id: true, name: true, phone: true, email: true } },
      },
    }); } catch(e) { return [] as any; } })())

    let listingsUpdated = 0
    const alertLogs: string[] = []

    if (expiredListings.length > 0) {
      for (const listing of expiredListings) {
        // Mark listing status as EXPIRED
        await prisma.listing.update({
          where: { id: listing.id },
          data: { status: 'EXPIRED' },
        })
        listingsUpdated++

        // Create notification for owner in DB
        if (listing.ownerId) {
          await prisma.notification.create({
            data: {
              userId: listing.ownerId,
              type: 'SYSTEM',
              title: 'లిస్టింగ్ గడువు ముగిసింది (Listing Expired)',
              message: `మీ లిస్టింగ్ "${listing.title}" ఉచిత 30 రోజుల గడువు ముగిసింది. దయచేసి ప్రో ప్లాన్ కి అప్గ్రేడ్ చేయండి.`,
            },
          }).catch(() => {})
        }

        const ownerPhone = listing.owner?.phone || listing.phone
        alertLogs.push(`Listing "${listing.title}" expired (Owner: ${ownerPhone ?? 'N/A'})`)
      }
    }

    return NextResponse.json({
      ok: true,
      timestamp: now.toISOString(),
      summary: {
        tenantsUpdated,
        listingsUpdated,
        alertsSent: alertLogs.length,
      },
      alertLogs,
    })
  } catch (err) {
    console.error('[CronExpiryCheck] Error during expiry processing:', err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Cron execution failed' },
      { status: 500 },
    )
  }
}

export const POST = GET
