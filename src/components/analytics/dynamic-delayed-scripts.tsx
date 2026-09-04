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
    let timeoutId: NodeJS.Timeout
    const loadScripts = () => {
      setMounted(true)
      window.removeEventListener('scroll', loadScripts)
      window.removeEventListener('mousemove', loadScripts)
      window.removeEventListener('touchstart', loadScripts)
    }

    timeoutId = setTimeout(loadScripts, 5000)

    window.addEventListener('scroll', loadScripts, { once: true, passive: true })
    window.addEventListener('mousemove', loadScripts, { once: true, passive: true })
    window.addEventListener('touchstart', loadScripts, { once: true, passive: true })

    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('scroll', loadScripts)
      window.removeEventListener('mousemove', loadScripts)
      window.removeEventListener('touchstart', loadScripts)
    }
  }, [])

  if (!mounted) return null

  return <DelayedScripts gaId={gaId} fbPixelId={fbPixelId} />
}
