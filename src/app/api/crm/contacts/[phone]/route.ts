import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phone } = await params
    const cleanPhone = phone.replace(/\D/g, '')
    const body = await request.json()

    const { name, tag, userType, dateOfBirth, anniversary } = body

    const updated = await prisma.whatsAppContact.upsert({
      where: { phone: cleanPhone },
      update: {
        name: name !== undefined ? name : undefined,
        tag: tag !== undefined ? tag : undefined,
        userType: userType !== undefined ? userType : undefined,
        dateOfBirth: dateOfBirth !== undefined ? dateOfBirth : undefined,
        anniversary: anniversary !== undefined ? anniversary : undefined,
      },
      create: {
        phone: cleanPhone,
        name: name || 'WhatsApp Lead',
        tag: tag || 'General',
        userType: userType || 'customer',
        dateOfBirth,
        anniversary,
      },
    })

    return NextResponse.json({ ok: true, contact: updated })
  } catch (err) {
    console.error('[CRM Contact PATCH API] Error:', err)
    return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 })
  }
}
