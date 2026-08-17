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
    const { templateText, options, audience } = body // audience: 'all' | 'business_owner' | 'customer'

    if (!templateText) {
      return NextResponse.json({ error: 'Template text is required' }, { status: 400 })
    }

    const whereClause =
      audience === 'business_owner'
        ? { userType: 'business_owner' }
        : audience === 'customer'
        ? { userType: 'customer' }
        : {}

    const contacts = await prisma.whatsAppContact.findMany({
      where: whereClause,
      select: { phone: true, name: true },
      take: 200,
    })

    if (contacts.length === 0) {
      return NextResponse.json({ error: 'No contacts found for selected audience' }, { status: 404 })
    }

    // Process bulk send asynchronously in sequence with 2s delay
    let successCount = 0
    for (const c of contacts) {
      const cleanPhone = c.phone.replace(/\D/g, '')
      if (cleanPhone) {
        const personalizedText = templateText.replace(/\[Name\]/g, c.name || 'మిత్రమా')
        const res = await sendWhatsAppMessage(cleanPhone, personalizedText, options || {})
        if (res.ok) successCount++
        // 2 second delay between calls to respect WhatsApp API rate limits
        await new Promise((r) => setTimeout(r, 2000))
      }
    }

    return NextResponse.json({
      ok: true,
      total: contacts.length,
      successCount,
      message: `Bulk promotion sent to ${successCount} out of ${contacts.length} contacts!`,
    })
  } catch (err) {
    console.error('[CRM Bulk Send API] Error:', err)
    return NextResponse.json({ error: 'Failed to process bulk send' }, { status: 500 })
  }
}
