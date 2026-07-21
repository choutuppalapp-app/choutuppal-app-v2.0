import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TTL_HOURS = 24

const CreateSchema = z.object({
  imageUrl: z.string().min(1),
  title: z.string().optional(),
  link: z.string().optional(),
  position: z.enum(['HOME_TOP', 'HOME_MIDDLE', 'SIDEBAR']).default('HOME_TOP'),
})

/** POST /api/banners — create a banner ad that auto-expires in 24h. */
export async function POST(request: NextRequest) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }

  const expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000)
  const banner = await prisma.banner.create({
    data: { ...parsed.data, expiresAt, ownerId: auth.user.id },
  })
  return NextResponse.json({ ok: true, banner }, { status: 201 })
}

/** GET /api/banners — current user's banners. */
export async function GET() {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const banners = await prisma.banner.findMany({
    where: { ownerId: auth.user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ ok: true, banners })
}
