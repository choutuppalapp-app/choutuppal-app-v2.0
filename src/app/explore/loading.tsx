import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
      <p className="text-xs font-semibold text-slate-500">Loading directory listings…</p>
    </div>
  )
}
