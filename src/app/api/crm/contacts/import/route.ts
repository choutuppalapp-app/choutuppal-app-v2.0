import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { csvText, contacts: rawContacts } = body

    let items: Array<{ phone: string; name?: string; type?: string }> = []

    if (Array.isArray(rawContacts)) {
      items = rawContacts
    } else if (typeof csvText === 'string') {
      const lines = csvText.split(/\r?\n/)
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        // Skip header line if present
        if (i === 0 && (line.toLowerCase().includes('phone') || line.toLowerCase().includes('number'))) {
          continue
        }

        const parts = line.split(/[,;\t]+/).map((s) => s.trim().replace(/^["']|["']$/g, ''))
        if (parts.length >= 2) {
          // Check which part is phone number
          const first = parts[0]
          const second = parts[1]
          const third = parts[2] || 'customer'

          if (/\d{5,}/.test(first)) {
            items.push({ phone: first, name: second || 'WhatsApp Contact', type: third })
          } else if (/\d{5,}/.test(second)) {
            items.push({ phone: second, name: first || 'WhatsApp Contact', type: third })
          }
        } else if (parts.length === 1 && /\d{5,}/.test(parts[0])) {
          items.push({ phone: parts[0], name: 'WhatsApp Contact', type: 'customer' })
        }
      }
    }

    if (items.length === 0) {
      return NextResponse.json({ error: 'No valid contacts found in CSV payload' }, { status: 400 })
    }

    let insertedCount = 0
    let updatedCount = 0

    for (const item of items) {
      let digits = item.phone.replace(/\D/g, '')
      if (!digits || digits.length < 5) continue

      if (digits.length === 10) {
        digits = '91' + digits
      }

      const cleanPhone = digits
      const contactName = item.name && item.name !== 'WhatsApp Contact' ? item.name.trim() : 'WhatsApp Contact'
      const userType = item.type && item.type.toLowerCase().includes('business') ? 'business_owner' : 'customer'

      const existing = await prisma.whatsAppContact.findUnique({
        where: { phone: cleanPhone },
      })

      if (existing) {
        await prisma.whatsAppContact.update({
          where: { id: existing.id },
          data: {
            name: contactName !== 'WhatsApp Contact' ? contactName : existing.name,
            userType,
          },
        })
        updatedCount++
      } else {
        await prisma.whatsAppContact.create({
          data: {
            phone: cleanPhone,
            name: contactName,
            userType,
            source: 'csv_import',
            tag: userType === 'business_owner' ? 'Business Owner' : 'General',
          },
        })
        insertedCount++
      }
    }

    return NextResponse.json({
      ok: true,
      total: items.length,
      insertedCount,
      updatedCount,
      message: `Successfully imported ${insertedCount} new contacts (${updatedCount} updated)!`,
    })
  } catch (err) {
    console.error('[CRM Contacts Import API] Error:', err)
    return NextResponse.json({ error: 'Failed to import CSV contacts' }, { status: 500 })
  }
}
