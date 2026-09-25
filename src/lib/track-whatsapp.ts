'use client'

export interface TrackWhatsAppOptions {
  id?: string
  slug?: string
  title?: string
  ownerId?: string
}

/**
 * Triggers tracking when any user clicks a WhatsApp button on a listing.
 * Sends an API request to increment WhatsApp analytics and fires real-time
 * notifications to the listing owner's dashboard.
 */
export async function trackWhatsAppClick(listing: TrackWhatsAppOptions) {
  if (!listing) return

  const targetIdentifier = listing.id || listing.slug
  if (!targetIdentifier) return

  const listingTitle = listing.title || 'Listing'

  // 1. Instant Cross-Tab Broadcast (syncs tabs locally on the same browser)
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      const channel = new BroadcastChannel('choutuppal_realtime_channel')
      channel.postMessage({
        type: 'WHATSAPP_CLICK',
        listingId: listing.id,
        listingSlug: listing.slug,
        listingTitle,
        ownerId: listing.ownerId,
        createdAt: new Date().toISOString(),
      })
      channel.close()
    } catch {}
  }

  // 2. Dispatch in-window custom event for same-page instant listeners
  if (typeof window !== 'undefined') {
    try {
      window.dispatchEvent(
        new CustomEvent('choutuppal:whatsapp_click', {
          detail: {
            listingId: listing.id,
            listingSlug: listing.slug,
            listingTitle,
            ownerId: listing.ownerId,
          },
        })
      )
    } catch {}
  }

  // 3. Server API tracking: updates DB counts & emits Server-Sent Events (SSE) to owner
  try {
    const encodedId = encodeURIComponent(targetIdentifier)
    fetch(`/api/listings/${encodedId}/whatsapp-click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: listingTitle,
      }),
      keepalive: true,
    }).catch((err) => {
      console.warn('[trackWhatsAppClick] Network error:', err)
    })
  } catch (err) {
    console.warn('[trackWhatsAppClick] Failed to post tracking:', err)
  }
}
