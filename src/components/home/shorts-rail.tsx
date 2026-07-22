'use client'

import { useState } from 'react'
import { Play, ChevronRight, X, Eye, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from './section-heading'
import type { Short } from '@prisma/client'

interface ShortsRailProps {
  shorts: (Short & {
    owner: { username: string | null; name: string | null }
  })[]
}

function thumbUrl(youtubeId: string | null, fallback: string) {
  if (youtubeId) return `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`
  return fallback
}

function embedUrl(youtubeId: string | null, videoUrl: string): string {
  if (youtubeId) return `https://www.youtube.com/embed/${youtubeId}?autoplay=1&rel=0`
  // Fallback: try to extract a video ID from a watch URL
  const m = videoUrl.match(/[?&]v=([^&]+)/)
  if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`
  return videoUrl
}

export function ShortsRail({ shorts }: ShortsRailProps) {
  const [active, setActive] = useState<number | null>(null)

  return (
    <section id="shorts" className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <SectionHeading
        eyebrow="Watch"
        title="Shorts & Reels"
        subtitle="Local moments, business reels & temple darshan."
        action={
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-blue-600 hover:bg-blue-50"
          >
            View all <ChevronRight className="h-4 w-4" />
          </Button>
        }
      />
      <div className="no-scrollbar mt-5 flex gap-4 overflow-x-auto pb-2">
        {shorts.map((s, i) => {
          const owner = s.owner.username ?? s.owner.name ?? 'Choutuppal'
          return (
            <button
              key={s.id}
              onClick={() => setActive(i)}
              className="hover-lift group relative block h-56 w-32 shrink-0 overflow-hidden rounded-2xl glass sm:h-64 sm:w-36"
            >
              <div className="relative h-full w-full overflow-hidden">
                <img
                  src={thumbUrl(s.youtubeId, s.thumbnail ?? '')}
                  alt={s.title ?? 'Short'}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white/90 text-blue-700 opacity-90 shadow-lg transition group-hover:scale-110">
                  <Play className="h-5 w-5 fill-blue-700" />
                </span>
                <div className="absolute inset-x-0 bottom-0 p-2">
                  <p className="line-clamp-2 text-[11px] font-semibold leading-tight text-white">
                    {s.title ?? 'Short'}
                  </p>
                  <p className="mt-0.5 text-[10px] text-white/70">@{owner}</p>
                  <div className="mt-1 flex items-center gap-2 text-[9px] text-white/60">
                    <span className="flex items-center gap-0.5"><Eye className="h-2.5 w-2.5" /> {s.views}</span>
                    <span className="flex items-center gap-0.5"><Heart className="h-2.5 w-2.5" /> {s.likes}</span>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* In-app YouTube iframe player (modal) */}
      {active !== null && shorts[active] ? (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/90 backdrop-blur-sm"
          onClick={() => setActive(null)}
        >
          <button
            aria-label="Close"
            className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          <div
            className="relative aspect-[9/16] h-[80vh] max-h-[80vh] w-auto overflow-hidden rounded-2xl bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={embedUrl(shorts[active].youtubeId, shorts[active].videoUrl)}
              title={shorts[active].title ?? 'Short'}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <p className="text-sm font-semibold text-white">{shorts[active].title ?? 'Short'}</p>
              <p className="text-xs text-white/70">
                @{shorts[active].owner.username ?? shorts[active].owner.name ?? 'Choutuppal'}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
