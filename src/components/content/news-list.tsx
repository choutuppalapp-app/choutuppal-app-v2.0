'use client'

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
}

export function NewsList({ articles }: { articles: Article[] }) {
  const [q, setQ] = useState('')

  const filtered = articles.filter((a) =>
    a.title.toLowerCase().includes(q.toLowerCase()) ||
    (a.summary ?? '').toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-24 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-3 sm:px-4">
          <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-base font-black text-white">C</Link>
          <h1 className="text-sm font-extrabold text-slate-900">News</h1>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-6 sm:px-4">
        <SectionHeading eyebrow="Latest" title="Local News" subtitle="Updates from Choutuppal & nearby villages." />

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search news…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white/80 pl-9 pr-3 text-sm outline-none focus:border-blue-400"
          />
        </div>

        {filtered.length === 0 ? (
          <div className="mt-10 rounded-3xl glass p-10 text-center">
            <Newspaper className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No news articles found.</p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((a) => (
              <Link key={a.id} href={`/news/${a.slug}`} className="hover-lift overflow-hidden rounded-2xl glass">
                <div className="relative aspect-[16/9]">
                  {a.image ? (
                    <img loading="lazy" decoding="async" src={a.image} alt={a.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center gradient-brand">
                      <Newspaper className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="line-clamp-2 font-bold text-slate-900">{a.title}</h2>
                  {a.summary ? <p className="mt-1 line-clamp-2 text-xs text-slate-500">{a.summary}</p> : null}
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
