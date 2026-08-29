import Image from 'next/image';
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BookOpen, Calendar, User, Search, ChevronDown } from 'lucide-react'
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

const POSTS_PER_PAGE = 12

export function BlogList({ posts }: { posts: Post[] }) {
  const [selectedCategory, setSelectedCategory] = useState('అన్నీ')
  const [searchQuery, setSearchQuery] = useState('')
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE)

  const filteredPosts = posts.filter((p) => {
    const matchesCategory = selectedCategory === 'అన్నీ' || (p.category ?? 'General') === selectedCategory
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const visiblePosts = filteredPosts.slice(0, visibleCount)
  const hasMore = visibleCount < filteredPosts.length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-24 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-3 sm:px-4">
          <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-base font-black text-white">C</Link>
          <h1 className="text-sm font-extrabold text-slate-900">Choutuppal Blogs & News</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-6 sm:px-4">
        <SectionHeading title="Choutuppal Blogs & News" />

        {/* AdSense Slot (Responsive) */}
        <div className="ad-slot w-full h-[250px] bg-gray-100 my-4 flex items-center justify-center text-gray-400 font-medium text-xs rounded-2xl border border-slate-200/60 shadow-inner">
          Google Ad (Responsive)
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Category Filter Pills */}
          <div className="flex w-full sm:w-auto gap-2 overflow-x-auto pb-2 fancy-scroll no-scrollbar shrink-0">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); setVisibleCount(POSTS_PER_PAGE); }}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition ${
                  selectedCategory === cat
                    ? 'gradient-brand text-white shadow-md'
                    : 'bg-white text-slate-600 border border-slate-200 shadow-sm hover:bg-slate-50 hover:text-blue-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-[280px] shrink-0">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search news & blogs..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(POSTS_PER_PAGE); }}
              className="h-10 w-full rounded-full border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 shadow-sm"
            />
          </div>
        </div>

        {filteredPosts.length === 0 ? (
          <div className="mt-8 rounded-3xl glass p-10 text-center shadow-sm">
            <BookOpen className="mx-auto h-12 w-12 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">No matching posts found.</p>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visiblePosts.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 hover:-translate-y-1">
                  <div>
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {p.coverImage ? (
                        <Image width={800} height={800} loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, 33vw" src={p.coverImage} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="grid h-full w-full place-items-center bg-gradient-to-br from-blue-50 to-amber-50">
                          <BookOpen className="h-10 w-10 text-blue-200" />
                        </div>
                      )}
                      <span className="absolute left-3 top-3 z-10 rounded-full bg-blue-600/90 px-3 py-1 text-[10px] font-bold tracking-wide text-white backdrop-blur shadow-sm">
                        {p.category ?? 'General'}
                      </span>
                    </div>
                    <div className="p-5">
                      <h2 className="line-clamp-2 text-base font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">{p.title}</h2>
                      {p.excerpt ? <p className="mt-2 line-clamp-2 text-sm text-slate-500 leading-relaxed">{p.excerpt}</p> : null}
                    </div>
                  </div>
                  <div className="px-5 pb-5">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500 border-t border-slate-100 pt-4">
                      <span className="flex items-center gap-1.5 text-blue-600">
                        <User className="h-3.5 w-3.5" /> Admin
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-600">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => setVisibleCount((prev) => prev + POSTS_PER_PAGE)}
                  className="flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-bold text-blue-600 shadow-md border border-blue-100 hover:bg-blue-50 transition active:scale-95"
                >
                  Load More <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
