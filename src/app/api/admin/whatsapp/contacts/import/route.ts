import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const revalidate = 3600

/**
 * POST /api/admin/whatsapp/contacts/import — Bulk CSV import of contacts
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { contacts, csvText, groupId } = body

    let parsedItems: { name: string; phone: string }[] = []

    if (Array.isArray(contacts)) {
      parsedItems = contacts
    } else if (typeof csvText === 'string') {
      // Basic CSV parser
      const lines = csvText.split(/\r?\n/)
      for (const line of lines) {
        if (!line.trim()) continue
        const parts = line.split(/[,;\t]+/).map((s) => s.trim().replace(/^["']|["']$/g, ''))
        if (parts.length >= 2) {
          const first = parts[0]
          const second = parts[1]
          // Determine which is name and which is phone
          if (/\d{5,}/.test(second)) {
            parsedItems.push({ name: first || 'Contact', phone: second })
          } else if (/\d{5,}/.test(first)) {
            parsedItems.push({ name: second || 'Contact', phone: first })
          }
        } else if (parts.length === 1 && /\d{5,}/.test(parts[0])) {
          parsedItems.push({ name: 'Contact', phone: parts[0] })
        }
      }
    }

    if (parsedItems.length === 0) {
      return NextResponse.json({ error: 'No valid contacts found in CSV payload.' }, { status: 400 })
    }

    let insertedCount = 0
    let updatedCount = 0

    for (const item of parsedItems) {
      const cleanPhone = item.phone.replace(/\D/g, '')
      if (!cleanPhone || cleanPhone.length < 5) continue

      const existing = await prisma.whatsAppContact.findUnique({
        where: { phone: cleanPhone },
      })

      if (existing) {
        await prisma.whatsAppContact.update({
          where: { id: existing.id },
          data: {
            name: item.name && item.name !== 'Contact' ? item.name.trim() : existing.name,
            groups: groupId
              ? {
                  connect: [{ id: groupId }],
                }
              : undefined,
          },
        })
        updatedCount++
      } else {
        await prisma.whatsAppContact.create({
          data: {
            name: (item.name || 'Contact').trim(),
            phone: cleanPhone,
            source: 'csv_import',
            groups: groupId
              ? {
                  connect: [{ id: groupId }],
                }
              : undefined,
          },
        })
        insertedCount++
      }
    }

    return NextResponse.json({
      ok: true,
      total: parsedItems.length,
      insertedCount,
      updatedCount,
    })
  } catch (err) {
    console.error('[Admin WhatsApp Contacts Import] Error:', err)
    return NextResponse.json({ error: 'Failed to import CSV contacts' }, { status: 500 })
  }
}
