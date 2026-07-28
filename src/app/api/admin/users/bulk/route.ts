import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** POST /api/admin/users/bulk — Bulk create users from CSV parser */
export async function POST(request: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  try {
    const body = await request.json().catch(() => ({}))
    const users = body.users
    if (!Array.isArray(users)) {
      return NextResponse.json({ error: 'Expected users to be an array' }, { status: 400 })
    }

    let createdCount = 0
    let skippedCount = 0

    for (const u of users) {
      const email = u.email?.trim().toLowerCase()
      if (!email) {
        skippedCount++
        continue
      }

      // Check if user already exists
      const exists = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            u.phone ? { phone: String(u.phone).trim() } : null,
            u.username ? { username: String(u.username).trim().toLowerCase() } : null,
          ].filter(Boolean) as any,
        },
      })

      if (exists) {
        skippedCount++
        continue
      }

      const passwordHash = await bcrypt.hash(u.password || 'demo1234', 12)
      await prisma.user.create({
        data: {
          email,
          phone: u.phone ? String(u.phone).trim() : null,
          name: u.name?.trim() || null,
          username: u.username?.trim().toLowerCase() || email.split('@')[0],
          role: u.role || 'USER',
          planTier: u.planTier || 'FREE',
          passwordHash,
          isPublic: true,
        },
      })
      createdCount++
    }

    return NextResponse.json({ ok: true, createdCount, skippedCount })
  } catch (error) {
    console.error('Error in bulk import:', error)
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 })
  }
}
