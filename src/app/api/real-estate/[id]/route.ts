import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiUser } from '@/lib/session'
import { deleteFromR2, keyFromUrl } from '@/lib/r2-storage'

export const runtime = 'nodejs'
export const revalidate = 3600

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const body = await request.json().catch(() => ({}))
  const existing = await prisma.realEstate.findUnique({ where: { id } })
  if (!existing || existing.ownerId !== auth.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const { id: _id, ownerId: _o, createdAt: _c, updatedAt: _u, ...rest } = body
  const re = await prisma.realEstate.update({ where: { id }, data: rest })
  return NextResponse.json({ ok: true, realEstate: re })
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const { id } = await params
  const existing = await prisma.realEstate.findUnique({ where: { id } })
  if (!existing || existing.ownerId !== auth.user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const keys = [existing.coverImage]
  if (Array.isArray(existing.images)) {
    for (const g of existing.images as unknown[]) keys.push(g as string)
  }
  await Promise.all(keys.filter(Boolean).map((u) => { const k = keyFromUrl(u as string); return k ? deleteFromR2(k).catch(() => {}) : null }))
  await prisma.realEstate.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
