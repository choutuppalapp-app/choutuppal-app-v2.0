import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function BlogDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-24 md:pb-10 animate-pulse">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-3 px-3 sm:px-4">
          <Link href="/blog" className="grid h-10 w-10 place-items-center rounded-xl bg-white border border-slate-200 shadow-sm">
            <ChevronLeft className="h-5 w-5 text-slate-400" />
          </Link>
          <span className="text-sm font-extrabold text-slate-400">Loading Blog Post...</span>
        </div>
      </header>

      <article className="mx-auto max-w-4xl px-3 py-6 sm:px-6">
        {/* Cover Skeleton */}
        <div className="aspect-[2/1] w-full rounded-[2rem] bg-slate-200 shadow-sm" />

        <div className="mt-8 bg-white p-6 sm:p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
          {/* Category Tag */}
          <div className="h-6 w-24 rounded-full bg-slate-200" />

          {/* Title */}
          <div className="space-y-2">
            <div className="h-8 w-4/5 rounded-xl bg-slate-300" />
            <div className="h-8 w-3/5 rounded-xl bg-slate-200" />
          </div>

          {/* Meta */}
          <div className="flex gap-4 border-b border-slate-100 pb-6 pt-2">
            <div className="h-6 w-24 rounded-lg bg-slate-200" />
            <div className="h-6 w-32 rounded-lg bg-slate-200" />
          </div>

          {/* Body Lines */}
          <div className="space-y-3 pt-4">
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-5/6 rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-3/4 rounded bg-slate-200" />
          </div>
        </div>
      </article>
    </div>
  )
}
