import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const groupId = searchParams.get('groupId')
    const categoryFilter = searchParams.get('category') // dynamic category filter
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50', 10)))
    const skip = (page - 1) * limit

    const whereCondition: any = {}
    
    // Strict Exclusion: Unless explicitly requesting emergency/govt, exclude them.
    if (groupId === 'emergency_govt_leader') {
      whereCondition.userType = 'emergency_govt_leader'
    } else {
      whereCondition.userType = { not: 'emergency_govt_leader' }
    }

    if (search.trim()) {
      const s = search.trim()
      whereCondition.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { phone: { contains: s, mode: 'insensitive' } },
        { tag: { contains: s, mode: 'insensitive' } },
      ]
    }
    
    // Legacy generic groups (if any)
    if (groupId && groupId !== 'all' && groupId !== 'emergency_govt_leader') {
      whereCondition.groups = {
        some: { id: groupId },
      }
    }

    // Dynamic Category Groups (Business Owners)
    if (categoryFilter && categoryFilter !== 'all') {
      // Find phones for listings in this category
      const listings = await prisma.listing.findMany({
        where: { category: { slug: categoryFilter } },
        select: { phone: true, whatsapp: true }
      })
      const phones = new Set<string>()
      for (const l of listings) {
        if (l.phone) phones.add(l.phone.replace(/[^\d+]/g, ''))
        if (l.whatsapp) phones.add(l.whatsapp.replace(/[^\d+]/g, ''))
      }
      
      // Override whereCondition.phone to match these business owners
      whereCondition.phone = { in: Array.from(phones) }
      // It must be a business owner
      whereCondition.userType = 'business_owner'
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
