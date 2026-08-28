import { safeDbQuery } from '@/lib/prisma';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const revalidate = 3600

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch all distinct category names from Category table that have listings
    const categories = (await (async () => { try { return await prisma.category.findMany({
      where: {
        listings: {
          some: {}
        }
      },
      select: {
        name: true,
        slug: true
      },
      orderBy: {
        name: 'asc'
      }
    }); } catch(e) { return [] as any; } })())

    return NextResponse.json({
      ok: true,
      categories
    })
  } catch (err) {
    console.error('[CRM Contact Groups GET] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 })
  }
}
