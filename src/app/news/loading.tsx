import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="grid min-h-[60vh] place-items-center bg-slate-50/50 px-4 py-12">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-600">వార్తలు లోడ్ అవుతున్నాయి...</p>
      </div>
    </div>
  )
}
