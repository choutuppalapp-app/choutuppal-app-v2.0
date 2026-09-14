export default function Loading() {
  return (
    <div className="mx-auto min-h-[80vh] max-w-4xl px-3 py-4 sm:px-4 sm:py-6 animate-pulse">
      {/* Top back button skeleton */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-8 w-24 rounded-xl bg-slate-200" />
        <div className="flex gap-2">
          <div className="h-8 w-8 rounded-full bg-slate-200" />
          <div className="h-8 w-8 rounded-full bg-slate-200" />
        </div>
      </div>

      {/* Hero card skeleton */}
      <div className="mb-6 overflow-hidden rounded-3xl border border-slate-200/70 bg-white p-4 sm:p-6 shadow-xs">
        <div className="aspect-[16/9] w-full rounded-2xl bg-slate-200" />
        <div className="mt-4 flex items-start gap-4">
          <div className="h-16 w-16 shrink-0 rounded-2xl bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-3/4 rounded-md bg-slate-200" />
            <div className="flex gap-2">
              <div className="h-4 w-20 rounded-md bg-slate-200" />
              <div className="h-4 w-28 rounded-md bg-slate-200" />
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          <div className="h-11 rounded-xl bg-emerald-100" />
          <div className="h-11 rounded-xl bg-blue-100" />
          <div className="h-11 rounded-xl bg-amber-100" />
        </div>
      </div>

      {/* Details skeleton tabs & content */}
      <div className="space-y-4 rounded-3xl border border-slate-200/70 bg-white p-5 shadow-xs">
        <div className="flex gap-3 border-b border-slate-100 pb-3">
          <div className="h-7 w-20 rounded-lg bg-slate-200" />
          <div className="h-7 w-20 rounded-lg bg-slate-100" />
          <div className="h-7 w-20 rounded-lg bg-slate-100" />
        </div>
        <div className="space-y-2 pt-2">
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-5/6 rounded bg-slate-100" />
          <div className="h-4 w-2/3 rounded bg-slate-100" />
        </div>
      </div>
    </div>
  )
}
