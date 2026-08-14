import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { sendWhatsAppMessage, WhatsAppMessagePayloadOptions } from '@/lib/whatsapp'

export const dynamic = 'force-dynamic'

/**
 * POST /api/admin/whatsapp/bulk-send — Bulk WhatsApp Campaign Sender (Text, Interactive Buttons, Lists, Templates)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      recipientMode, // 'ALL_USERS' | 'CUSTOM_NUMBERS'
      customPhones,  // string or string[]
      messageText,   // string
      messageType,   // 'text' | 'template' | 'interactive_button' | 'interactive_list'
      headerText,
      footerText,
      templateName,
      templateLanguage,
      buttonType,
      buttons,
      ctaTitle,
      ctaUrl,
      listButtonTitle,
      listSectionTitle,
      listOptions,
    } = body

    if (!messageText && messageType !== 'template') {
      return NextResponse.json({ error: 'Message body text is required.' }, { status: 400 })
    }

    // Determine target phone numbers & user contexts
    let targets: { phone: string; name?: string }[] = []

    if (recipientMode === 'ALL_USERS') {
      const users = await prisma.user.findMany({
        where: {
          phone: { not: null },
          isBanned: false,
        },
        select: { phone: true, name: true },
      })
      targets = users
        .filter((u) => u.phone && u.phone.trim().length > 5)
        .map((u) => ({ phone: u.phone!, name: u.name || 'Valued User' }))
    } else {
      let phoneArray: string[] = []
      if (Array.isArray(customPhones)) {
        phoneArray = customPhones
      } else if (typeof customPhones === 'string') {
        phoneArray = customPhones
          .split(/[\n,;]+/)
          .map((p) => p.trim())
          .filter((p) => p.length > 5)
      }
      targets = phoneArray.map((phone) => ({ phone, name: 'User' }))
    }

    if (targets.length === 0) {
      return NextResponse.json(
        { error: 'No valid phone numbers found for campaign.' },
        { status: 400 },
      )
    }

    const options: WhatsAppMessagePayloadOptions = {
      messageType,
      headerText,
      footerText,
      templateName,
      templateLanguage,
      buttonType,
      buttons,
      ctaTitle,
      ctaUrl,
      listButtonTitle,
      listSectionTitle,
      listOptions,
    }

    let successCount = 0
    let failedCount = 0
    const errors: string[] = []

    // Execute message sends sequentially
    for (const target of targets) {
      // Dynamic variable replacement
      let personalizedText = messageText || ''
      personalizedText = personalizedText.replace(/\{name\}/g, target.name || 'User')
      personalizedText = personalizedText.replace(/\{phone\}/g, target.phone)
      personalizedText = personalizedText.replace(/\{business\}/g, 'Choutuppal App')

      const res = await sendWhatsAppMessage(target.phone, personalizedText, options)
      if (res.ok) {
        successCount++
      } else {
        failedCount++
        if (res.error && !errors.includes(res.error)) {
          errors.push(res.error)
        }
      }
    }

    return NextResponse.json({
      ok: true,
      total: targets.length,
      successCount,
      failedCount,
      errors: errors.slice(0, 5),
    })
  } catch (err) {
    console.error('[Admin WhatsApp Bulk Send] Exception:', err)
    return NextResponse.json({ error: 'Failed to process WhatsApp campaign' }, { status: 500 })
  }
}
