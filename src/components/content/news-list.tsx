'use client'
import Image from 'next/image';

import { useState } from 'react'
import Link from 'next/link'
import { Search, Newspaper, Calendar } from 'lucide-react'
import { SectionHeading } from '@/components/home/section-heading'

interface Article {
  id: string
  slug: string
  title: string
  summary: string | null
  image: string | null
  createdAt: string
  type?: 'news' | 'blog'
}

export function NewsList({ articles }: { articles: Article[] }) {
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<'all' | 'news' | 'blog'>('all')

  const filtered = articles.filter((a) => {
    const matchesQuery =
      a.title.toLowerCase().includes(q.toLowerCase()) ||
      (a.summary ?? '').toLowerCase().includes(q.toLowerCase())
    const matchesFilter = filter === 'all' || a.type === filter
    return matchesQuery && matchesFilter
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-24 md:pb-10">
      {/* Page Header Banner */}
      <div className="border-b border-blue-100 bg-gradient-to-r from-blue-600 via-blue-700 to-amber-600 px-4 py-8 text-white shadow-sm sm:py-10">
        <div className="mx-auto max-w-5xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-md">
            <Newspaper className="h-3.5 w-3.5" />
            <span>Latest Updates</span>
          </div>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-4xl">
            News &amp; Blogs
          </h1>
          <p className="mt-1 text-xs text-white/90 sm:text-sm">
            Local news, stories, and articles from Choutuppal &amp; nearby villages.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-3 py-6 sm:px-4">
        {/* Search + Filter Tabs */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search news & blogs…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white/80 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
            />
          </div>

          <div className="flex gap-1.5 rounded-xl border border-slate-200 bg-slate-100/80 p-1">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                filter === 'all' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({articles.length})
            </button>
            <button
              onClick={() => setFilter('news')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                filter === 'news' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              News ({articles.filter((a) => a.type === 'news').length})
            </button>
            <button
              onClick={() => setFilter('blog')}
              className={`rounded-lg px-3 py-1 text-xs font-bold transition ${
                filter === 'blog' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Blogs ({articles.filter((a) => a.type === 'blog').length})
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-3xl glass p-10 text-center">
            <Newspaper className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No articles found matching your search.</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => {
              const itemType = a.type || 'news'
              const href = `/${itemType}/${a.slug}`
              return (
                <Link key={a.id} href={href} className="hover-lift overflow-hidden rounded-2xl glass group flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                      {a.image ? (
                        <Image width={800} height={800} loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, 33vw" src={a.image} alt={a.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                      ) : (
                        <div className="grid h-full w-full place-items-center gradient-brand">
                          <Newspaper className="h-8 w-8 text-white" />
                        </div>
                      )}
                      <span className={`absolute left-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow backdrop-blur-md ${
                        itemType === 'news' ? 'bg-blue-600/90' : 'bg-amber-600/90'
                      }`}>
                        {itemType}
                      </span>
                    </div>
                    <div className="p-4">
                      <h2 className="line-clamp-2 font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{a.title}</h2>
                      {a.summary ? <p className="mt-1 line-clamp-2 text-xs text-slate-500">{a.summary}</p> : null}
                    </div>
                  </div>
                  <div className="px-4 pb-4">
                    <p className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                      <Calendar className="h-3 w-3 text-amber-500" />
                      {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
