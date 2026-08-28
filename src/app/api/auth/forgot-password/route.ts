import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createPasswordResetToken } from '@/lib/auth-password-reset'

export const runtime = 'nodejs'
export const revalidate = 3600

const Schema = z.object({ identifier: z.string().min(4) })

/**
 * POST /api/auth/forgot-password
 * Creates a reset token. In production this would email/SMS a link; in this
 * sandbox the token is returned in the response so the flow is testable.
 */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const result = await createPasswordResetToken(parsed.data.identifier)
  // Always respond 200 to avoid user-enumeration, but only return a token in dev.
  if (!result) {
    return NextResponse.json({ ok: true, sent: true })
  }
  const isDev = process.env.NODE_ENV !== 'production'
  return NextResponse.json({
    ok: true,
    sent: true,
    ...(isDev ? { devToken: result.token } : {}),
  })
}
