import { NextResponse, NextRequest } from 'next/server'
import { requireApiAdmin } from '@/lib/session'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { invalidateHomeDataCache } from '@/lib/home-data'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

function extractYouTubeId(url: string): string | null {
  if (!url) return null
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i
  const match = url.match(regExp)
  return match ? match[1] : null
}

export async function GET() {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const shorts = await safeDbQuery(
      () =>
        prisma.short.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            owner: { select: { id: true, name: true, phone: true, username: true } },
          },
        }),
      []
    )

    return NextResponse.json({ ok: true, shorts })
  } catch (error: any) {
    console.error('[Admin Shorts GET] Error:', error)
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
    const { videoUrl, title, description, platform = 'YOUTUBE', customThumbnail } = body

    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 })
    }

    let youtubeId = extractYouTubeId(videoUrl)
    let thumbnail = customThumbnail

    if (youtubeId && !thumbnail) {
      thumbnail = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`
    } else if (!thumbnail) {
      thumbnail = 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80'
    }

    const short = await safeDbQuery(
      () =>
        prisma.short.create({
          data: {
            videoUrl,
            youtubeId,
            platform,
            thumbnail,
            title: title || 'Choutuppal Short Video',
            description: description || '',
            ownerId: auth.user.id,
          },
        }),
      null
    )

    invalidateHomeDataCache()
    try { revalidatePath('/') } catch {}

    return NextResponse.json({ ok: true, short, message: 'Short added successfully' })
  } catch (error: any) {
    console.error('[Admin Shorts POST] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to add short' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const { id, title, description, thumbnail } = body

    if (!id) {
      return NextResponse.json({ error: 'Short ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (thumbnail !== undefined) updateData.thumbnail = thumbnail

    await safeDbQuery(
      () =>
        prisma.short.update({
          where: { id },
          data: updateData,
        }),
      null
    )

    invalidateHomeDataCache()
    try { revalidatePath('/') } catch {}

    return NextResponse.json({ ok: true, message: 'Short updated' })
  } catch (error: any) {
    console.error('[Admin Shorts PATCH] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update short' }, { status: 500 })
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
      return NextResponse.json({ error: 'Short ID is required' }, { status: 400 })
    }

    await safeDbQuery(() => prisma.short.delete({ where: { id } }), null)

    invalidateHomeDataCache()
    try { revalidatePath('/') } catch {}

    return NextResponse.json({ ok: true, message: 'Short deleted' })
  } catch (error: any) {
    console.error('[Admin Shorts DELETE] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete short' }, { status: 500 })
  }
}
