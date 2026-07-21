import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TTL_HOURS = 24

const CreateSchema = z.object({
  mediaUrl: z.string().min(1),
  mediaType: z.enum(['IMAGE', 'VIDEO']).default('IMAGE'),
  caption: z.string().optional(),
  link: z.string().optional(),
})

/** POST /api/stories — create a story that auto-expires in 24h. */
export async function POST(request: NextRequest) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }

  const expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000)
  const story = await prisma.story.create({
    data: { ...parsed.data, expiresAt, ownerId: auth.user.id },
  })
  return NextResponse.json({ ok: true, story }, { status: 201 })
}

/** GET /api/stories — current user's stories. */
export async function GET() {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const stories = await prisma.story.findMany({
    where: { ownerId: auth.user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ ok: true, stories })
}
