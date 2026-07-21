'use client'

import { Play, ChevronRight } from 'lucide-react'
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

export function ShortsRail({ shorts }: ShortsRailProps) {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
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
        {shorts.map((s) => {
          const owner = s.owner.username ?? s.owner.name ?? 'Choutuppal'
          return (
            <a
              key={s.id}
              href={s.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
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
                </div>
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}
