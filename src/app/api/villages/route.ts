import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/villages — public list of all villages (for signup + listing forms). */
export async function GET() {
  const villages = await prisma.village.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, slug: true },
  })
  return NextResponse.json({ ok: true, villages })
}
