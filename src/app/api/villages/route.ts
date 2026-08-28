export const revalidate = 3600;
import { safeDbQuery } from '@/lib/prisma';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'



/** GET /api/villages — public list of all villages (for signup + listing forms). */
export async function GET() {
  try {
    const villages = (await (async () => { try { return await prisma.village.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, district: true, pincode: true },
    }); } catch(e) { return [] as any; } })())
    return NextResponse.json(
      { ok: true, villages, data: villages },
      { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    )
  } catch (err) {
    console.error('[VillagesAPI] Error fetching villages:', err)
    return NextResponse.json(
      { ok: true, villages: [], data: [] },
      { status: 200, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0' } }
    )
  }
}