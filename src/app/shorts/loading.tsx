import { Loader2 } from 'lucide-react'

export default function ShortsLoading() {
  return (
    <div className="grid min-h-[70vh] place-items-center p-4">
      <div className="flex flex-col items-center gap-3">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/10 text-amber-600">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <p className="font-telugu text-xs font-semibold text-slate-500">
          Shorts లోడ్ అవుతున్నాయి…
        </p>
      </div>
    </div>
  )
}
