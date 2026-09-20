import { NextResponse, NextRequest } from 'next/server'
import { requireApiAdmin } from '@/lib/session'
import { prisma, safeDbQuery } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const stories = await safeDbQuery(
      () =>
        prisma.story.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            owner: { select: { id: true, name: true, phone: true, username: true } },
            _count: { select: { storyViews: true, storyLikes: true, storyReplies: true } },
          },
        }),
      []
    )

    return NextResponse.json({ ok: true, stories })
  } catch (error: any) {
    console.error('[Admin Stories GET] Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const { mediaUrl, mediaType = 'IMAGE', caption, link, durationHours = 24 } = body

    if (!mediaUrl) {
      return NextResponse.json({ error: 'Media URL is required' }, { status: 400 })
    }

    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000)

    const story = await safeDbQuery(
      () =>
        prisma.story.create({
          data: {
            mediaUrl,
            mediaType,
            caption,
            link,
            expiresAt,
            isActive: true,
            ownerId: auth.user.id,
          },
        }),
      null
    )

    return NextResponse.json({ ok: true, story, message: 'Story created' })
  } catch (error: any) {
    console.error('[Admin Stories POST] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create story' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const { id, isActive, caption, link } = body

    if (!id) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)
    if (caption !== undefined) updateData.caption = caption
    if (link !== undefined) updateData.link = link

    await safeDbQuery(
      () =>
        prisma.story.update({
          where: { id },
          data: updateData,
        }),
      null
    )

    return NextResponse.json({ ok: true, message: 'Story updated' })
  } catch (error: any) {
    console.error('[Admin Stories PATCH] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update story' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Story ID is required' }, { status: 400 })
    }

    await safeDbQuery(() => prisma.story.delete({ where: { id } }), null)

    return NextResponse.json({ ok: true, message: 'Story deleted' })
  } catch (error: any) {
    console.error('[Admin Stories DELETE] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete story' }, { status: 500 })
  }
}
