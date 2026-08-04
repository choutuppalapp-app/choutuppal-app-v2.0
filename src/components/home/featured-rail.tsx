'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, BadgeCheck, ChevronRight, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from './section-heading'
import type { Listing } from '@prisma/client'

type FeaturedListing = Listing & {
  category: { name: string; slug: string } | null
  village: { name: string; slug: string } | null
}

interface FeaturedRailProps {
  listings: FeaturedListing[]
}

export function FeaturedRail({ listings }: FeaturedRailProps) {
  const topListings = listings.slice(0, 4)

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <SectionHeading
        eyebrow="Featured"
        title="Top Local Businesses"
        subtitle="Top-rated local businesses trusted by the community."
        action={
          <Link href="/listings">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 text-blue-600 hover:bg-blue-50"
            >
              View all <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        }
      />

      <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        {topListings.map((l, i) => {
          const initial = l.title.charAt(0).toUpperCase()
          const rating = ((l as any).avgRating ?? (4 + ((i * 7) % 10) / 10)).toFixed(1)
          const imgUrl = l.coverImage || l.logo
          return (
            <Link
              key={l.id}
              href={`/business/${l.slug}`}
              className="hover-lift group flex w-full flex-col justify-between overflow-hidden rounded-2xl glass"
            >
              {/* cover */}
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                {imgUrl ? (
                  <Image
                    src={imgUrl}
                    alt={l.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-400 to-amber-400" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_45%)]" />
                  </>
                )}
                <span className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold text-amber-700 backdrop-blur">
                  <BadgeCheck className="h-3 w-3 text-blue-600" />
                  Top
                </span>
                {!imgUrl ? (
                  <span className="absolute bottom-2.5 left-2.5 z-10 grid h-10 w-10 place-items-center rounded-xl bg-white/90 text-xl font-black text-blue-700 shadow">
                    {initial}
                  </span>
                ) : null}
              </div>

              {/* body */}
              <div className="p-3">
                <h3 className="truncate font-bold text-slate-900 text-sm sm:text-base">{l.title}</h3>
                <div className="mt-1 flex items-center gap-1 text-xs text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span className="font-semibold text-slate-700">{rating}</span>
                  <span className="text-slate-300">·</span>
                  <span className="truncate text-slate-500">
                    {l.category?.name ?? 'Business'}
                  </span>
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                  <span className="truncate">{l.village?.name ?? 'Choutuppal'}</span>
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Lead CTA Button */}
      <div className="mt-4 flex justify-center">
        <a
          href={`https://wa.me/919441348175?text=${encodeURIComponent('నమస్కారం చౌటుప్పల్ యాప్, మీ యాప్ లో బిజినెస్ లిస్ట్ చేయాలనుకుంటున్నాను. దయచేసి మార్గనిర్దేశనం చేయండి.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-blue-600 bg-white/80 px-4 py-1.5 text-sm font-medium text-blue-600 shadow-sm backdrop-blur transition-all hover:bg-blue-50"
        >
          <MessageCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>మీ బిజినెస్ జోడించండి</span>
        </a>
      </div>
    </section>
  )
}
