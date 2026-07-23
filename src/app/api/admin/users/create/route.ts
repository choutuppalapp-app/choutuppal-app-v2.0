import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const Schema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6).max(72),
  role: z.enum(['USER', 'AGENT', 'ADMIN']).default('AGENT'),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_.]+$/).optional(),
  isPublic: z.boolean().default(true),
})

/**
 * POST /api/admin/users/create
 * Admin-only: create a new user (typically an Agent) directly.
 * - Password is bcrypt-hashed.
 * - Email must be unique.
 * - Role defaults to AGENT if not specified.
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }
  const { name, email, phone, password, role, username, isPublic } = parsed.data

  // Uniqueness checks
  const emailExists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (emailExists) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
  }
  if (phone) {
    const phoneExists = await prisma.user.findUnique({ where: { phone } })
    if (phoneExists) {
      return NextResponse.json({ error: 'Phone already in use' }, { status: 409 })
    }
  }
  if (username) {
    const usernameExists = await prisma.user.findUnique({ where: { username } })
    if (usernameExists) {
      return NextResponse.json({ error: 'Username taken' }, { status: 409 })
    }
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      phone: phone || null,
      username: username || null,
      passwordHash,
      role,
      isPublic,
      planTier: role === 'AGENT' || role === 'ADMIN' ? 'PRO' : 'FREE',
    },
    select: {
      id: true, name: true, email: true, phone: true, username: true,
      role: true, isPublic: true, planTier: true, createdAt: true,
    },
  })

  return NextResponse.json({ ok: true, user }, { status: 201 })
}
