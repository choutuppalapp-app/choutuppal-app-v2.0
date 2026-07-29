import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/categories — public list of all categories. */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, icon: true, description: true },
    })
    return NextResponse.json({ ok: true, categories, data: categories })
  } catch (err) {
    console.error('[CategoriesAPI] Error fetching categories:', err)
    return NextResponse.json({ ok: false, categories: [], data: [] }, { status: 500 })
  }
}
