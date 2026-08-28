import { safeDbQuery } from '@/lib/prisma';
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
    const { templateText, options, audience, customPhones, payload, campaignName } = body

    if (!templateText) {
      return NextResponse.json({ error: 'Template text is required' }, { status: 400 })
    }

    let contacts: Array<{ phone: string; name?: string | null; userType?: string | null }> = []

    if (Array.isArray(customPhones) && customPhones.length > 0) {
      const cleanList = customPhones.map((p: string) => p.replace(/\D/g, '')).filter(Boolean)
      const dbContacts = (await (async () => { try { return await prisma.whatsAppContact.findMany({
        where: {
          phone: { in: cleanList },
          userType: { not: 'emergency_govt_leader' },
        },
        select: { phone: true, name: true, userType: true },
      }); } catch(e) { return [] as any; } })())

      const foundSet = new Set(dbContacts.map((c) => c.phone))
      contacts = [...dbContacts]
      for (const p of cleanList) {
        if (!foundSet.has(p)) {
          contacts.push({ phone: p, name: 'WhatsApp Contact', userType: 'customer' })
        }
      }
    } else {
      const whereClause: any = {
        userType: { not: 'emergency_govt_leader' },
      }

      if (audience === 'business_owner') {
        whereClause.userType = 'business_owner'
      } else if (audience === 'customer') {
        whereClause.userType = 'customer'
      }

      contacts = (await (async () => { try { return await prisma.whatsAppContact.findMany({
        where: whereClause,
        select: { phone: true, name: true, userType: true },
        take: 500,
      }); } catch(e) { return [] as any; } })())
    }

    // STRICT MARKETING EXCLUSION GUARANTEE: Never send marketing campaigns to Emergency Services, Police, or Govt Officials
    contacts = contacts.filter((c) => c.userType !== 'emergency_govt_leader')

    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No eligible marketing contacts selected for campaign' }, { status: 404 })
    }

    // Extract footer text from payload/options for Smart Footer trick
    const rawFooter = payload?.footer || options?.footerText || ''
    const cleanFooter = typeof rawFooter === 'string' ? rawFooter.trim() : ''

    // Prepare options without separate footerText so WhatsApp API renders bodyText + footerText -> buttons
    const sanitizedOptions = { ...(options || {}), ...(payload || {}) }
    delete sanitizedOptions.footer
    delete sanitizedOptions.footerText

    let successCount = 0
    let failedCount = 0

    for (const c of contacts) {
      const cleanPhone = c.phone.replace(/\D/g, '')
      if (!cleanPhone) continue

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

      // SMART FOOTER TRICK: Append footer to body text if present
      if (cleanFooter) {
        personalizedText = `${personalizedText}\n\n${cleanFooter}`
      }

      const res = await sendWhatsAppMessage(cleanPhone, personalizedText, sanitizedOptions)
      if (res.ok) {
        successCount++
      } else {
        failedCount++
      }

      // 2-second rate limit delay
      await new Promise((r) => setTimeout(r, 2000))
    }

    // Record campaign run in WhatsAppCampaign table
    try {
      await prisma.whatsAppCampaign.create({
        data: {
          name: campaignName || `Broadcast ${new Date().toLocaleDateString()}`,
          messageText: templateText,
          audienceCount: contacts.length,
          successCount,
          failedCount,
          status: 'COMPLETED',
        },
      })
    } catch (campErr) {
      console.warn('[CRM Bulk Send] Failed to record WhatsAppCampaign:', campErr)
    }

    return NextResponse.json({
      ok: true,
      total: contacts.length,
      successCount,
      failedCount,
      message: `Campaign broadcast sent successfully to ${successCount} out of ${contacts.length} recipients!`,
    })
  } catch (err) {
    console.error('[CRM Bulk Send API] Error:', err)
    return NextResponse.json({ error: 'Failed to process bulk campaign send' }, { status: 500 })
  }
}
