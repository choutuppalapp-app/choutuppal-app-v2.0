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
  villageId: z.string().optional(),
})

/** POST /api/auth/signup — register with email-or-phone + password. */
export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  // Automatic Username Sanitization (lower-case, remove spaces & special characters)
  if (body && typeof body.username === 'string' && body.username.trim()) {
    const sanitized = body.username.toLowerCase().trim().replace(/[^a-z0-9_.]/g, '')
    if (!sanitized || sanitized.length < 3) {
      return NextResponse.json(
        { error: 'Username must contain at least 3 valid characters (letters, numbers, underscores, or dots).' },
        { status: 400 },
      )
    }
    body.username = sanitized
  }

  const parsed = SignupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input details provided.' },
      { status: 400 },
    )
  }
  const { name, identifier, password, username, villageId } = parsed.data
  const key = identifier.trim()
  const isEmail = key.includes('@')

  const email = isEmail ? key.toLowerCase() : undefined
  const phone = isEmail ? undefined : key

  try {
    // Uniqueness checks
    if (email) {
      const exists = await prisma.user.findUnique({ where: { email } })
      if (exists) {
        return NextResponse.json({ error: 'This email address is already registered.' }, { status: 409 })
      }
    }
    if (phone) {
      const exists = await prisma.user.findFirst({
        where: {
          OR: [{ phone }, { email: `${phone}@phone.local` }],
        },
      })
      if (exists) {
        return NextResponse.json({ error: 'This phone number is already registered.' }, { status: 409 })
      }
    }
    if (username) {
      const exists = await prisma.user.findUnique({ where: { username } })
      if (exists) {
        return NextResponse.json({ error: 'This username is already taken. Please choose another.' }, { status: 409 })
      }
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name,
        email: email ?? `${phone}@phone.local`,
        phone: phone ?? null,
        username: username ?? null,
        passwordHash,
        role: 'USER',
        villageId: villageId ?? null,
      },
      select: { id: true, email: true, username: true, name: true },
    })

    return NextResponse.json({ ok: true, user }, { status: 201 })
  } catch (err: any) {
    console.error('[SignupAPI] Error during signup:', err)
    if (err?.code === 'P2002') {
      const target = err?.meta?.target
      if (Array.isArray(target) && target.includes('email')) {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
      }
      if (Array.isArray(target) && target.includes('phone')) {
        return NextResponse.json({ error: 'An account with this phone number already exists.' }, { status: 409 })
      }
      if (Array.isArray(target) && target.includes('username')) {
        return NextResponse.json({ error: 'This username is already taken.' }, { status: 409 })
      }
    }
    return NextResponse.json(
      { error: err?.message || 'Failed to create account. Please try again.' },
      { status: 500 },
    )
  }
}
