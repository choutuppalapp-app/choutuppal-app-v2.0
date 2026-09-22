import { NextResponse } from 'next/server'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { getTenantWhereClause, getCurrentTenant } from '@/lib/tenant'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const tenant = await getCurrentTenant()
    const tenantFilter = getTenantWhereClause(tenant.id)

    let shorts = await safeDbQuery(
      () =>
        prisma.short.findMany({
          where: tenantFilter,
          orderBy: { createdAt: 'desc' },
          take: 30,
          select: {
            id: true,
            videoUrl: true,
            platform: true,
            thumbnail: true,
            title: true,
            description: true,
            views: true,
            likes: true,
            youtubeId: true,
            createdAt: true,
            owner: { select: { id: true, name: true, username: true, image: true } },
          },
        }),
      null
    )

    if (!shorts || shorts.length === 0) {
      shorts = await safeDbQuery(
        () =>
          prisma.short.findMany({
            orderBy: { createdAt: 'desc' },
            take: 30,
            select: {
              id: true,
              videoUrl: true,
              platform: true,
              thumbnail: true,
              title: true,
              description: true,
              views: true,
              likes: true,
              youtubeId: true,
              createdAt: true,
              owner: { select: { id: true, name: true, username: true, image: true } },
            },
          }),
        []
      )
    }

    return NextResponse.json(
      { ok: true, shorts: shorts || [] },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    )
  } catch (err: any) {
    console.error('[Public Shorts GET] Error:', err)
    return NextResponse.json({ ok: false, error: err.message, shorts: [] }, { status: 500 })
  }
}
