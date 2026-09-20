import { safeDbQuery } from '@/lib/prisma';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEFAULTS: Record<string, string> = {
  spin_enabled: 'true',
  pricing_free: 'true',
  banner_free: 'true',
  ads_paid: 'false',
  banner_price: '99',
  announcement_ticker: '',
  social_instagram: 'https://www.instagram.com/choutuppalapp/',
  social_facebook: 'https://www.facebook.com/Choutuppalapp/',
  social_youtube: 'https://www.youtube.com/@choutuppalapp',
  social_whatsapp_community: 'https://chat.whatsapp.com/ItRGBPJJQSZF6x40IozSJe',
  social_whatsapp_channel: 'https://whatsapp.com/channel/0029VbD28mkGpLHOk8wrLE1a',
}

/** GET /api/settings — Returns public settings */
export async function GET() {
  try {
    const rows = await safeDbQuery(() => prisma.setting.findMany(), [])
    const settings: Record<string, string> = {}
    for (const r of rows) {
      settings[r.key] = r.value
    }

    // If ticker_items_json exists in settings, prioritize it to construct announcement_ticker
    if (settings.ticker_items_json) {
      try {
        const items = JSON.parse(settings.ticker_items_json)
        if (Array.isArray(items)) {
          const activeText = items
            .filter((t: any) => t.isActive !== false)
            .map((t: any) => t.text)
            .join(' | ')
          if (activeText) {
            settings.announcement_ticker = activeText
          }
        }
      } catch {
        // use fallback if corrupted
      }
    }

    // Merge with defaults
    for (const k of Object.keys(DEFAULTS)) {
      if (!(k in settings) || !settings[k]) {
        settings[k] = DEFAULTS[k]
      }
    }

    return NextResponse.json(
      { ok: true, settings },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    )
  } catch (error) {
    console.error('[Settings GET] Error fetching settings, returning defaults:', error)
    return NextResponse.json(
      { ok: true, settings: DEFAULTS },
      { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    )
  }
}
