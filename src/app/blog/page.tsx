import type { Metadata } from 'next'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { BlogList } from '@/components/content/blog-list'
import { swrCache } from '@/lib/cache'
import { getOfflineBlogs } from '@/lib/offline-data'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Blog | Choutuppal App',
  description: 'Stories, insights and articles from the Choutuppal community.',
  alternates: { canonical: `${SITE_URL}/blog` },
}

export default async function BlogPage() {
  const blogs = await swrCache(
    'blog_list_all',
    async () => {
      const dbBlogs = await safeDbQuery(
        () =>
          prisma.blog.findMany({
            where: { isPublished: true },
            orderBy: { createdAt: 'desc' },
            take: 200,
            select: {
              id: true, slug: true, title: true, excerpt: true, coverImage: true, category: true,
              createdAt: true,
            },
          }),
        []
      )
      const offline = getOfflineBlogs().filter((b) => b.isPublished !== false)
      const map = new Map<string, any>()
      if (Array.isArray(dbBlogs)) dbBlogs.forEach((b) => b?.id && map.set(b.id, b))
      if (Array.isArray(offline)) offline.forEach((b) => b?.id && map.set(b.id, b))
      return Array.from(map.values())
    },
    { ttlMs: 5 * 1000, staleTtlMs: 15 * 60 * 1000 }
  )

  return (
    <BlogList
      posts={blogs.map((b: any) => ({
        ...b,
        createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
      }))}
    />
  )
}
