import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { resetPassword } from '@/lib/auth-password-reset'

export const runtime = 'nodejs'
export const revalidate = 3600

const Schema = z.object({
  token: z.string().min(16),
  password: z.string().min(6).max(72),
})

/** POST /api/auth/reset-password — consume a reset token and set a new password. */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  const ok = await resetPassword(parsed.data.token, parsed.data.password)
  if (!ok) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 })
  }
  return NextResponse.json({ ok: true })
}
