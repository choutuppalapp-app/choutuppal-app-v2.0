'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import type { Short } from '@prisma/client'

interface ShortsFeedProps {
  shorts: (Short & {
    owner: { name: string | null; username: string | null }
  })[]
}

const WHATSAPP_LINK =
  'https://wa.me/919441348175?text=' +
  encodeURIComponent('నేను మా యూట్యూబ్ వీడియో చౌటుప్పల్ యాప్ లో పోస్ట్ చేయాలనుకుంటున్నాను')

function embedUrl(youtubeId: string | null, videoUrl: string): string {
  if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0&playsinline=1`
  const m = videoUrl.match(/[?&]v=([^&]+)/)
  if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0&playsinline=1`
  return videoUrl
}

export function ShortsFeed({ shorts }: ShortsFeedProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  if (shorts.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-black text-center text-white">
        <p className="text-sm text-white/70">No shorts available yet.</p>
        <p className="font-telugu mt-4 text-xs text-white/50">
          మీ వీడియో పోస్ట్ చేయాలనుకుంటే ఇక్కడ క్లిక్ చేయండి
        </p>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 rounded-full bg-gradient-to-r from-blue-600 to-yellow-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg"
        >
          వీడియో పోస్ట్ చేయండి
        </a>
      </div>
    )
  }

  return (
    <div
      className="h-screen overflow-y-auto snap-y snap-mandatory bg-black"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      onScroll={(e) => {
        const el = e.currentTarget
        const idx = Math.round(el.scrollTop / el.clientHeight)
        if (idx !== activeIndex) setActiveIndex(idx)
      }}
    >
      <style>{`::-webkit-scrollbar { display: none; }`}</style>

      {/* Back button overlay */}
      <Link
        href="/"
        className="fixed left-4 top-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur transition hover:bg-black/60"
        aria-label="Back to home"
      >
        <ChevronLeft className="h-5 w-5" />
      </Link>

      {shorts.map((s, i) => (
        <div
          key={s.id}
          className="relative flex h-screen w-full snap-start items-center justify-center"
        >
          {/* In-app YouTube iframe — videos play inside the app */}
          <iframe
            src={i === activeIndex ? embedUrl(s.youtubeId, s.videoUrl) : undefined}
            title={s.title ?? 'Short'}
            className="h-full w-full"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          />

          {/* Title + channel at bottom */}
          <div className="pointer-events-none absolute bottom-24 left-4 z-10">
            <p className="text-sm font-medium text-white drop-shadow-lg">
              {s.title ?? 'Short'}
            </p>
            <p className="text-xs text-white/70 drop-shadow">
              @{s.owner.username ?? s.owner.name ?? 'choutuppal'}
            </p>
          </div>

          {/* WhatsApp CTA */}
          <div className="absolute bottom-20 left-0 right-0 z-10 flex flex-col items-center gap-2">
            <p className="font-telugu text-center text-xs text-white drop-shadow-lg">
              మీ వీడియో పోస్ట్ చేయాలనుకుంటే ఇక్కడ క్లిక్ చేయండి
            </p>
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gradient-to-r from-blue-600 to-yellow-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg"
            >
              వీడియో పోస్ట్ చేయండి
            </a>
          </div>
        </div>
      ))}
    </div>
  )
}
