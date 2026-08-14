import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/whatsapp/contacts — Fetch all contacts with assigned groups
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const groupId = searchParams.get('groupId')

    const whereCondition: any = {}
    if (search) {
      whereCondition.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (groupId) {
      whereCondition.groups = {
        some: { id: groupId },
      }
    }

    const contacts = await prisma.whatsAppContact.findMany({
      where: whereCondition,
      include: {
        groups: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ ok: true, contacts })
  } catch (err) {
    console.error('[Admin WhatsApp Contacts GET] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}

/**
 * POST /api/admin/whatsapp/contacts — Create or update a contact
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phone, groupIds } = body

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone number are required.' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\D/g, '')
    if (!cleanPhone || cleanPhone.length < 5) {
      return NextResponse.json({ error: 'Invalid phone number.' }, { status: 400 })
    }

    const connectGroups = Array.isArray(groupIds)
      ? groupIds.map((id: string) => ({ id }))
      : []

    const contact = await prisma.whatsAppContact.upsert({
      where: { phone: cleanPhone },
      update: {
        name: name.trim(),
        groups: {
          set: connectGroups,
        },
      },
      create: {
        name: name.trim(),
        phone: cleanPhone,
        source: 'manual',
        groups: {
          connect: connectGroups,
        },
      },
      include: { groups: true },
    })

    return NextResponse.json({ ok: true, contact })
  } catch (err) {
    console.error('[Admin WhatsApp Contacts POST] Error:', err)
    return NextResponse.json({ error: 'Failed to save contact' }, { status: 500 })
  }
}
