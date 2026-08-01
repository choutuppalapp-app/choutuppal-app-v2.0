import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** POST /api/listings/claim — claim a business listing by phone match */
export async function POST(request: NextRequest) {
  try {
    const viewer = await getCurrentUser()
    if (!viewer) {
      return NextResponse.json({ ok: false, error: 'Please log in to claim a business listing.' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const { listingId } = body
    if (!listingId || typeof listingId !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing listingId' }, { status: 400 })
    }

    // Fetch user details from DB to get phone
    const dbUser = await prisma.user.findUnique({
      where: { id: viewer.id },
      select: { id: true, phone: true, email: true },
    })

    if (!dbUser?.phone) {
      return NextResponse.json(
        { ok: false, error: 'Your account does not have a phone number. Please update your profile phone number first.' },
        { status: 400 },
      )
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
    })

    if (!listing) {
      return NextResponse.json({ ok: false, error: 'Listing not found' }, { status: 404 })
    }

    if (listing.ownerId === viewer.id) {
      return NextResponse.json({ ok: true, message: 'You are already the owner of this listing.' })
    }

    // Clean phone digits for comparison
    const cleanUserPhone = dbUser.phone.replace(/\D/g, '').slice(-10)
    const cleanListingPhone = (listing.phone ?? '').replace(/\D/g, '').slice(-10)
    const cleanListingWhatsapp = (listing.whatsapp ?? '').replace(/\D/g, '').slice(-10)

    const isMatch =
      (cleanUserPhone.length >= 10 && cleanUserPhone === cleanListingPhone) ||
      (cleanUserPhone.length >= 10 && cleanUserPhone === cleanListingWhatsapp)

    if (!isMatch) {
      return NextResponse.json(
        {
          ok: false,
          error:
            'Phone number mismatch. The phone number on your account does not match this listing phone number.',
        },
        { status: 400 },
      )
    }

    // Update ownerId
    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: { ownerId: viewer.id },
    })

    return NextResponse.json({
      ok: true,
      message: `Success! ${updated.title} has been linked to your account.`,
    })
  } catch (err) {
    console.error('[ClaimListingAPI] Error:', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to claim listing. Please try again.' },
      { status: 500 },
    )
  }
}
