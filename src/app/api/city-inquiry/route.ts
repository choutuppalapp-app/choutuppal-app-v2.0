import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const revalidate = 3600

const Schema = z.object({
  name: z.string().min(2).max(80),
  town: z.string().min(2).max(100),
  phone: z.string().min(6).max(20),
})

/**
 * POST /api/city-inquiry
 * Public endpoint: saves a white-label / city expansion inquiry.
 * In production this would also trigger an email/admin notification.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  const inquiry = await prisma.cityInquiry.create({
    data: {
      name: parsed.data.name.trim(),
      town: parsed.data.town.trim(),
      phone: parsed.data.phone.trim(),
    },
  })

  // TODO: trigger email / admin notification here in production.

  return NextResponse.json({ ok: true, inquiry }, { status: 201 })
}
