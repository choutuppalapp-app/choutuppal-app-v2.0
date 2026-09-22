export default function NewsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-24 md:pb-10 animate-pulse">
      {/* Header Banner Skeleton */}
      <div className="border-b border-blue-100 bg-gradient-to-r from-blue-600 via-blue-700 to-amber-600 px-4 py-8 sm:py-10">
        <div className="mx-auto max-w-5xl space-y-3">
          <div className="h-6 w-32 rounded-full bg-white/30" />
          <div className="h-8 w-64 rounded-xl bg-white/40" />
          <div className="h-4 w-80 rounded bg-white/20" />
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-3 py-6 sm:px-4">
        {/* Search & Filter Skeleton */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-10 w-full sm:w-80 rounded-xl bg-slate-200" />
          <div className="h-10 w-48 rounded-xl bg-slate-200" />
        </div>

        {/* Grid Skeletons */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm">
              <div className="aspect-[16/9] w-full bg-slate-200" />
              <div className="p-4 space-y-2.5">
                <div className="h-4 w-3/4 rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-100" />
                <div className="h-3 w-1/2 rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
