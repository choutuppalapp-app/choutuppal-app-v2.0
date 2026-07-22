import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiUser } from '@/lib/session'
import { deleteFromR2, keyFromUrl } from '@/lib/r2-storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const Schema = z.object({
  name: z.string().min(1).max(80).optional(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_.]+$/).optional(),
  bio: z.string().max(280).optional(),
  phone: z.string().optional(),
  image: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  isPublic: z.boolean().optional(),
  politicalTag: z.enum(['NONE', 'BJP', 'CONGRESS', 'BRS', 'CPM']).optional(),
})

/** PATCH /api/profile — update the current user's profile. */
export async function PATCH(request: NextRequest) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }
  const data = parsed.data

  // Username uniqueness
  if (data.username) {
    const clash = await prisma.user.findUnique({ where: { username: data.username } })
    if (clash && clash.id !== auth.user.id) {
      return NextResponse.json({ error: 'Username taken' }, { status: 409 })
    }
  }
  // Phone uniqueness
  if (data.phone) {
    const clash = await prisma.user.findUnique({ where: { phone: data.phone } })
    if (clash && clash.id !== auth.user.id) {
      return NextResponse.json({ error: 'Phone already in use' }, { status: 409 })
    }
  }

  // Clean up old media when replaced.
  if (data.image !== undefined && auth.user.image && data.image !== auth.user.image) {
    const k = keyFromUrl(auth.user.image)
    if (k) await deleteFromR2(k).catch(() => {})
  }
  if (data.coverImage !== undefined && auth.user.coverImage && data.coverImage !== auth.user.coverImage) {
    const k = keyFromUrl(auth.user.coverImage)
    if (k) await deleteFromR2(k).catch(() => {})
  }

  const updated = await prisma.user.update({
    where: { id: auth.user.id },
    data,
    select: {
      id: true, name: true, username: true, email: true, phone: true, bio: true,
      image: true, coverImage: true, isPublic: true, role: true, planTier: true,
      politicalTag: true,
    },
  })
  return NextResponse.json({ ok: true, user: updated })
}

/** GET /api/profile — current user's profile. */
export async function GET() {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const user = await prisma.user.findUnique({
    where: { id: auth.user.id },
    select: {
      id: true, name: true, username: true, email: true, phone: true, bio: true,
      image: true, coverImage: true, isPublic: true, role: true, planTier: true,
      politicalTag: true,
      planExpiresAt: true, spinCredits: true, createdAt: true, villageId: true,
    },
  })
  return NextResponse.json({ ok: true, user })
}
