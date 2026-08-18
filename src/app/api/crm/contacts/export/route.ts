import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const contacts = await prisma.whatsAppContact.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        phone: true,
        name: true,
        userType: true,
        tag: true,
        dateOfBirth: true,
      },
    })

    let csvContent = 'phone_number,name,user_type,tag,date_of_birth\n'

    for (const c of contacts) {
      let cleanPhone = c.phone.replace(/\D/g, '')
      if (cleanPhone.length === 10) {
        cleanPhone = '+91' + cleanPhone
      } else if (!cleanPhone.startsWith('+')) {
        cleanPhone = '+' + cleanPhone
      }

      const cleanName = (c.name || 'WhatsApp Contact').replace(/,/g, ' ')
      const cleanType = (c.userType || 'customer').replace(/,/g, ' ')
      const cleanTag = (c.tag || 'General').replace(/,/g, ' ')
      const cleanDob = (c.dateOfBirth || '').replace(/,/g, ' ')

      csvContent += `${cleanPhone},"${cleanName}","${cleanType}","${cleanTag}","${cleanDob}"\n`
    }

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="Choutuppal_CRM_Contacts.csv"',
      },
    })
  } catch (err) {
    console.error('[CRM Contacts Export API] Error:', err)
    return NextResponse.json({ error: 'Failed to export contacts CSV' }, { status: 500 })
  }
}
