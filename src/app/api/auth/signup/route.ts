import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth-password-reset'

export const runtime = 'nodejs'
export const revalidate = 3600

const SignupSchema = z.object({
  name: z.string().min(1, 'Full name is required').max(80),
  phone: z.string().min(4, 'Valid phone number or email is required').optional(),
  identifier: z.string().min(4, 'Valid phone number or email is required').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(72),
})

/** Auto-generate a clean, unique username from name or phone. */
function buildAutoUsername(name: string, phone: string): string {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '')
  const base = cleanName.length >= 3 ? cleanName.slice(0, 15) : 'user'
  const suffix = Math.floor(1000 + Math.random() * 9000)
  return `${base}_${suffix}`
}

/** POST /api/auth/signup — register with Name, Phone, and Password. */
export async function POST(request: NextRequest) {
  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 })
  }

  const parsed = SignupSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input details provided.' },
      { status: 400 },
    )
  }

  const { name, password } = parsed.data
  const rawContact = (parsed.data.phone || parsed.data.identifier || '').trim()

  if (!rawContact) {
    return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 })
  }

  const isEmail = rawContact.includes('@')
  const email = isEmail ? rawContact.toLowerCase() : undefined
  const phone = isEmail ? undefined : rawContact
  const phoneClean = phone ? phone.replace(/[^\d+]/g, '') : undefined

  try {
    // Uniqueness checks
    if (email) {
      const exists = await prisma.user.findUnique({ where: { email } })
      if (exists) {
        return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 })
      }
    }

    if (phone) {
      const exists = await prisma.user.findFirst({
        where: {
          OR: [
            { phone },
            ...(phoneClean ? [{ phone: phoneClean }] : []),
            { email: `${phoneClean || phone}@phone.local` },
          ],
        },
      })
      if (exists) {
        return NextResponse.json({ error: 'An account with this phone number already exists.' }, { status: 409 })
      }
    }

    // Auto-generate unique username handle (guarantee unique with retry loop)
    let autoUsername = buildAutoUsername(name, phoneClean || rawContact)
    let attempts = 0
    while (attempts < 5) {
      const existingUser = await prisma.user.findUnique({ where: { username: autoUsername } })
      if (!existingUser) break
      autoUsername = buildAutoUsername(name, phoneClean || rawContact)
      attempts++
    }

    const passwordHash = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email ?? `${phoneClean || phone}@phone.local`,
        phone: phone ?? null,
        username: autoUsername,
        passwordHash,
        role: 'USER',
        villageId: null, // Default to null; user can select in profile later
      },
      select: { id: true, email: true, username: true, name: true, phone: true },
    })

    return NextResponse.json({ ok: true, user }, { status: 201 })
  } catch (err: any) {
    console.error('[SignupAPI] Error during signup:', err)
    if (err?.code === 'P2002') {
      const target = err?.meta?.target
      if (Array.isArray(target) && target.includes('email')) {
        return NextResponse.json({ error: 'An account with this email/phone already exists.' }, { status: 409 })
      }
      if (Array.isArray(target) && target.includes('phone')) {
        return NextResponse.json({ error: 'An account with this phone number already exists.' }, { status: 409 })
      }
    }
    return NextResponse.json(
      { error: err?.message || 'Failed to create account. Please try again.' },
      { status: 500 },
    )
  }
}
