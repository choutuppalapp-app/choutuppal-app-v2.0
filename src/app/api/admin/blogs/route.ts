import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 100)
}

const Schema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().optional(),
  content: z.string().min(2),
  coverImage: z.string().nullable().optional(),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

/** POST /api/admin/blogs — admin creates + auto-publishes blog. */
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

  const blog = await prisma.blog.create({
    data: {
      slug,
      title: d.title,
      excerpt: d.excerpt ?? null,
      content: d.content,
      coverImage: d.coverImage ?? null,
      tags: d.tags ?? undefined,
      isPublished: true,
      publishedAt: new Date(),
      authorId: auth.user.id,
    },
  })
  return NextResponse.json({ ok: true, blog }, { status: 201 })
}
