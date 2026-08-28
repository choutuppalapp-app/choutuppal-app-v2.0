import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 100)
}

const Schema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().optional(),
  content: z.string().min(2),
  image: z.string().nullable().optional(),
  summary: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

/** POST /api/admin/news — admin creates + auto-publishes news. */
export async function POST(request: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }
  const d = parsed.data
  const slug = d.slug ? slugify(d.slug) : slugify(d.title) + '-' + Date.now().toString(36)

  const news = await prisma.news.create({
    data: {
      slug,
      title: d.title,
      summary: d.summary ?? d.metaDescription ?? null,
      content: d.content,
      image: d.image ?? null,
      tags: d.tags ?? undefined,
      isPublished: true,
      publishedAt: new Date(),
      authorId: auth.user.id,
    },
  })
  return NextResponse.json({ ok: true, news }, { status: 201 })
}
