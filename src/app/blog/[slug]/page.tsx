import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Calendar, User, MessageCircle, Tag } from 'lucide-react'
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

  // Fetch AutoLinks & Related Blogs (3 from same category)
  const [autoLinks, relatedBlogs] = await Promise.all([
    prisma.autoLink.findMany().catch(() => []),
    prisma.blog.findMany({
      where: {
        isPublished: true,
        id: { not: post.id },
        ...(post.category ? { category: post.category } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 3,
      select: { id: true, title: true, slug: true, excerpt: true, coverImage: true, createdAt: true },
    }).catch(() => []),
  ])

  // Process Auto-Linking
  const processedContent = applyAutoLinks(post.content, autoLinks)
  const tagsArray = Array.isArray(post.tags) ? (post.tags as string[]) : []
  const postUrl = `${SITE_URL}/blog/${post.slug}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-24 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-3 px-3 sm:px-4">
          <Link href="/blog" className="grid h-10 w-10 place-items-center rounded-xl bg-white border border-slate-200 shadow-sm hover:bg-slate-50 transition active:scale-95">
            <ChevronLeft className="h-5 w-5 text-slate-700" />
          </Link>
          <span className="text-sm font-extrabold text-slate-900 tracking-tight">Blog Post</span>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-3 py-6 sm:px-6">
        {post.coverImage ? (
          <div className="overflow-hidden rounded-[2rem] shadow-lg border border-slate-100 bg-white">
            <img src={post.coverImage} alt={post.title} className="aspect-[2/1] w-full object-cover" />
          </div>
        ) : null}

        <div className="mt-8 bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100">
          {post.category && (
            <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 border border-blue-100 shadow-sm">
              <Tag className="h-3.5 w-3.5" />
              {post.category}
            </div>
          )}

          <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl leading-snug lg:text-4xl">
            {post.title}
          </h1>
          
          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-500 border-b border-slate-100 pb-6">
            <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
              <User className="h-4 w-4" /> Admin
            </span>
            <span className="flex items-center gap-1.5 text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
              <Calendar className="h-4 w-4" />
              {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>

          {/* AdSense Slot 1: Below Blog Post Title */}
          <div className="ad-slot w-full h-[250px] bg-slate-50 my-8 flex items-center justify-center text-slate-400 font-bold text-xs rounded-3xl border border-slate-200/60 shadow-inner">
            Google Ad (Responsive)
          </div>

          {/* Content with Auto Links */}
          <div
            className="prose prose-slate prose-sm sm:prose-base lg:prose-lg mt-8 max-w-none 
            [&_h1]:text-3xl [&_h1]:font-black [&_h1]:tracking-tight [&_h1]:text-slate-900
            [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-slate-800 [&_h2]:mt-10 [&_h2]:mb-4
            [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-slate-800
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul>li]:mb-2 [&_ul>li::marker]:text-blue-500
            [&_ol]:list-decimal [&_ol]:pl-6 [&_ol>li]:mb-2 [&_ol>li::marker]:text-blue-500
            [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:bg-blue-50/50 [&_blockquote]:py-3 [&_blockquote]:px-5 [&_blockquote]:italic [&_blockquote]:rounded-r-xl [&_blockquote]:text-slate-700
            [&_a]:text-blue-600 [&_a]:underline [&_a]:font-medium [&_a:hover]:text-blue-800
            [&_img]:rounded-2xl [&_img]:shadow-md [&_img]:border [&_img]:border-slate-100
            [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_th]:bg-slate-50 [&_th]:p-3 [&_th]:border [&_th]:border-slate-200 [&_th]:text-left [&_th]:font-bold [&_td]:p-3 [&_td]:border [&_td]:border-slate-200
            [&_p]:leading-relaxed [&_p]:text-slate-700 [&_p]:mb-5"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />

          {/* AdSense Slot 2: End of Blog Content */}
          <div className="ad-slot w-full h-[250px] bg-slate-50 my-8 flex items-center justify-center text-slate-400 font-bold text-xs rounded-3xl border border-slate-200/60 shadow-inner">
            Google Ad (Responsive)
          </div>

          {post.excerpt ? (
            <div className="mt-8 rounded-2xl bg-amber-50 p-6 border border-amber-100">
              <p className="text-sm font-medium italic text-amber-800">
                <span className="font-bold">సారాంశం:</span> {post.excerpt}
              </p>
            </div>
          ) : null}
        </div>

        {/* Article Footer with Share, Tags, & Related Posts */}
        <div className="mt-6">
          <ArticleFooter
            articleUrl={postUrl}
            articleTitle={post.title}
            tags={tagsArray}
            relatedPosts={relatedBlogs}
            type="blog"
          />
        </div>

        {/* White-Label CTA Banner */}
        <div className="mt-8 overflow-hidden rounded-[2rem] bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 p-8 text-white shadow-xl relative">
          {/* Glass highlights */}
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-black/10 blur-2xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
            <div className="space-y-2 max-w-xl">
              <h3 className="text-lg sm:text-2xl font-black tracking-tight leading-snug">
                మీ ఊరికి ఈ యాప్ కావాలా?
              </h3>
              <p className="text-sm sm:text-base text-emerald-50 font-medium">
                వైట్-లేబుల్ ఫ్రాంచైజీ కోసం ఇప్పుడే వాట్సాప్ లో మాట్లాడండి! మీ సొంత బ్రాండ్ తో సూపర్ యాప్ ప్రారంభించండి.
              </p>
            </div>
            <a
              href={`https://wa.me/919494348175?text=${encodeURIComponent("నమస్కారం, నా ఊరి కోసం ఒక వైట్-లేబుల్ సూపర్ యాప్ సెటప్ చేయాలనుకుంటున్నాను. సమాచారం కావాలి.")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-2.5 rounded-2xl bg-white px-6 py-4 text-sm font-extrabold text-emerald-700 shadow-lg transition-all hover:bg-emerald-50 hover:scale-105 active:scale-95"
            >
              <MessageCircle className="h-5 w-5 fill-emerald-600 text-emerald-600" />
              <span>WhatsApp లో మాట్లాడండి</span>
            </a>
          </div>
        </div>
      </article>
    </div>
  )
}
