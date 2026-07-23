import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const Schema = z.object({
  title: z.string().min(1).max(120),
  message: z.string().min(1).max(500),
  link: z.string().optional(),
})

/**
 * POST /api/admin/push
 * Admin-only: broadcasts a notification to ALL users.
 * Saves a Notification row for every user in the DB.
 * (Web Push API / VAPID integration is a stub — requires PushSubscription
 *  table + web-push library in production.)
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }

  const { title, message, link } = parsed.data

  // Fetch all user IDs (non-banned).
  const users = await prisma.user.findMany({
    where: { isBanned: false },
    select: { id: true },
  })

  if (users.length === 0) {
    return NextResponse.json({ error: 'No users to notify' }, { status: 400 })
  }

  // Create a notification for each user.
  await prisma.notification.createMany({
    data: users.map((u) => ({
      type: 'SYSTEM',
      title,
      message,
      link: link || null,
      userId: u.id,
    })),
  })

  // TODO: Web Push API integration — iterate PushSubscription table and send
  // via the `web-push` library using VAPID keys from .env. For now, the
  // in-app bell icon + dashboard tab surface these notifications.

  return NextResponse.json({
    ok: true,
    sent: users.length,
    note: 'In-app notifications created for all users. Web Push requires VAPID + PushSubscription setup.',
  }, { status: 201 })
}
