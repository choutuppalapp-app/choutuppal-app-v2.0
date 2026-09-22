import type { Metadata } from 'next'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { getCurrentTenant, getTenantWhereClause } from '@/lib/tenant'
import { NewsList } from '@/components/content/news-list'
import { swrCache } from '@/lib/cache'
import { getOfflineNews, getOfflineBlogs } from '@/lib/offline-data'

export const dynamic = 'force-dynamic'
export const revalidate = 60

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'News & Blogs | Choutuppal App',
  description: 'Latest news, blogs, and community updates from Choutuppal & Yadadri Telangana.',
  alternates: { canonical: `${SITE_URL}/news` },
}

export default async function NewsPage() {
  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)

  const { news, blogs } = await swrCache(
    `news_page_${tenant.id}`,
    async () => {
      const [n, b] = await Promise.all([
        safeDbQuery(
          () =>
            prisma.news.findMany({
              where: { ...tenantFilter, isPublished: true },
              orderBy: { createdAt: 'desc' },
              take: 24,
              select: {
                id: true, slug: true, title: true, summary: true, image: true,
                createdAt: true,
              },
            }),
          []
        ),
        safeDbQuery(
          () =>
            prisma.blog.findMany({
              where: { ...tenantFilter, isPublished: true },
              orderBy: { createdAt: 'desc' },
              take: 24,
              select: {
                id: true, slug: true, title: true, excerpt: true, coverImage: true,
                createdAt: true,
              },
            }),
          []
        ),
      ])

      const finalNews = (n && n.length > 0) ? n : getOfflineNews()
      const finalBlogs = (b && b.length > 0) ? b : getOfflineBlogs()

      return { news: finalNews, blogs: finalBlogs }
    },
    { ttlMs: 60 * 1000, staleTtlMs: 30 * 60 * 1000 }
  )

  const combined = [
    ...news.map((n: any) => ({
      id: n.id,
      slug: n.slug,
      title: n.title,
      summary: n.summary,
      image: n.image,
      createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : new Date().toISOString(),
      type: 'news' as const,
    })),
    ...blogs.map((b: any) => ({
      id: b.id,
      slug: b.slug,
      title: b.title,
      summary: b.excerpt || b.summary,
      image: b.coverImage || b.image,
      createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString(),
      type: 'blog' as const,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return <NewsList articles={combined} />
}
