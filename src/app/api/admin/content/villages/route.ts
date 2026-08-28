import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

const Schema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/).optional(),
  district: z.string().optional(),
  state: z.string().optional(),
  pincode: z.string().optional(),
})

/** POST /api/admin/content/villages — create a new village. */
export async function POST(request: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const body = await request.json().catch(() => ({}))
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }
  const d = parsed.data
  const slug = d.slug ?? d.name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
  const village = await prisma.village.create({
    data: { name: d.name, slug, district: d.district, state: d.state, pincode: d.pincode },
  })
  return NextResponse.json({ ok: true, village }, { status: 201 })
}
