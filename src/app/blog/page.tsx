import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { BlogList } from '@/components/content/blog-list'

export const dynamic = 'force-dynamic'

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Blog | Choutuppal App',
  description: 'Stories, insights and articles from the Choutuppal community.',
  alternates: { canonical: `${SITE_URL}/blog` },
}

export default async function BlogPage() {
  let blogs: any[] = []
  try {
    blogs = await prisma.blog.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, slug: true, title: true, excerpt: true, coverImage: true,
        createdAt: true,
      },
    })
  } catch (err) {
    console.error('[BlogPage] DB query error:', err)
  }

  return <BlogList posts={blogs.map(b => ({ ...b, createdAt: b.createdAt ? new Date(b.createdAt).toISOString() : new Date().toISOString() }))} />
}
