import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/notifications — unread count + latest 5 notifications for the current user. */
export async function GET(request: NextRequest) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const limit = Number(request.nextUrl.searchParams.get('limit') ?? 5)

  const [unreadCount, recent] = await Promise.all([
    prisma.notification.count({
      where: { userId: auth.user.id, isRead: false },
    }),
    prisma.notification.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
  ])

  return NextResponse.json({ ok: true, unreadCount, notifications: recent })
}

/** PATCH /api/notifications — mark all (or specific) notifications as read. */
export async function PATCH(request: NextRequest) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const { id } = body as { id?: string }

  if (id) {
    await prisma.notification.updateMany({
      where: { id, userId: auth.user.id },
      data: { isRead: true },
    })
  } else {
    // Mark all as read
    await prisma.notification.updateMany({
      where: { userId: auth.user.id, isRead: false },
      data: { isRead: true },
    })
  }

  return NextResponse.json({ ok: true })
}
