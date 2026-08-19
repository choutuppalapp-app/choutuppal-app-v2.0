import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

/**
 * GET /api/crm/contacts — Paginated & searchable CRM contacts
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
    console.error('[CRM Contacts GET] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 })
  }
}
