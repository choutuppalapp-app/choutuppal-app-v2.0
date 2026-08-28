import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

const Schema = z.object({
  name: z.string().min(2).max(60),
  slug: z.string().min(2).max(80).regex(/^[a-z0-9-]+$/).optional(),
  icon: z.string().optional(),
})

/** POST /api/admin/content/categories — create a new category. */
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
  const category = await prisma.category.create({ data: { name: d.name, slug, icon: d.icon } })
  return NextResponse.json({ ok: true, category }, { status: 201 })
}
