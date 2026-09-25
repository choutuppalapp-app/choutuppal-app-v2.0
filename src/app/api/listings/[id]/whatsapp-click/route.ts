import { NextRequest, NextResponse } from 'next/server'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { getOfflineListingById, getOfflineListingBySlug, saveOfflineListing } from '@/lib/offline-data'
import { emitRealtimeNotification } from '@/lib/realtime-events'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/listings/[id]/whatsapp-click
 * Records a visitor's WhatsApp click on a listing and notifies the owner in real-time.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params
    const id = decodeURIComponent(rawId || '').trim()

    if (!id) {
      return NextResponse.json({ error: 'Missing listing identifier' }, { status: 400 })
    }

    const body = await request.json().catch(() => ({}))

    // 1. Find the target listing from DB or offline store
    let listing: any = null

    try {
      listing = await prisma.listing.findFirst({
        where: {
          OR: [{ id }, { slug: id }],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          ownerId: true,
          whatsappClicks: true,
          clicks: true,
        },
      })
    } catch {
      // Prisma error fallback
    }

    if (!listing) {
      listing = getOfflineListingById(id) || getOfflineListingBySlug(id)
    }

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 })
    }

    const listingId = listing.id
    const listingTitle = listing.title || body.title || 'Your Listing'
    const ownerId = listing.ownerId || listing.owner?.id

    // 2. Increment WhatsApp click counts
    let updatedClicks = (listing.whatsappClicks || 0) + 1

    try {
      const updated = await prisma.listing.update({
        where: { id: listingId },
        data: {
          whatsappClicks: { increment: 1 },
          clicks: { increment: 1 },
        },
        select: { whatsappClicks: true },
      })
      if (updated?.whatsappClicks) {
        updatedClicks = updated.whatsappClicks
      }
    } catch {
      // DB update fallback
    }

    // Also update offline store if listing is in offline store
    try {
      const offlineItem = getOfflineListingById(listingId) || getOfflineListingBySlug(listing.slug)
      if (offlineItem) {
        offlineItem.whatsappClicks = (offlineItem.whatsappClicks || 0) + 1
        offlineItem.clicks = (offlineItem.clicks || 0) + 1
        saveOfflineListing(offlineItem)
      }
    } catch {}

    // 3. Create persistent Notification & Dispatch Real-Time Toast Event to Owner
    let notificationPayload: any = null

    if (ownerId) {
      const notifId = `notif_wa_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
      const nowIso = new Date().toISOString()
      const title = '💬 New WhatsApp Inquiry!'
      const message = `Someone just clicked your WhatsApp button on "${listingTitle}". Get ready for a customer message!`
      const link = `/dashboard?tab=listings`

      // Try creating in Prisma DB
      try {
        await safeDbQuery(
          () =>
            prisma.notification.create({
              data: {
                id: notifId,
                type: 'WHATSAPP_CLICK',
                title,
                message,
                link,
                isRead: false,
                userId: ownerId,
              },
            }),
          null
        )
      } catch (e) {
        console.warn('[WhatsApp Click] Notification DB creation error:', e)
      }

      notificationPayload = {
        id: notifId,
        userId: ownerId,
        type: 'WHATSAPP_CLICK',
        title,
        message,
        link,
        isRead: false,
        createdAt: nowIso,
        listingId,
        listingTitle,
        whatsappClicks: updatedClicks,
      }

      // 4. Emit live event via SSE
      emitRealtimeNotification(ownerId, notificationPayload)
    }

    return NextResponse.json({
      ok: true,
      listingId,
      listingTitle,
      whatsappClicks: updatedClicks,
      ownerId: ownerId || null,
      notification: notificationPayload,
    })
  } catch (err) {
    console.error('[WhatsApp Click] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
