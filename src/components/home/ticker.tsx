'use client'

import { useState } from 'react'
import { Megaphone, Pause, Play } from 'lucide-react'
import { cn } from '@/lib/utils'

const ANNOUNCEMENTS = [
  '🪔 Choutuppal App v2.0 is now live — list your business FREE!',
  '📅 Spin & Win daily rewards — 1 free spin every day for early users.',
  '🏠 List your property for sale or rent at zero cost.',
  '📣 Banner ads from just ₹99/day — reach 10,000+ local customers.',
  '📰 Read local news & blogs updated daily by our agents.',
  '🤝 Community is now open — post & connect with your village.',
]

export function Ticker() {
  const [paused, setPaused] = useState(false)
  const items = [...ANNOUNCEMENTS, ...ANNOUNCEMENTS]

  return (
    <div className="border-y border-white/40 bg-white/60 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-3 py-2 sm:px-4 lg:px-6">
        <span className="flex shrink-0 items-center gap-1.5 rounded-full gradient-brand px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          <Megaphone className="h-3.5 w-3.5" />
          Live
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div
            className={cn(
              'flex w-max gap-10 whitespace-nowrap text-sm font-medium text-slate-700',
              'animate-marquee',
              paused && 'animate-marquee-paused',
            )}
          >
            {items.map((a, i) => (
              <span key={i} className="inline-flex items-center">
                {a}
              </span>
            ))}
          </div>
        </div>
        <button
          aria-label={paused ? 'Play ticker' : 'Pause ticker'}
          onClick={() => setPaused((p) => !p)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-slate-200 bg-white/80 text-slate-600 transition hover:text-blue-600"
        >
          {paused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
        </button>
      </div>
    </div>
  )
}
