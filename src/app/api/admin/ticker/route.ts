import { NextResponse, NextRequest } from 'next/server'
import { requireApiAdmin } from '@/lib/session'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { invalidateHomeDataCache } from '@/lib/home-data'
import { invalidateCache } from '@/lib/cache'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export interface TickerItem {
  id: string
  text: string
  link?: string
  isActive: boolean
  isUrgent?: boolean
  expiresAt?: string | null
  createdAt?: string
}

export async function GET() {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const setting = await safeDbQuery(
      () => prisma.setting.findUnique({ where: { key: 'ticker_items_json' } }),
      null
    )

    let tickers: TickerItem[] = []
    if (setting?.value) {
      try {
        tickers = JSON.parse(setting.value)
      } catch {
        tickers = []
      }
    }

    return NextResponse.json({ ok: true, tickers })
  } catch (error: any) {
    console.error('[Admin Ticker GET] Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const { text, link, isUrgent = false, expiresAt } = body

    if (!text) {
      return NextResponse.json({ error: 'Ticker text is required' }, { status: 400 })
    }

    const setting = await safeDbQuery(
      () => prisma.setting.findUnique({ where: { key: 'ticker_items_json' } }),
      null
    )

    let tickers: TickerItem[] = DEFAULT_TICKERS
    if (setting?.value) {
      try {
        tickers = JSON.parse(setting.value)
      } catch {
        tickers = DEFAULT_TICKERS
      }
    }

    const newItem: TickerItem = {
      id: `tick_${Date.now()}`,
      text: text.trim(),
      link: link || '',
      isActive: true,
      isUrgent: Boolean(isUrgent),
      expiresAt: expiresAt || null,
      createdAt: new Date().toISOString(),
    }

    tickers.unshift(newItem)

    // Save full JSON
    await safeDbQuery(
      () =>
        prisma.setting.upsert({
          where: { key: 'ticker_items_json' },
          update: { value: JSON.stringify(tickers) },
          create: { key: 'ticker_items_json', value: JSON.stringify(tickers) },
        }),
      null
    )

    // Also update classic announcement_ticker for home page marquee
    const activeText = tickers
      .filter((t) => t.isActive)
      .map((t) => t.text)
      .join(' | ')

    await safeDbQuery(
      () =>
        prisma.setting.upsert({
          where: { key: 'announcement_ticker' },
          update: { value: activeText },
          create: { key: 'announcement_ticker', value: activeText },
        }),
      null
    )

    invalidateHomeDataCache()
    try { revalidatePath('/') } catch {}

    return NextResponse.json({ ok: true, tickers, item: newItem, message: 'Ticker item added' })
  } catch (error: any) {
    console.error('[Admin Ticker POST] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to add ticker' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const { id, isActive, text, link, isUrgent, reorderedItems } = body

    let tickers: TickerItem[] = []

    if (Array.isArray(reorderedItems)) {
      tickers = reorderedItems
    } else {
      const setting = await safeDbQuery(
        () => prisma.setting.findUnique({ where: { key: 'ticker_items_json' } }),
        null
      )
      if (setting?.value) {
        try {
          tickers = JSON.parse(setting.value)
        } catch {
          tickers = []
        }
      } else {
        tickers = []
      }

      if (id) {
        const idx = tickers.findIndex((t) => t.id === id)
        if (idx >= 0) {
          if (isActive !== undefined) tickers[idx].isActive = Boolean(isActive)
          if (text !== undefined) tickers[idx].text = text
          if (link !== undefined) tickers[idx].link = link
          if (isUrgent !== undefined) tickers[idx].isUrgent = Boolean(isUrgent)
        }
      }
    }

    // Save JSON
    await safeDbQuery(
      () =>
        prisma.setting.upsert({
          where: { key: 'ticker_items_json' },
          update: { value: JSON.stringify(tickers) },
          create: { key: 'ticker_items_json', value: JSON.stringify(tickers) },
        }),
      null
    )

    // Sync classic announcement_ticker
    const activeText = tickers
      .filter((t) => t.isActive)
      .map((t) => t.text)
      .join(' | ')

    await safeDbQuery(
      () =>
        prisma.setting.upsert({
          where: { key: 'announcement_ticker' },
          update: { value: activeText },
          create: { key: 'announcement_ticker', value: activeText },
        }),
      null
    )

    invalidateHomeDataCache()
    invalidateCache('app_settings_')
    try { revalidatePath('/') } catch {}

    return NextResponse.json({ ok: true, tickers, message: 'Ticker updated' })
  } catch (error: any) {
    console.error('[Admin Ticker PATCH] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update ticker' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Ticker ID is required' }, { status: 400 })
    }

    const setting = await safeDbQuery(
      () => prisma.setting.findUnique({ where: { key: 'ticker_items_json' } }),
      null
    )

    let tickers: TickerItem[] = []
    if (setting?.value) {
      try {
        tickers = JSON.parse(setting.value)
      } catch {
        tickers = []
      }
    }

    tickers = tickers.filter((t) => t.id !== id)

    await safeDbQuery(
      () =>
        prisma.setting.upsert({
          where: { key: 'ticker_items_json' },
          update: { value: JSON.stringify(tickers) },
          create: { key: 'ticker_items_json', value: JSON.stringify(tickers) },
        }),
      null
    )

    const activeText = tickers
      .filter((t) => t.isActive)
      .map((t) => t.text)
      .join(' | ')

    await safeDbQuery(
      () =>
        prisma.setting.upsert({
          where: { key: 'announcement_ticker' },
          update: { value: activeText },
          create: { key: 'announcement_ticker', value: activeText },
        }),
      null
    )

    invalidateHomeDataCache()
    invalidateCache('app_settings_')
    try { revalidatePath('/') } catch {}

    return NextResponse.json({ ok: true, tickers, message: 'Ticker deleted' })
  } catch (error: any) {
    console.error('[Admin Ticker DELETE] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete ticker' }, { status: 500 })
  }
}
