import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/admin/stories — all active stories for moderation. */
export async function GET() {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const stories = await prisma.story.findMany({
    where: { expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
    include: {
      owner: {
        select: { id: true, name: true, username: true, email: true, image: true },
      },
      _count: { select: { storyViews: true, storyReplies: true } },
    },
  })

  return NextResponse.json({ ok: true, stories })
}
