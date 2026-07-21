import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiUser } from '@/lib/session'
import { deleteFromR2, keyFromUrl } from '@/lib/r2-storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** PATCH /api/listings/[id] — update the user's own listing. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { id } = await params
  const body = await request.json().catch(() => ({}))

  const existing = await prisma.listing.findUnique({ where: { id } })
  if (!existing || existing.ownerId !== auth.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { id: _id, ownerId: _o, createdAt: _c, updatedAt: _u, ...rest } = body
  const listing = await prisma.listing.update({ where: { id }, data: rest })
  return NextResponse.json({ ok: true, listing })
}

/** DELETE /api/listings/[id] — delete the user's own listing (+ its media). */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireApiUser()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }
  const { id } = await params

  const existing = await prisma.listing.findUnique({ where: { id } })
  if (!existing || existing.ownerId !== auth.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  // Best-effort media cleanup (never block the delete on storage errors).
  const keys = [existing.coverImage, existing.logo]
  if (Array.isArray(existing.gallery)) {
    for (const g of existing.gallery as unknown[]) keys.push(g as string)
  }
  await Promise.all(
    keys.filter(Boolean).map((u) => {
      const k = keyFromUrl(u as string)
      return k ? deleteFromR2(k).catch(() => {}) : null
    }),
  )

  await prisma.listing.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
