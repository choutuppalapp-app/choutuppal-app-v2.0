import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, Calendar, User } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

async function getPost(slug: string) {
  return prisma.blog.findUnique({
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
            <User className="h-3.5 w-3.5" /> {post.author.name ?? 'Choutuppal'}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {new Date(post.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
        </div>

        <div
          className="prose prose-sm mt-5 max-w-none [&_h1]:text-2xl [&_h1]:font-black [&_h2]:text-xl [&_h2]:font-bold [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_blockquote]:border-l-4 [&_blockquote]:border-blue-300 [&_blockquote]:bg-blue-50/50 [&_blockquote]:py-2 [&_blockquote]:pl-4 [&_blockquote]:italic [&_a]:text-blue-600 [&_a]:underline [&_img]:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {post.excerpt ? (
          <p className="mt-4 text-sm italic text-slate-500">{post.excerpt}</p>
        ) : null}

        {/* WhatsApp Action Buttons */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
          {/* Share on WhatsApp */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(`చౌటుప్పల్ యాప్ లో ఈ బ్లాగ్ చూడండి: ${post.title} - ${SITE_URL}/blog/${post.slug}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-yellow-500 px-4 py-3 text-xs font-bold text-white shadow-md transition active:scale-[0.98] sm:w-auto text-center"
          >
            <img src="/whatsapp.png" alt="WhatsApp" className="h-4 w-4 shrink-0" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            <span>WhatsApp లో షేర్ చేయండి</span>
          </a>

          {/* Send Us News / Article (Lead CTA to Admin) */}
          <a
            href={`https://wa.me/919441348175?text=${encodeURIComponent('నమస్కారం చౌటుప్పల్ యాప్, మా బ్లాగ్ / ఆర్టికల్ పంపాలనుకుంటున్నాను.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-blue-600 bg-white/80 px-4 py-1.5 text-sm font-medium text-blue-600 shadow-sm backdrop-blur transition-all hover:bg-blue-50"
          >
            <img src="/whatsapp.png" alt="WhatsApp" className="h-4 w-4 shrink-0" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            <span>Send News</span>
          </a>
        </div>
      </article>
    </div>
  )
}
