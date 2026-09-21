export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Top Ticker Skeleton */}
      <div className="border-y border-slate-200/60 bg-white/70 backdrop-blur px-4 py-2 flex items-center gap-3">
        <div className="h-5 w-14 rounded-full bg-blue-500/20 animate-pulse" />
        <div className="h-4 flex-1 rounded bg-slate-200/70 animate-pulse" />
      </div>

      {/* Main Content Skeleton */}
      <main className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6 lg:px-6 flex flex-col gap-6">
        {/* Stories + Banner Container */}
        <div className="rounded-[2rem] bg-white/70 p-4 shadow-sm border border-slate-200/60 flex flex-col gap-4">
          {/* Stories Rail Shimmer */}
          <div className="flex items-center gap-4 overflow-hidden px-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 shrink-0">
                <div className="h-16 w-16 rounded-full bg-slate-200/80 animate-pulse border-2 border-slate-100" />
                <div className="h-2.5 w-12 rounded bg-slate-200/60 animate-pulse" />
              </div>
            ))}
          </div>

          {/* Banner 16:9 Shimmer */}
          <div className="w-full aspect-[16/9] max-h-[360px] rounded-3xl bg-slate-200/80 animate-pulse relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </div>
        </div>

        {/* Categories Grid Shimmer */}
        <div className="rounded-3xl bg-white/70 p-5 shadow-sm border border-slate-200/60">
          <div className="flex justify-between items-center mb-4">
            <div className="h-6 w-36 rounded-lg bg-slate-200/80 animate-pulse" />
            <div className="h-4 w-20 rounded bg-slate-200/60 animate-pulse" />
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-100/70">
                <div className="h-10 w-10 rounded-xl bg-slate-200/80 animate-pulse" />
                <div className="h-3 w-12 rounded bg-slate-200/60 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Featured Listings Shimmer */}
        <div className="rounded-3xl bg-white/70 p-5 shadow-sm border border-slate-200/60">
          <div className="h-6 w-44 rounded-lg bg-slate-200/80 animate-pulse mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 rounded-2xl bg-slate-100/80 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
