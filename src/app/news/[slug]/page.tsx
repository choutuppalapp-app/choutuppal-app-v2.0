import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Calendar, User, MessageCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

async function getArticle(slug: string) {
  return prisma.news.findUnique({
    where: { slug },
    include: { author: { select: { name: true } } },
  })
}

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
            <User className="h-3.5 w-3.5" /> {article.author.name ?? 'Choutuppal'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(article.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* Content */}
        <div
          className="prose prose-sm mt-5 max-w-none [&_h1]:text-2xl [&_h1]:font-black [&_h2]:text-xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-300 [&_blockquote]:bg-blue-50/50 [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-blue-600 [&_a]:underline [&_img]:rounded-xl"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {article.summary ? (
          <p className="mt-4 text-sm italic text-slate-500">{article.summary}</p>
        ) : null}

        {/* WhatsApp Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          {/* Share on WhatsApp */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`చౌటుప్పల్ యాప్ లో ఈ వార్త చూడండి: ${article.title} - ${SITE_URL}/news/${article.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-yellow-500 px-4 py-3 text-xs font-bold text-white shadow-md transition active:scale-[0.98] sm:w-auto text-center"
          >
            <MessageCircle className="h-4 w-4 shrink-0 text-white" />
            <span>WhatsApp లో వార్త షేర్ చేయండి</span>
          </a>

          {/* Send Us News (Lead CTA to Admin) */}
          <a
            href={`https://wa.me/919441348175?text=${encodeURIComponent('నమస్కారం చౌటుప్పల్ యాప్, మా ప్రాంతంలోని వార్త/అప్డేట్ మీకు పంపాలనుకుంటున్నాను.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-blue-600 bg-white/80 px-4 py-1.5 text-sm font-medium text-blue-600 shadow-sm backdrop-blur transition-all hover:bg-blue-50"
          >
            <MessageCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>వార్త పంపండి</span>
          </a>
        </div>
      </article>

      {/* Floating WhatsApp button */}
      <a
        href="https://wa.me/919441348175"
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
