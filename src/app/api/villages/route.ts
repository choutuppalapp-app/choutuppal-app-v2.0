import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

/** GET /api/villages — public list of all villages (for signup + listing forms). */
export async function GET() {
  try {
    const villages = await prisma.village.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true, district: true, pincode: true },
    })
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
