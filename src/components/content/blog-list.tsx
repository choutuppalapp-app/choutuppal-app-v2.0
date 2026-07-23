'use client'

import Link from 'next/link'
import { BookOpen, Calendar } from 'lucide-react'
import { SectionHeading } from '@/components/home/section-heading'

interface Post {
  id: string
  slug: string
  title: string
  excerpt: string | null
  coverImage: string | null
  createdAt: string
}

export function BlogList({ posts }: { posts: Post[] }) {
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

        {posts.length === 0 ? (
          <div className="mt-10 rounded-3xl glass p-10 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-2 text-sm text-slate-500">No blog posts yet.</p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link key={p.id} href={`/blog/${p.slug}`} className="hover-lift overflow-hidden rounded-2xl glass">
                <div className="relative aspect-[16/9]">
                  {p.coverImage ? (
                    <img loading="lazy" decoding="async" src={p.coverImage} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center gradient-brand">
                      <BookOpen className="h-8 w-8 text-white" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h2 className="line-clamp-2 font-bold text-slate-900">{p.title}</h2>
                  {p.excerpt ? <p className="mt-1 line-clamp-2 text-xs text-slate-500">{p.excerpt}</p> : null}
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                    <Calendar className="h-3 w-3" />
                    {new Date(p.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
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
