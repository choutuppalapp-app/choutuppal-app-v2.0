import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/admin/stories — Fetch all stories for admin management */
export async function GET() {
  try {
    const auth = await requireApiAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const stories = await prisma.story.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true, phone: true, username: true, image: true } },
        _count: { select: { storyViews: true, storyReplies: true, storyLikes: true } },
      },
    })

    return NextResponse.json({ ok: true, stories })
  } catch (err) {
    console.error('[AdminStoriesAPI] GET error:', err)
    return NextResponse.json({ ok: false, stories: [] }, { status: 500 })
  }
}

/** POST /api/admin/stories — Create a new story manually from Admin Panel */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const { mediaUrl, mediaType, caption, link, hours } = body

    if (!mediaUrl || typeof mediaUrl !== 'string') {
      return NextResponse.json({ ok: false, error: 'Media URL is required' }, { status: 400 })
    }

    const durationHours = Number(hours) > 0 ? Number(hours) : 24
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000)

    const story = await prisma.story.create({
      data: {
        mediaUrl: mediaUrl.trim(),
        mediaType: mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE',
        caption: caption ? String(caption).trim() : null,
        link: link ? String(link).trim() : null,
        expiresAt,
        ownerId: auth.user.id,
      },
    })

    return NextResponse.json({ ok: true, story }, { status: 201 })
  } catch (err) {
    console.error('[AdminStoriesAPI] POST error:', err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Failed to create story' },
      { status: 500 },
    )
  }
}

/** DELETE /api/admin/stories — Delete a story by ID */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireApiAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing story ID' }, { status: 400 })
    }

    await prisma.story.delete({ where: { id } })
    return NextResponse.json({ ok: true, message: 'Story deleted successfully' })
  } catch (err) {
    console.error('[AdminStoriesAPI] DELETE error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to delete story' }, { status: 500 })
  }
}
