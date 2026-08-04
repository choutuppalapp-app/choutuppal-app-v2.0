'use client'

import Link from 'next/link'
import { Share2, MessageCircle, Facebook, Twitter, Link as LinkIcon, Check } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

interface RelatedPost {
  id: string
  title: string
  slug: string
  summary?: string | null
  excerpt?: string | null
  image?: string | null
  coverImage?: string | null
  createdAt: Date | string
}

interface ArticleFooterProps {
  articleUrl: string
  articleTitle: string
  tags?: string[]
  relatedPosts: RelatedPost[]
  type: 'news' | 'blog'
}

export function ArticleFooter({
  articleUrl,
  articleTitle,
  tags,
  relatedPosts,
  type,
}: ArticleFooterProps) {
  const [copied, setCopied] = useState(false)

  function copyToClipboard() {
    navigator.clipboard.writeText(articleUrl)
    setCopied(true)
    toast.success('Link copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const encodedTitle = encodeURIComponent(articleTitle)
  const encodedUrl = encodeURIComponent(articleUrl)

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`*${articleTitle}*\n\nచౌటుప్పల్ యాప్ లో పూర్తి వార్త చదవండి: `)}${encodedUrl}`
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`

  return (
    <div className="mt-8 space-y-8 border-t border-slate-200 pt-6">
      {/* Tags */}
      {tags && tags.length > 0 ? (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Tags</h4>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Share Section */}
      <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50/80 to-amber-50/80 p-4">
        <h4 className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-800">
          <Share2 className="h-4 w-4 text-blue-600" /> Share This Article
        </h4>
        <div className="mt-3 flex flex-wrap gap-2">
          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>

          <a
            href={facebookShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
          >
            <Facebook className="h-4 w-4" /> Facebook
          </a>

          <a
            href={twitterShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-black"
          >
            <Twitter className="h-4 w-4" /> Twitter / X
          </a>

          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <LinkIcon className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
      </div>

      {/* Send News CTA Box */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-700 to-amber-500 p-4 text-white shadow-md">
        <div className="space-y-1 text-center sm:text-left">
          <p className="font-telugu text-sm font-bold">
            📢 మీ ఊరిలో జరిగిన విశేషాలు లేదా వార్తలు ఉన్నాయా?
          </p>
          <p className="text-xs text-white/90">
            మాకు WhatsApp ద్వారా పంపండి, మేము చౌటుప్పల్ యాప్ లో ప్రచురిస్తాము.
          </p>
        </div>
        <a
          href={`https://wa.me/919441348175?text=${encodeURIComponent(
            'నమస్కారం చౌటుప్పల్ యాప్, మా ఊరిలో ఒక ముఖ్యమైన వార్త/అప్డేట్ ఉంది. దయచేసి దీన్ని యాప్ లో పోస్ట్ చేయండి.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-extrabold text-blue-700 shadow transition hover:bg-amber-50 active:scale-95"
        >
          <MessageCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="font-telugu">వార్త పంపండి</span>
        </a>
      </div>

      {/* Related Posts */}
      {relatedPosts && relatedPosts.length > 0 ? (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">
            ఇంకా ఇవి కూడా చూడండి (Related {type === 'news' ? 'News' : 'Blogs'})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {relatedPosts.map((post) => {
              const img = post.image || post.coverImage
              const summary = post.summary || post.excerpt
              return (
                <Link
                  key={post.id}
                  href={`/${type}/${post.slug}`}
                  className="hover-lift group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:border-blue-300"
                >
                  {img ? (
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      <img
                        src={img}
                        alt={post.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                    </div>
                  ) : null}
                  <div className="p-3.5">
                    <h4 className="line-clamp-2 font-bold text-slate-900 group-hover:text-blue-600">
                      {post.title}
                    </h4>
                    {summary ? (
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{summary}</p>
                    ) : null}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
