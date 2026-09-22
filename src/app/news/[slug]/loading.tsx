import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewsDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-24 md:pb-10 animate-pulse">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-3 sm:px-4">
          <Link href="/news" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200">
            <ChevronLeft className="h-4 w-4 text-slate-400" />
          </Link>
          <span className="text-sm font-bold text-slate-400">Loading News...</span>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-3 py-6 sm:px-4">
        {/* Cover Skeleton */}
        <div className="aspect-[16/9] w-full rounded-3xl bg-slate-200" />

        {/* Title Skeleton */}
        <div className="mt-5 space-y-2">
          <div className="h-7 w-5/6 rounded-lg bg-slate-300" />
          <div className="h-7 w-2/3 rounded-lg bg-slate-200" />
        </div>

        {/* Meta Skeleton */}
        <div className="mt-4 flex items-center gap-4">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-4 w-32 rounded bg-slate-200" />
        </div>

        {/* Content Skeleton lines */}
        <div className="mt-6 space-y-3">
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-4/5 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-200" />
          <div className="h-4 w-3/4 rounded bg-slate-200" />
        </div>
      </article>
    </div>
  )
}
