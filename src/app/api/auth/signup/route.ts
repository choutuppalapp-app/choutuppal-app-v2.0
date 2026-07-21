import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth-password-reset'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SignupSchema = z.object({
  name: z.string().min(1).max(80),
  identifier: z.string().min(4), // email or phone
  password: z.string().min(6).max(72),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_.]+$/).optional(),
})

/** POST /api/auth/signup — register with email-or-phone + password. */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = SignupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }
  const { name, identifier, password, username } = parsed.data
  const key = identifier.trim()
  const isEmail = key.includes('@')

  // Uniqueness checks
  const email = isEmail ? key.toLowerCase() : undefined
  const phone = isEmail ? undefined : key

  if (email) {
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 })
    }
  }
  if (phone) {
    const exists = await prisma.user.findUnique({ where: { phone } })
    if (exists) {
      return NextResponse.json({ error: 'Phone already registered' }, { status: 409 })
    }
  }
  if (username) {
    const exists = await prisma.user.findUnique({ where: { username } })
    if (exists) {
      return NextResponse.json({ error: 'Username taken' }, { status: 409 })
    }
  }

  const passwordHash = await hashPassword(password)
  const user = await prisma.user.create({
    data: {
      name,
      email: email ?? `${phone}@phone.local`, // email is NOT NULL; phone users get a placeholder
      phone: phone ?? null,
      username: username ?? null,
      passwordHash,
      role: 'USER',
    },
    select: { id: true, email: true, username: true, name: true },
  })

  return NextResponse.json({ ok: true, user }, { status: 201 })
}
