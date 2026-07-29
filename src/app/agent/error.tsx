'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function AgentError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[AgentError]', error)
  }, [error])

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 p-4">
      <div className="glass-strong max-w-md rounded-3xl p-8 text-center shadow-xl">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-600">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-black text-slate-900">Agent Panel Error</h2>
        <p className="mt-2 text-xs text-slate-500">
          {error?.message || 'A server error occurred while loading the agent panel.'}
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => reset()} className="flex-1 gap-2 gradient-brand text-white">
            <RefreshCw className="h-4 w-4" /> Try Again
          </Button>
          <Button asChild variant="outline" className="gap-1.5 border-slate-200">
            <Link href="/"><Home className="h-4 w-4" /> Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
