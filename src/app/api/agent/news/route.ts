import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiAgent } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 100)
}
async function uniqueSlug(base: string, model: 'news' | 'blog'): Promise<string> {
  let slug = slugify(base) || `${model}-${Date.now()}`
  let i = 1
  const find = model === 'news'
    ? (s: string) => prisma.news.findUnique({ where: { slug: s } })
    : (s: string) => prisma.blog.findUnique({ where: { slug: s } })
  while (await find(slug)) slug = `${slugify(base)}-${i++}`
  return slug
}

const Schema = z.object({
  type: z.enum(['news', 'blog']).default('news'),
  title: z.string().min(2).max(200),
  slug: z.string().optional(),
  excerpt: z.string().optional(), // blogs use "excerpt", news uses "summary"
  summary: z.string().optional(),
  content: z.string().min(2),
  image: z.string().nullable().optional(),
  coverImage: z.string().nullable().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

/**
 * POST /api/agent/news (also handles blogs via `type` field)
 * Creates a News or Blog post with status PENDING for admin approval.
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiAgent()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const parsed = Schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }
  const d = parsed.data
  const slug = d.slug ? slugify(d.slug) : await uniqueSlug(d.title, d.type)

  if (d.type === 'blog') {
    const blog = await prisma.blog.create({
      data: {
        slug,
        title: d.title,
        excerpt: d.excerpt ?? d.metaDescription ?? null,
        content: d.content,
        coverImage: d.coverImage ?? d.image ?? null,
        tags: d.tags ?? undefined,
        isPublished: false,
        authorId: auth.user.id,
      },
    })
    return NextResponse.json({ ok: true, blog }, { status: 201 })
  }

  const news = await prisma.news.create({
    data: {
      slug,
      title: d.title,
      summary: d.summary ?? d.metaDescription ?? null,
      content: d.content,
      image: d.image ?? d.coverImage ?? null,
      tags: d.tags ?? undefined,
      isPublished: false,
      authorId: auth.user.id,
    },
  })
  return NextResponse.json({ ok: true, news }, { status: 201 })
}

/** GET /api/agent/news?type=news|blog — list the agent's own posts. */
export async function GET(request: NextRequest) {
  const auth = await requireApiAgent()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const type = request.nextUrl.searchParams.get('type') ?? 'news'
  if (type === 'blog') {
    const blogs = await prisma.blog.findMany({
      where: { authorId: auth.user.id },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ ok: true, items: blogs })
  }
  const news = await prisma.news.findMany({
    where: { authorId: auth.user.id },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json({ ok: true, items: news })
}
