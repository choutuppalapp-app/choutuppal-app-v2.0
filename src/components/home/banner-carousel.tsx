'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Megaphone, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Banner } from '@prisma/client'

interface BannerCarouselProps {
  banners: Banner[]
}

/** Default promotional banners shown when no user banners are active. */
const DEFAULT_BANNERS = [
  {
    id: 'default-1',
    title: 'Choutuppal App v2.0 is Now Live!',
    imageUrl: null as string | null,
    link: '/login',
  },
  {
    id: 'default-2',
    title: 'List Your Business FREE — Early Bird Offer',
    imageUrl: null as string | null,
    link: '/dashboard',
  },
  {
    id: 'default-3',
    title: 'Spin & Win Daily Rewards',
    imageUrl: null as string | null,
    link: '/#spin',
  },
]

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [index, setIndex] = useState(0)
  // Use user banners if any are active+approved, else fall back to defaults.
  const active = banners.length > 0 ? banners : DEFAULT_BANNERS
  const count = active.length
  const current = active[index]
  const isUserBanner = banners.length > 0

  const go = (dir: number) => {
    if (count === 0) return
    setIndex((i) => (i + dir + count) % count)
  }

  // Click tracking — fire-and-forget POST when a user clicks a banner CTA.
  const trackClick = useCallback(() => {
    if (isUserBanner && current?.id) {
      fetch(`/api/banners/${current.id}/click`, { method: 'POST' }).catch(() => {})
    }
  }, [isUserBanner, current])

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <div className="relative overflow-hidden rounded-3xl">
        {/* 16:9 glossy banner */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl shimmer gradient-brand">
          {/* Uploaded banner image (object-cover prevents zoom/pixelation) */}
          {current?.imageUrl ? (
            <img
              src={current.imageUrl}
              alt={current.title ?? 'Banner Ad'}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : null}
          {/* decorative gloss */}
          <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
          <div className="absolute -bottom-12 right-10 h-48 w-48 rounded-full bg-amber-300/30 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_45%)]" />

          <div className="relative flex h-full flex-col justify-between p-5 sm:p-8 lg:p-10">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 rounded-full bg-white/25 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Banner Ad
              </span>
              <span className="rounded-full bg-amber-400 px-2.5 py-1 text-[11px] font-bold text-amber-950">
                ₹99/day
              </span>
              {!isUserBanner ? (
                <span className="rounded-full bg-emerald-400 px-2.5 py-1 text-[11px] font-bold text-emerald-950">
                  Early Bird FREE
                </span>
              ) : null}
            </div>

            <div className="max-w-xl">
              <h3 className="text-2xl font-black leading-tight text-white drop-shadow sm:text-4xl lg:text-5xl">
                {current?.title ?? 'Promote Your Business to 10,000+ Locals'}
              </h3>
              <p className="mt-2 max-w-md text-sm text-white/90 sm:text-base">
                Reach customers across Choutuppal, Yadadri & nearby villages.
                Affordable, targeted, instant.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {current?.link ? (
                <Link href={current.link} onClick={trackClick}>
                  <Button
                    size="lg"
                    className="gap-2 bg-white text-blue-700 hover:bg-amber-50 hover:text-blue-800"
                  >
                    <Megaphone className="h-4 w-4" />
                    Learn More
                  </Button>
                </Link>
              ) : null}
              {count > 1 ? (
                <div className="flex items-center gap-1.5">
                  {active.map((_, i) => (
                    <button
                      key={i}
                      aria-label={`Go to banner ${i + 1}`}
                      onClick={() => setIndex(i)}
                      className={cn(
                        'h-2 rounded-full transition-all',
                        i === index
                          ? 'w-6 bg-white'
                          : 'w-2 bg-white/50 hover:bg-white/80',
                      )}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          {/* Arrows */}
          {count > 1 ? (
            <>
              <button
                aria-label="Previous banner"
                onClick={() => go(-1)}
                className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/30 text-white backdrop-blur transition hover:bg-white/50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                aria-label="Next banner"
                onClick={() => go(1)}
                className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/30 text-white backdrop-blur transition hover:bg-white/50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          ) : null}
        </div>
      </div>

      {/* CTA below the carousel — links to /dashboard */}
      <div className="mt-4 flex justify-center">
        <Link href="/dashboard">
          <Button
            variant="outline"
            className="gap-2 border-blue-200 bg-white/70 text-blue-700 hover:bg-blue-50"
          >
            <Megaphone className="h-4 w-4" />
            Promote Your Business
          </Button>
        </Link>
      </div>
    </section>
  )
}
