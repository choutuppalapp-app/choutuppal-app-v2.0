import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

import { getSafeTenantId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

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

/** POST /api/admin/stories — Create single or bulk stories manually from Admin Panel */
export async function POST(request: NextRequest) {
  try {
    const auth = await requireApiAdmin()
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

    const body = await request.json()
    const defaultExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    console.log("Received payload (Stories):", body)
    
    const tenantId = await getSafeTenantId()
    if (!tenantId) {
      return NextResponse.json({ ok: false, error: "Could not resolve or create a tenant." }, { status: 500 })
    }
    console.log("Using Tenant ID:", tenantId)

    // Bulk creation support
    if (Array.isArray(body.items)) {
      const validItems = body.items.filter((item: any) => item && typeof item.mediaUrl === 'string' && item.mediaUrl.trim())
      if (validItems.length === 0) {
        return NextResponse.json({ ok: false, error: 'No valid story items found in bulk payload' }, { status: 400 })
      }

      try {
        const created = await prisma.$transaction(
          validItems.map((item: any) => {
            const durationHours = Number(item.hours) > 0 ? Number(item.hours) : 24
            const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000)
            return prisma.story.create({
              data: {
                mediaUrl: item.mediaUrl.trim(),
                mediaType: item.mediaType === 'VIDEO' || String(item.mediaUrl).match(/\.(mp4|mov|webm)$/i) ? 'VIDEO' : 'IMAGE',
                caption: item.caption ? String(item.caption).trim() : null,
                link: item.link ? String(item.link).trim() : null,
                expiresAt,
                ownerId: auth.user.id,
              },
            })
          }),
        )
        revalidatePath('/')
        return NextResponse.json({ ok: true, count: created.length, stories: created }, { status: 201 })
      } catch (err: any) {
        console.error('[AdminStoriesAPI] Bulk POST error:', err)
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
      }
    }

    const { mediaUrl, mediaType, caption, link, hours, paymentId, orderId } = body
    if (!mediaUrl || typeof mediaUrl !== 'string') {
      return NextResponse.json({ ok: false, error: 'Media URL is required' }, { status: 400 })
    }
    
    if (!paymentId || !orderId) {
      return NextResponse.json({ ok: false, error: 'Payment is required to post a story' }, { status: 400 })
    }

    const durationHours = Number(hours) > 0 ? Number(hours) : 24
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000)

    try {
      const story = await prisma.story.create({
        data: {
          mediaUrl: mediaUrl.trim(),
          mediaType: mediaType === 'VIDEO' ? 'VIDEO' : 'IMAGE',
          caption: caption ? String(caption).trim() : null,
          link: link ? String(link).trim() : null,
          expiresAt,
          isActive: true,
          paymentId,
          orderId,
          ownerId: auth.user.id,
        },
      })
      revalidatePath('/')
      return NextResponse.json({ ok: true, story }, { status: 200 })
    } catch (err: any) {
      console.error('[AdminStoriesAPI] POST error:', err)
      return NextResponse.json({ ok: false, error: err.message }, { status: 500 })
    }
  } catch (err: any) {
    console.error('[AdminStoriesAPI] POST outer error:', err)
    return NextResponse.json(
      { ok: false, error: err.message || 'Failed to create story' },
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
    revalidatePath('/')
    return NextResponse.json({ ok: true, message: 'Story deleted successfully' })
  } catch (err) {
    console.error('[AdminStoriesAPI] DELETE error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to delete story' }, { status: 500 })
  }
}
