import { safeDbQuery } from '@/lib/prisma';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function cleanPhoneNumber(numStr: string | null | undefined): string | null {
  if (!numStr) return null
  const digits = numStr.replace(/\D/g, '')

  if (digits.length === 10) {
    return `+91${digits}`
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`
  } else if (digits.length > 10) {
    return `+${digits}`
  }
  return null
}

function escapeCsvField(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const listings = (await (async () => { try { return await prisma.listing.findMany({
      select: {
        title: true,
        phone: true,
        whatsapp: true,
      },
    }); } catch(e) { return [] as any; } })())

    const seenPhones = new Set<string>()
    const rows: Array<{ phone: string; title: string }> = []

    for (const item of listings) {
      const title = item.title.trim()

      const cleanPhone = cleanPhoneNumber(item.phone)
      if (cleanPhone && !seenPhones.has(cleanPhone)) {
        seenPhones.add(cleanPhone)
        rows.push({ phone: cleanPhone, title })
      }

      const cleanWa = cleanPhoneNumber(item.whatsapp)
      if (cleanWa && !seenPhones.has(cleanWa)) {
        seenPhones.add(cleanWa)
        rows.push({ phone: cleanWa, title })
      }
    }

    const csvLines = ['phone_number,first_name,last_name']
    for (const row of rows) {
      const escapedTitle = escapeCsvField(row.title)
      csvLines.push(`${row.phone},${escapedTitle},`)
    }

    const csvContent = csvLines.join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="Choutuppal_Meta_Audience.csv"',
      },
    })
  } catch (err) {
    console.error('[Export Meta Audience API] Error:', err)
    return NextResponse.json({ error: 'Failed to generate Meta Audience CSV' }, { status: 500 })
  }
}
