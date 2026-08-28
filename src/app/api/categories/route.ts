export const revalidate = 3600;
import { safeDbQuery } from '@/lib/prisma';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'



/** GET /api/categories — public list of all categories. */
export async function GET() {
  try {
    const categories = (await (async () => { try { return await prisma.category.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, icon: true, description: true },
    }); } catch(e) { return [] as any; } })())
    return NextResponse.json(
      { ok: true, categories, data: categories },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    )
  } catch (err) {
    console.error('[CategoriesAPI] Error fetching categories:', err)
    return NextResponse.json(
      { ok: true, categories: [], data: [] },
      { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    )
  }
}