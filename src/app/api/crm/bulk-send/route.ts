import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { templateText, options, audience, customPhones, payload } = body

    if (!templateText) {
      return NextResponse.json({ error: 'Template text is required' }, { status: 400 })
    }

    let contacts: Array<{ phone: string; name?: string | null; userType?: string | null }> = []

    if (Array.isArray(customPhones) && customPhones.length > 0) {
      // Fetch details for specified custom phone selection
      const cleanList = customPhones.map((p: string) => p.replace(/\D/g, '')).filter(Boolean)
      const dbContacts = await prisma.whatsAppContact.findMany({
        where: { phone: { in: cleanList } },
        select: { phone: true, name: true, userType: true },
      })

      // Include any manual phones that might not be in DB yet
      const foundSet = new Set(dbContacts.map((c) => c.phone))
      contacts = [...dbContacts]
      for (const p of cleanList) {
        if (!foundSet.has(p)) {
          contacts.push({ phone: p, name: 'WhatsApp Contact', userType: 'customer' })
        }
      }
    } else {
      const whereClause =
        audience === 'business_owner'
          ? { userType: 'business_owner' }
          : audience === 'customer'
          ? { userType: 'customer' }
          : {}

      contacts = await prisma.whatsAppContact.findMany({
        where: whereClause,
        select: { phone: true, name: true, userType: true },
        take: 300,
      })
    }

    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts selected for campaign' }, { status: 404 })
    }

    // Process bulk send sequentially with 2s delay
    let successCount = 0

    for (const c of contacts) {
      const cleanPhone = c.phone.replace(/\D/g, '')
      if (!cleanPhone) continue

      // Look up associated business listing for {shop_name}
      let shopName = 'మీ షాప్'
      try {
        const listing = await prisma.listing.findFirst({
          where: {
            OR: [{ phone: cleanPhone }, { whatsapp: cleanPhone }],
          },
          select: { title: true },
        })
        if (listing?.title) {
          shopName = listing.title
        }
      } catch (err) {
        console.warn('[CRM Bulk Send] Listing lookup error:', err)
      }

      // Replace variables {name}, [Name], {shop_name}
      let personalizedText = templateText
        .replace(/\{name\}/gi, c.name || 'మిత్రమా')
        .replace(/\[Name\]/gi, c.name || 'మిత్రమా')
        .replace(/\{shop_name\}/gi, shopName)

      // Merge options & payload for interactive buttons/lists/footer
      const sendOptions = {
        ...(options || {}),
        ...(payload || {}),
      }

      const res = await sendWhatsAppMessage(cleanPhone, personalizedText, sendOptions)
      if (res.ok) successCount++

      // 2-second delay between calls to respect rate limits
      await new Promise((r) => setTimeout(r, 2000))
    }

    return NextResponse.json({
      ok: true,
      total: contacts.length,
      successCount,
      message: `Campaign broadcast sent successfully to ${successCount} out of ${contacts.length} recipients!`,
    })
  } catch (err) {
    console.error('[CRM Bulk Send API] Error:', err)
    return NextResponse.json({ error: 'Failed to process bulk campaign send' }, { status: 500 })
  }
}
