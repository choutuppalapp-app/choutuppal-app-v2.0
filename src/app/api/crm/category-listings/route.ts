import { safeDbQuery } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

export const runtime = 'nodejs'
export const revalidate = 3600

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { phone, categoryId } = body

    if (!phone || !categoryId) {
      return NextResponse.json({ error: 'Phone and Category ID required' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })

    const listings = (await (async () => { try { return await prisma.listing.findMany({
      where: { categoryId, status: 'APPROVED' },
      take: 5,
      select: { title: true, phone: true, whatsapp: true, address: true },
      orderBy: { views: 'desc' },
    }); } catch(e) { return [] as any; } })())

    if (listings.length === 0) {
      return NextResponse.json({ error: 'No approved listings found in this category' }, { status: 404 })
    }

    let messageText = `🏪 చౌటుప్పల్ ${category?.name || 'బిజినెస్'} టాప్ లిస్టింగ్‌లు:\n\n`
    listings.forEach((l, idx) => {
      messageText += `${idx + 1}. ${l.title}\n`
      if (l.phone || l.whatsapp) messageText += `   📞 ${l.phone || l.whatsapp}\n`
      if (l.address) messageText += `   📍 ${l.address}\n`
      messageText += '\n'
    })
    messageText += 'మరిన్ని వివరాల కోసం: https://choutuppal.in/listings'

    const res = await sendWhatsAppMessage(cleanPhone, messageText)
    if (!res.ok) {
      return NextResponse.json({ error: res.error || 'Failed to send category listings' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: res.data })
  } catch (err) {
    console.error('[CRM Category Listings API] Error:', err)
    return NextResponse.json({ error: 'Failed to send category listings' }, { status: 500 })
  }
}
