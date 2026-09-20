import type { Metadata } from 'next'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { BlogList } from '@/components/content/blog-list'
import { swrCache } from '@/lib/cache'

export const dynamic = 'force-dynamic'
export const revalidate = 60

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Blog | Choutuppal App',
  description: 'Stories, insights and articles from the Choutuppal community.',
  alternates: { canonical: `${SITE_URL}/blog` },
}

export default async function BlogPage() {
  const blogs = await swrCache(
    'blog_list_all',
    () =>
      safeDbQuery(
        () =>
          prisma.blog.findMany({
            where: { isPublished: true },
            orderBy: { createdAt: 'desc' },
            take: 24,
            select: {
              id: true, slug: true, title: true, excerpt: true, coverImage: true, category: true,
              createdAt: true,
            },
          }),
        [],
      ),
    { ttlMs: 60 * 1000, staleTtlMs: 30 * 60 * 1000 }
  )

  return <BlogList posts={blogs.map(b => ({ ...b, createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString() }))} />
}
