'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Calendar, User } from 'lucide-react'
import { SectionHeading } from '@/components/home/section-heading'

interface Post {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  category?: string | null
  createdAt: string
}

const CATEGORIES = [
  'అన్నీ',
  'ప్రభుత్వ పథకాలు',
  'తెలంగాణ వార్తలు',
  'ఉద్యోగ సమాచారం',
  'విద్యా సమాచారం',
  'వ్యాపార చిట్కాలు',
  'పట్టణ సమాచారం',
]

export function BlogList({ posts }: { posts: Post[] }) {
  const [selectedCategory, setSelectedCategory] = useState('అన్నీ')

  const filteredPosts = selectedCategory === 'అన్నీ'
    ? posts
    : posts.filter((p) => (p.category ?? 'General') === selectedCategory)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-24 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-3 sm:px-4">
          <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-base font-black text-white">C</Link>
          <h1 className="text-sm font-extrabold text-slate-900">Blog</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-6 sm:px-4">
        <SectionHeading eyebrow="Stories" title="Blog Posts" subtitle="Insights and stories from the community." />

        {/* Category Filter Pills */}
        <div className="mt-4 flex flex-wrap gap-2 overflow-x-auto pb-2 fancy-scroll">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                selectedCategory === cat
                  ? 'gradient-brand text-white shadow-sm'
                  : 'bg-white/80 text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* AdSense Slot (Responsive) */}
        <div className="ad-slot w-full h-[250px] bg-gray-100 my-6 flex items-center justify-center text-gray-400 font-medium text-xs rounded-2xl border border-slate-200/60">
          Google Ad (Responsive)
        </div>

        {filteredPosts.length === 0 ? (
          <div className="mt-10 rounded-3xl glass p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No blog posts found for this category.</p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="hover-lift overflow-hidden rounded-2xl glass flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[16/9]">
                    {p.coverImage ? (
                      <img loading="lazy" decoding="async" src={p.coverImage} alt={p.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="grid h-full w-full place-items-center gradient-brand">
                        <BookOpen className="h-8 w-8 text-white" />
                      </div>
                    )}
                    <span className="absolute left-2.5 top-2.5 z-10 rounded-full bg-blue-600/90 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur shadow-sm">
                      {p.category ?? 'General'}
                    </span>
                  </div>
                  <div className="p-4">
                    <h2 className="line-clamp-2 font-bold text-slate-900">{p.title}</h2>
                    {p.excerpt ? <p className="mt-1 line-clamp-2 text-xs text-slate-500">{p.excerpt}</p> : null}
                  </div>
                </div>
                <div className="px-4 pb-4 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3 text-blue-500" /> Admin
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-amber-500" />
                    {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
