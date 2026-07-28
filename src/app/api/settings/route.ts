import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEFAULTS: Record<string, string> = {
  spin_enabled: 'true',
  pricing_free: 'true',
  banner_free: 'true',
  banner_price: '99',
  announcement_ticker:
    '🪔 Choutuppal App v2.0 is now live — list your business FREE! | 📅 Spin & Win daily rewards | 🏠 List your property free',
  social_instagram: 'https://www.instagram.com/choutuppalapp/',
  social_facebook: 'https://www.facebook.com/Choutuppalapp/',
  social_youtube: 'https://www.youtube.com/@choutuppalapp',
  social_whatsapp_community: 'https://chat.whatsapp.com/Lldpx4K3oECGGTD3ckBgM3',
  social_whatsapp_channel: 'https://whatsapp.com/channel/0029VbAyp614IBhHFXOBXv08',
}

/** GET /api/settings — Returns public settings */
export async function GET() {
  try {
    const rows = await prisma.setting.findMany()
    const settings: Record<string, string> = {}
    for (const r of rows) {
      settings[r.key] = r.value
    }

    // Merge with defaults
    for (const k of Object.keys(DEFAULTS)) {
      if (!(k in settings)) {
        settings[k] = DEFAULTS[k]
      }
    }

    return NextResponse.json({ ok: true, settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ ok: false, error: 'Database error' }, { status: 500 })
  }
}
