import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/admin/pending — all Listings + RealEstate with status PENDING. */
export async function GET() {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const [listings, realEstates] = await Promise.all([
    prisma.listing.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        owner: { select: { id: true, name: true, username: true, email: true } },
        category: { select: { name: true } },
        village: { select: { name: true } },
      },
    }),
    prisma.realEstate.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: {
        owner: { select: { id: true, name: true, username: true, email: true } },
        village: { select: { name: true } },
      },
    }),
  ])

  return NextResponse.json({ ok: true, listings, realEstates })
}
