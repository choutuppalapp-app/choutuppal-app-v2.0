import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Calendar, User, MessageCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const revalidate = 60

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

async function getArticle(slug: string) {
  return prisma.news.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  })
}

import { applyAutoLinks } from '@/lib/autolinks'
import { ArticleFooter } from '@/components/news/article-footer'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article) return { title: 'Not found' }

  const image = article.image
    ? article.image.startsWith('http') ? article.image : `${SITE_URL}${article.image}`
    : undefined
  const url = `${SITE_URL}/news/${article.slug}`

  return {
    title: `${article.title} | Choutuppal News`,
    description: article.summary ?? article.title,
    alternates: { canonical: url },
    openGraph: {
      title: article.title,
      description: article.summary ?? '',
      url,
      siteName: 'Choutuppal App',
      type: 'article',
      images: image ? [{ url: image, width: 1200, height: 630, alt: article.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary ?? '',
      images: image ? [image] : undefined,
    },
  }
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const article = await getArticle(slug)
  if (!article || !article.isPublished) notFound()

  // Fetch AutoLinks & Related News
  const [autoLinks, relatedNews] = await Promise.all([
    prisma.autoLink.findMany().catch(() => []),
    prisma.news.findMany({
      where: {
        isPublished: true,
        id: { not: article.id },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: { id: true, title: true, slug: true, summary: true, image: true, createdAt: true },
    }).catch(() => []),
  ])

  // Process Auto-Linking
  const processedContent = applyAutoLinks(article.content, autoLinks)
  const tagsArray = Array.isArray(article.tags) ? (article.tags as string[]) : []
  const articleUrl = `${SITE_URL}/news/${article.slug}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-24 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-3 sm:px-4">
          <Link href="/news" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="text-sm font-bold text-slate-900">News</span>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-3 py-6 sm:px-4">
        {/* Featured Image */}
        {article.image ? (
          <div className="overflow-hidden rounded-3xl">
            <img src={article.image} alt={article.title} className="aspect-[16/9] w-full object-cover" />
          </div>
        ) : null}

        {/* Title + Meta */}
        <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          {article.title}
        </h1>
        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-blue-600" /> {article.author.name ?? 'Choutuppal Editor'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-amber-600" />
            {new Date(article.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Content with Auto Links */}
        <div
          className="prose prose-sm mt-5 max-w-none [&_h1]:text-2xl [&_h1]:font-black [&_h2]:text-xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-300 [&_blockquote]:bg-blue-50/50 [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-blue-600 [&_a]:underline [&_img]:rounded-xl"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />

        {article.summary ? (
          <p className="mt-4 text-sm italic text-slate-500">{article.summary}</p>
        ) : null}

        {/* Article Footer with Share, Tags, & Related Posts */}
        <ArticleFooter
          articleUrl={articleUrl}
          articleTitle={article.title}
          tags={tagsArray}
          relatedPosts={relatedNews}
          type="news"
        />
      </article>

      {/* Floating WhatsApp button */}
      <a
        href="https://wa.me/919494348175"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-xs font-bold text-white shadow-lg transition hover:bg-green-600 md:bottom-6"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="font-telugu hidden sm:inline">మీకు ఏదైనా వార్త ఉంటే ఈ నంబర్‌కి WhatsApp చేయండి</span>
        <span className="font-telugu sm:hidden">WhatsApp</span>
      </a>
    </div>
  )
}
