import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'
export const revalidate = 3600

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 100)
}

const Schema = z.object({
  title: z.string().min(2).max(200),
  slug: z.string().optional(),
  content: z.string().min(2),
  coverImage: z.string().nullable().optional(),
  category: z.string().optional(),
  excerpt: z.string().optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional(),
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

  const isPublished = d.isPublished ?? true

  const blog = await prisma.blog.create({
    data: {
      slug,
      title: d.title,
      excerpt: d.excerpt ?? null,
      content: d.content,
      coverImage: d.coverImage ?? null,
      category: d.category ?? 'General',
      tags: d.tags ?? undefined,
      isPublished,
      publishedAt: isPublished ? new Date() : null,
      authorId: auth.user.id,
    },
  })

  // Trigger ISR cache revalidation
  revalidatePath('/blog')
  revalidatePath(`/blog/${slug}`)
  revalidatePath('/')

  return NextResponse.json({ ok: true, blog }, { status: 201 })
}
