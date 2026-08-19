import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Calendar, User, MessageCircle } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const revalidate = 60

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

async function getPost(slug: string) {
  return prisma.blog.findUnique({
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
  const post = await getPost(slug)
  if (!post) return { title: 'Not found' }

  const image = post.coverImage
    ? post.coverImage.startsWith('http') ? post.coverImage : `${SITE_URL}${post.coverImage}`
    : undefined
  const url = `${SITE_URL}/blog/${post.slug}`

  return {
    title: `${post.title} | Choutuppal Blog`,
    description: post.excerpt ?? post.title,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? '',
      url,
      siteName: 'Choutuppal App',
      type: 'article',
      images: image ? [{ url: image, width: 1200, height: 630, alt: post.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt ?? '',
      images: image ? [image] : undefined,
    },
  }
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)
  if (!post || !post.isPublished) notFound()

  // Fetch AutoLinks & Related Blogs
  const [autoLinks, relatedBlogs] = await Promise.all([
    prisma.autoLink.findMany().catch(() => []),
    prisma.blog.findMany({
      where: {
        isPublished: true,
        id: { not: post.id },
      },
      orderBy: { createdAt: 'desc' },
      take: 4,
      select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, createdAt: true },
    }).catch(() => []),
  ])

  // Process Auto-Linking
  const processedContent = applyAutoLinks(post.content, autoLinks)
  const tagsArray = Array.isArray(post.tags) ? (post.tags as string[]) : []
  const postUrl = `${SITE_URL}/blog/${post.slug}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-24 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-3 sm:px-4">
          <Link href="/blog" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="text-sm font-bold text-slate-900">Blog</span>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-3 py-6 sm:px-4">
        {post.coverImage ? (
          <div className="overflow-hidden rounded-3xl">
            <img src={post.coverImage} alt={post.title} className="aspect-[16/9] w-full object-cover" />
          </div>
        ) : null}

        <h1 className="mt-5 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
          {post.title}
        </h1>
        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-blue-600" /> Admin
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-amber-600" />
            {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        {/* AdSense Slot 1: Below Blog Post Title */}
        <div className="ad-slot w-full h-[250px] bg-gray-100 my-4 flex items-center justify-center text-gray-400 font-medium text-xs rounded-2xl border border-slate-200/60">
          Google Ad (Responsive)
        </div>

        {/* Content with Auto Links */}
        <div
          className="prose prose-sm mt-5 max-w-none [&_h1]:text-2xl [&_h1]:font-black [&_h2]:text-xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-300 [&_blockquote]:bg-blue-50/50 [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-blue-600 [&_a]:underline [&_img]:rounded-xl"
          dangerouslySetInnerHTML={{ __html: processedContent }}
        />

        {/* AdSense Slot 2: End of Blog Content */}
        <div className="ad-slot w-full h-[250px] bg-gray-100 my-4 flex items-center justify-center text-gray-400 font-medium text-xs rounded-2xl border border-slate-200/60">
          Google Ad (Responsive)
        </div>

        {post.excerpt ? (
          <p className="mt-4 text-sm italic text-slate-500">{post.excerpt}</p>
        ) : null}

        {/* Article Footer with Share, Tags, & Related Posts */}
        <ArticleFooter
          articleUrl={postUrl}
          articleTitle={post.title}
          tags={tagsArray}
          relatedPosts={relatedBlogs}
          type="blog"
        />

        {/* White-Label CTA Banner */}
        <div className="mt-8 overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white shadow-xl">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div className="space-y-1">
              <h3 className="text-base sm:text-lg font-black tracking-tight">
                మీ ఊరికి ఈ యాప్ కావాలా?
              </h3>
              <p className="text-xs sm:text-sm text-emerald-100 font-medium">
                వైట్-లేబుల్ ఫ్రాంచైజీ కోసం ఇప్పుడే వాట్సాప్ లో మాట్లాడండి!
              </p>
            </div>
            <a
              href={`https://wa.me/919494348175?text=${encodeURIComponent("నమస్కారం, నా ఊరి కోసం ఒక వైట్-లేబుల్ సూపర్ యాప్ సెటప్ చేయాలనుకుంటున్నాను. సమాచారం కావాలి.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-extrabold text-emerald-700 shadow-md transition hover:bg-emerald-50 hover:scale-105 active:scale-95"
            >
              <MessageCircle className="h-4 w-4 fill-emerald-600 text-emerald-600" />
              <span>WhatsApp లో సంప్రదించండి</span>
            </a>
          </div>
        </div>
      </article>
    </div>
  )
}
