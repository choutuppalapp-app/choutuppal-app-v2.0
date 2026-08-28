import { safeDbQuery } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const Schema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
})

/** POST /api/listings/[id]/reviews — Submit or update a rating for a listing. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id: listingId } = await params
  const listing = await prisma.listing.findUnique({ where: { id: listingId } })
  if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 })

  const body = await request.json().catch(() => ({}))
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid rating' }, { status: 400 })
  }

  const { rating, comment } = parsed.data

  // Upsert user's review for this listing
  const review = await prisma.review.upsert({
    where: {
      userId_listingId: {
        userId: auth.user.id,
        listingId,
      },
    },
    create: {
      userId: auth.user.id,
      listingId,
      rating,
      comment: comment?.trim() || null,
    },
    update: {
      rating,
      comment: comment?.trim() || null,
    },
  })

  // Calculate new average rating
  const agg = await prisma.review.aggregate({
    where: { listingId },
    _avg: { rating: true },
    _count: { rating: true },
  })

  const avgRating = agg._avg.rating ? parseFloat(agg._avg.rating.toFixed(1)) : rating

  // Update listing avgRating
  await prisma.listing.update({
    where: { id: listingId },
    data: { avgRating },
  })

  return NextResponse.json({
    ok: true,
    review,
    avgRating,
    totalReviews: agg._count.rating,
  })
}

/** GET /api/listings/[id]/reviews — Get reviews for a listing. */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: listingId } = await params
  const reviews = (await (async () => { try { return await prisma.review.findMany({
    where: { listingId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      user: {
        select: { id: true, name: true, username: true, image: true },
      },
    },
  }); } catch(e) { return [] as any; } })())
  return NextResponse.json({ ok: true, reviews })
}
