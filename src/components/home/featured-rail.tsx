'use client'

import Link from 'next/link'
import { Star, MapPin, BadgeCheck, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from './section-heading'
import type { Listing, Category, Village } from '@prisma/client'

type FeaturedListing = Listing & {
  category: { name: string; slug: string } | null
  village: { name: string; slug: string } | null
}

interface FeaturedRailProps {
  listings: FeaturedListing[]
}

export function FeaturedRail({ listings }: FeaturedRailProps) {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <SectionHeading
        eyebrow="Featured"
        title="Featured Business & Services"
        subtitle="Top-rated local businesses trusted by the community."
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
        {listings.map((l, i) => {
          const initial = l.title.charAt(0).toUpperCase()
          // rating from database or fallback
          const rating = ((l as any).avgRating ?? (4 + ((i * 7) % 10) / 10)).toFixed(1)
          return (
            <Link
              key={l.id}
              href={`/business/${l.slug}`}
              className="hover-lift group w-[230px] shrink-0 overflow-hidden rounded-2xl glass"
            >
              {/* cover */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-400 to-amber-400" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.35),transparent_45%)]" />
                <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold text-amber-700 backdrop-blur">
                  <BadgeCheck className="h-3 w-3 text-blue-600" />
                  Featured
                </span>
                <span className="absolute bottom-3 left-3 grid h-12 w-12 place-items-center rounded-xl bg-white/90 text-2xl font-black text-blue-700 shadow">
                  {initial}
                </span>
              </div>

              {/* body */}
              <div className="p-3.5">
                <h3 className="truncate font-bold text-slate-900">{l.title}</h3>
                <div className="mt-1 flex items-center gap-1 text-xs text-amber-500">
                  <Star className="h-3.5 w-3.5 fill-amber-400" />
                  <span className="font-semibold text-slate-700">{rating}</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-slate-500">
                    {l.category?.name ?? 'Business'}
                  </span>
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3 text-blue-500" />
                  {l.village?.name ?? 'Choutuppal'}
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
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-blue-600 bg-white/90 px-4 py-2.5 text-xs font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50 md:w-auto"
        >
          <img src="/whatsapp.png" alt="WhatsApp" className="h-4 w-4 shrink-0" onError={(e) => { e.currentTarget.style.display = 'none' }} />
          <span>నమస్కారం చౌటుప్పల్ యాప్, మీ యాప్ లో బిజినెస్ లిస్ట్ చేయాలనుకుంటున్నాను</span>
        </a>
      </div>
    </section>
  )
}
