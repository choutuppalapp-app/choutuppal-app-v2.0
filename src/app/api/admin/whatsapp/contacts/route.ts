import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const revalidate = 3600

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
    const userType = searchParams.get('userType')
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    const whereCondition: any = {}
    if (search.trim()) {
      const s = search.trim()
      whereCondition.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s, mode: 'insensitive' } },
        { tag: { contains: s, mode: 'insensitive' } },
      ]
    }
    if (groupId && groupId !== 'all') {
      whereCondition.groups = {
        some: { id: groupId },
      }
    }
    if (userType && userType !== 'all') {
      if (userType === 'business_owner') {
        whereCondition.userType = 'business_owner'
      } else if (userType === 'customer') {
        whereCondition.userType = { not: 'business_owner' }
      } else {
        whereCondition.userType = userType
      }
    }

    const [totalCount, contacts] = await Promise.all([
      prisma.whatsAppContact.count({ where: whereCondition }),
      prisma.whatsAppContact.findMany({
        where: whereCondition,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          phone: true,
          userType: true,
          tag: true,
          source: true,
          dateOfBirth: true,
          createdAt: true,
          groups: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
    ])

    const totalPages = Math.ceil(totalCount / limit) || 1

    return NextResponse.json({
      ok: true,
      contacts,
      totalCount,
      totalPages,
      currentPage: page,
    })
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
