import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/admin/content — all content for admin management. */
export async function GET() {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const [news, blogs, shorts, categories, villages] = await Promise.all([
    prisma.news.findMany({ orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true } } } }),
    prisma.blog.findMany({ orderBy: { createdAt: 'desc' }, include: { author: { select: { name: true } } } }),
    prisma.short.findMany({ orderBy: { createdAt: 'desc' }, include: { owner: { select: { name: true } } } }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
    prisma.village.findMany({ orderBy: { name: 'asc' } }),
  ])

  return NextResponse.json({ ok: true, news, blogs, shorts, categories, villages })
}
