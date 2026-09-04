'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const DelayedScripts = dynamic(
  () => import('./delayed-scripts').then((m) => m.DelayedScripts),
  { ssr: false }
)

export function DynamicDelayedScriptsWrapper({ gaId, fbPixelId }: { gaId: string | null, fbPixelId: string | null }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <DelayedScripts gaId={gaId} fbPixelId={fbPixelId} />
}
