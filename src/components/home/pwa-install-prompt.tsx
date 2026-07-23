'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'pwa-install-dismissed'

export function PwaInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Don't show if the user previously dismissed it.
    if (typeof window === 'undefined') return
    if (localStorage.getItem(DISMISS_KEY) === 'true') return

    const handler = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e as BeforeInstallPromptEvent)
      // Show the banner after 3 seconds.
      setTimeout(() => setVisible(true), 3000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  async function install() {
    if (!promptEvent) return
    await promptEvent.prompt()
    const choice = await promptEvent.userChoice
    if (choice.outcome === 'accepted') {
      setVisible(false)
    }
    setPromptEvent(null)
  }

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, 'true')
    setVisible(false)
  }

  if (!visible || !promptEvent) return null

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 flex items-center justify-between rounded-xl bg-gradient-to-r from-blue-600 to-yellow-500 p-4 text-white shadow-lg">
      <span className="font-telugu text-sm font-semibold">
        📱 చౌటుప్పల్ యాప్ ని ఇన్‌స్టాల్ చేయండి
      </span>
      <div className="flex items-center gap-2">
        <button
          onClick={install}
          className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-amber-50"
        >
          <Download className="h-3.5 w-3.5" />
          Install
        </button>
        <button
          onClick={dismiss}
          aria-label="Dismiss"
          className="grid h-7 w-7 place-items-center rounded-lg bg-white/20 text-white transition hover:bg-white/30"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
