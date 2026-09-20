import { NextResponse, NextRequest } from 'next/server'
import { requireApiAdmin } from '@/lib/session'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { getOfflineBanners } from '@/lib/offline-data'
import { invalidateHomeDataCache } from '@/lib/home-data'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const dbBanners = await safeDbQuery(
      () =>
        prisma.banner.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            owner: { select: { id: true, name: true, phone: true, username: true } },
          },
        }),
      null
    )

    const banners = dbBanners !== null && dbBanners !== undefined ? dbBanners : getOfflineBanners()
    return NextResponse.json({ ok: true, banners })
  } catch (error: any) {
    console.error('[Admin Banners GET] Error:', error)
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
    const { title, imageUrl, link, position = 'HOME_TOP', durationDays = 30, status = 'APPROVED' } = body

    if (!imageUrl) {
      return NextResponse.json({ error: 'Banner image URL is required' }, { status: 400 })
    }

    const expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)

    const banner = await safeDbQuery(
      () =>
        prisma.banner.create({
          data: {
            title: title || 'Special Banner Ad',
            imageUrl,
            link: link || '/categories',
            position,
            status,
            isActive: true,
            expiresAt,
            ownerId: auth.user.id,
          },
        }),
      null
    )

    invalidateHomeDataCache()
    try { revalidatePath('/') } catch {}

    return NextResponse.json({ ok: true, banner, message: 'Banner created successfully' })
  } catch (error: any) {
    console.error('[Admin Banners POST] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create banner' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const { id, isActive, status, title, link, position, durationDays } = body

    if (!id) {
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
    }

    const updateData: any = {}
    if (isActive !== undefined) updateData.isActive = Boolean(isActive)
    if (status !== undefined) updateData.status = status
    if (title !== undefined) updateData.title = title
    if (link !== undefined) updateData.link = link
    if (position !== undefined) updateData.position = position
    if (durationDays !== undefined) {
      updateData.expiresAt = new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000)
    }

    await safeDbQuery(
      () =>
        prisma.banner.update({
          where: { id },
          data: updateData,
        }),
      null
    )

    invalidateHomeDataCache()
    try { revalidatePath('/') } catch {}

    return NextResponse.json({ ok: true, message: 'Banner updated' })
  } catch (error: any) {
    console.error('[Admin Banners PATCH] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update banner' }, { status: 500 })
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
      return NextResponse.json({ error: 'Banner ID is required' }, { status: 400 })
    }

    await safeDbQuery(() => prisma.banner.delete({ where: { id } }), null)

    invalidateHomeDataCache()
    try { revalidatePath('/') } catch {}

    return NextResponse.json({ ok: true, message: 'Banner deleted' })
  } catch (error: any) {
    console.error('[Admin Banners DELETE] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to delete banner' }, { status: 500 })
  }
}
