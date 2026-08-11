import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdminRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/admin/banners — fetch all banners for admin management */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const banners = await prisma.banner.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json({ ok: true, banners })
  } catch (err) {
    console.error('[AdminBannersAPI] GET error:', err)
    return NextResponse.json({ ok: false, banners: [] }, { status: 500 })
  }
}

/** POST /api/admin/banners — create single or bulk banner ads with 24h expiry */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)

    // Bulk creation support
    if (Array.isArray(body.items)) {
      const validItems = body.items.filter((item: any) => item && typeof item.imageUrl === 'string' && item.imageUrl.trim())
      if (validItems.length === 0) {
        return NextResponse.json({ ok: false, error: 'No valid banner items found in bulk payload' }, { status: 400 })
      }

      const created = await prisma.$transaction(
        validItems.map((item: any) =>
          prisma.banner.create({
            data: {
              imageUrl: item.imageUrl.trim(),
              title: item.title ? String(item.title).trim() : 'Banner Ad',
              link: item.link ? String(item.link).trim() : null,
              position: item.position || 'HOME_TOP',
              status: 'APPROVED',
              expiresAt,
              ownerId: user.id,
            },
          }),
        ),
      )
      return NextResponse.json({ ok: true, count: created.length, banners: created }, { status: 201 })
    }

    const { imageUrl, title, link, position } = body
    if (!imageUrl || typeof imageUrl !== 'string') {
      return NextResponse.json({ ok: false, error: 'Image URL is required' }, { status: 400 })
    }

    const banner = await prisma.banner.create({
      data: {
        imageUrl: imageUrl.trim(),
        title: title ? String(title).trim() : 'Banner Ad',
        link: link ? String(link).trim() : null,
        position: position || 'HOME_TOP',
        status: 'APPROVED',
        expiresAt,
        ownerId: user.id,
      },
    })

    return NextResponse.json({ ok: true, banner }, { status: 201 })
  } catch (err) {
    console.error('[AdminBannersAPI] POST error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to create banner' }, { status: 500 })
  }
}

/** DELETE /api/admin/banners — delete a banner */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing banner id' }, { status: 400 })
    }

    await prisma.banner.delete({ where: { id } })
    return NextResponse.json({ ok: true, message: 'Banner deleted' })
  } catch (err) {
    console.error('[AdminBannersAPI] DELETE error:', err)
    return NextResponse.json({ ok: false, error: 'Failed to delete banner' }, { status: 500 })
  }
}
