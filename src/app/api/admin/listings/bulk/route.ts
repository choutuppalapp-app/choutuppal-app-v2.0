import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600
export const maxDuration = 30

async function verifyAdmin() {
  const user = await getCurrentUser()
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
    return false
  }
  return true
}

/**
 * PATCH /api/admin/listings/bulk — Bulk edit / update images for listings
 */
export async function PATCH(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { ids, data } = await req.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ ok: false, error: 'No listing IDs provided' }, { status: 400 })
    }

    if (!data || typeof data !== 'object') {
      return NextResponse.json({ ok: false, error: 'No update data provided' }, { status: 400 })
    }

    // Clean data payload: only include properties that are defined
    const updatePayload: Record<string, any> = {}
    for (const [key, val] of Object.entries(data)) {
      if (val !== undefined && val !== null && val !== '') {
        updatePayload[key] = val
      }
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ ok: false, error: 'No valid fields to update' }, { status: 400 })
    }

    const result = await prisma.listing.updateMany({
      where: { id: { in: ids } },
      data: updatePayload,
    })

    return NextResponse.json({
      ok: true,
      message: `Successfully updated ${result.count} listing(s)`,
      count: result.count,
    })
  } catch (error) {
    console.error('[Bulk Listings PATCH Error]:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Bulk update failed' },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/admin/listings/bulk — Bulk delete listings
 */
export async function DELETE(req: NextRequest) {
  try {
    const isAdmin = await verifyAdmin()
    if (!isAdmin) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { ids } = await req.json()

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ ok: false, error: 'No listing IDs provided' }, { status: 400 })
    }

    const result = await prisma.listing.deleteMany({
      where: { id: { in: ids } },
    })

    return NextResponse.json({
      ok: true,
      message: `Successfully deleted ${result.count} listing(s)`,
      count: result.count,
    })
  } catch (error) {
    console.error('[Bulk Listings DELETE Error]:', error)
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Bulk delete failed' },
      { status: 500 },
    )
  }
}
