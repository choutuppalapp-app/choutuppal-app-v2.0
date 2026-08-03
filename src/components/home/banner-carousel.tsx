'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Megaphone, Sparkles, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { Banner } from '@prisma/client'

import Image from 'next/image'

interface BannerCarouselProps {
  banners: Banner[]
}

const DEFAULT_BANNERS = [
  { id: 'default-1', title: 'Choutuppal App v2.0 is Now Live!', imageUrl: null as string | null, link: '/login' },
  { id: 'default-2', title: 'List Your Business FREE — Early Bird Offer', imageUrl: null as string | null, link: '/dashboard' },
  { id: 'default-3', title: 'Spin & Win Daily Rewards', imageUrl: null as string | null, link: '/#spin' },
]

export function BannerCarousel({ banners }: BannerCarouselProps) {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)

  const active = banners.length > 0 ? banners : DEFAULT_BANNERS
  const count = active.length
  const current = active[index]
  const isUserBanner = banners.length > 0

  const go = useCallback((dir: number) => {
    if (count === 0) return
    setIndex((i) => (i + dir + count) % count)
  }, [count])

  // Auto-scroll every 4 seconds (pauses on hover)
  useEffect(() => {
    if (count <= 1 || isPaused) return
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % count)
    }, 4000)
    return () => clearInterval(timer)
  }, [count, isPaused])

  // Touch swipe for mobile
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(delta) > 50) {
      go(delta > 0 ? -1 : 1)
    }
    touchStartX.current = null
  }

  const trackClick = useCallback(() => {
    if (isUserBanner && current?.id) {
      fetch(`/api/banners/${current.id}/click`, { method: 'POST' }).catch(() => {})
    }
  }, [isUserBanner, current])

  return (
    <section className="mx-auto w-full max-w-7xl px-3 sm:px-4 lg:px-6">
      {/* Badge row — ABOVE the banner image (no overlap) */}
      <div className="mb-2 flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full gradient-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          <Sparkles className="h-3.5 w-3.5" />
          Banner Ad
        </span>
        <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
          ₹99/day
        </span>
        {!isUserBanner ? (
          <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            Early Bird FREE
          </span>
        ) : null}
      </div>

      {/* Banner image — 16:9, full width, touch swipe */}
      <div
        className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl gradient-brand shimmer"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {current?.imageUrl ? (
          <Image
            src={current.imageUrl}
            alt={current.title ?? 'Banner Ad'}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1200px"
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : null}
        {/* Gloss overlay */}
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/20 blur-2xl" />
        <div className="absolute -bottom-12 right-10 h-48 w-48 rounded-full bg-amber-300/30 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.25),transparent_45%)]" />

        {/* Dark gradient at bottom for text readability */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />

        {/* Title overlay at the bottom */}
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
          <h3 className="text-xl font-black leading-tight text-white drop-shadow sm:text-3xl lg:text-4xl">
            {current?.title ?? 'Promote Your Business to 10,000+ Locals'}
          </h3>
          <p className="mt-1 hidden max-w-md text-sm text-white/90 sm:block">
            Reach customers across Choutuppal, Yadadri & nearby villages.
          </p>
        </div>

        {/* Navigation arrows — z-10, padded, only on desktop */}
        {count > 1 ? (
          <>
            <button
              aria-label="Previous banner"
              onClick={() => go(-1)}
              className="absolute left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/30 text-white backdrop-blur transition hover:bg-white/50 md:grid"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              aria-label="Next banner"
              onClick={() => go(1)}
              className="absolute right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/30 text-white backdrop-blur transition hover:bg-white/50 md:grid"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}

        {/* Pagination dots */}
        {count > 1 ? (
          <div className="absolute bottom-3 right-4 z-10 flex items-center gap-1.5">
            {active.map((_, i) => (
              <button
                key={i}
                aria-label={`Go to banner ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  'h-2 rounded-full transition-all',
                  i === index ? 'w-6 bg-white' : 'w-2 bg-white/50 hover:bg-white/80',
                )}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* CTA buttons — BELOW the banner */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        {current?.link ? (
          <Link href={current.link} onClick={trackClick}>
            <Button size="lg" className="gap-2 bg-white text-blue-700 shadow-md hover:bg-amber-50">
              <Megaphone className="h-4 w-4" />
              Learn More
            </Button>
          </Link>
        ) : null}
        <a
          href={`https://wa.me/919441348175?text=${encodeURIComponent('నమస్కారం చౌటుప్పల్ యాప్, నా బిజినెస్ కోసం బ్యానర్ అడ్ ఇవ్వాలనుకుంటున్నాను. వివరాలు దయచేసి పంచండి.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-blue-600 bg-white/80 px-4 py-1.5 text-sm font-medium text-blue-600 shadow-sm backdrop-blur transition-all hover:bg-blue-50"
        >
          <MessageCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>ప్రమోట్ చేయండి</span>
        </a>
      </div>
    </section>
  )
}
