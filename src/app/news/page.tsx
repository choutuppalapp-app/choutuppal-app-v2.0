import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { NewsList } from '@/components/content/news-list'

export const dynamic = 'force-dynamic'

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'News | Choutuppal App',
  description: 'Local news and updates from Choutuppal, Yadadri Bhuvanagiri, Telangana.',
  alternates: { canonical: `${SITE_URL}/news` },
}

export default async function NewsPage() {
  const news = await prisma.news.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, slug: true, title: true, summary: true, image: true,
      createdAt: true,
    },
  })
  return <NewsList articles={news} />
}
