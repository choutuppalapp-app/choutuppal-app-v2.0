'use client'

import Image from 'next/image'
import Link from 'next/link'
import { BedDouble, Bath, Maximize, MapPin, ChevronRight, IndianRupee, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { SectionHeading } from './section-heading'
import type { RealEstate, Village } from '@prisma/client'

type Property = RealEstate & {
  village: { name: string; slug: string } | null
}

interface RealEstateRailProps {
  properties: Property[]
}

function formatPrice(price: number, listingType: string) {
  const formatted = new Intl.NumberFormat('en-IN').format(price)
  return listingType === 'RENT' ? `₹${formatted}/mo` : `₹${formatted}`
}

export function RealEstateRail({ properties }: RealEstateRailProps) {
  const topProperties = properties.slice(0, 4)

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <SectionHeading
        eyebrow="Real Estate"
        title="Premium Properties"
        subtitle="Plots, houses and rentals in & around Choutuppal."
        action={
          <Link href="/explore?tab=real-estate">
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
        {topProperties.map((p, i) => {
          const gradients = [
            'from-blue-600 to-amber-400',
            'from-amber-500 to-blue-400',
            'from-sky-500 to-amber-300',
            'from-blue-500 to-amber-500',
          ]
          const grad = gradients[i % gradients.length]
          return (
            <Link
              key={p.id}
              href={`/explore?tab=real-estate`}
              className="hover-lift group flex w-full flex-col justify-between overflow-hidden rounded-2xl glass"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                {p.coverImage ? (
                  <Image
                    src={p.coverImage}
                    alt={p.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                ) : (
                  <>
                    <div className={`absolute inset-0 bg-gradient-to-br ${grad}`} />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(255,255,255,0.35),transparent_45%)]" />
                  </>
                )}
                <Badge
                  className={`absolute left-2.5 top-2.5 z-10 ${
                    p.listingType === 'SALE'
                      ? 'bg-emerald-500 text-white hover:bg-emerald-500'
                      : 'bg-amber-500 text-white hover:bg-amber-500'
                  }`}
                >
                  For {p.listingType === 'SALE' ? 'Sale' : 'Rent'}
                </Badge>
                <span className="absolute bottom-2.5 right-2.5 z-10 rounded-lg bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700 backdrop-blur">
                  {p.type}
                </span>
              </div>

              <div className="p-3">
                <h3 className="truncate font-bold text-slate-900 text-sm sm:text-base">{p.title}</h3>
                <div className="mt-1 flex items-baseline gap-1 text-blue-700">
                  <IndianRupee className="h-3.5 w-3.5" />
                  <span className="text-base font-black tracking-tight sm:text-lg">
                    {formatPrice(p.price, p.listingType).replace('₹', '')}
                  </span>
                </div>
                <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                  <span className="truncate">{p.village?.name ?? 'Choutuppal'}</span>
                </p>
              </div>
            </Link>
          )
        })}
      </div>

      {/* RE Lead CTA Button */}
      <div className="mt-4 flex justify-center">
        <a
          href={`https://wa.me/919441348175?text=${encodeURIComponent('నమస్కారం చౌటుప్పల్ యాప్, నా ప్రాపర్టీని మీ యాప్ లో లిస్ట్ చేయాలనుకుంటున్నాను. దయచేసి మార్గనిర్దేశనం చేయండి.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-blue-600 bg-white/80 px-4 py-1.5 text-sm font-medium text-blue-600 shadow-sm backdrop-blur transition-all hover:bg-blue-50"
        >
          <MessageCircle className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>మీ ప్రాపర్టీ జోడించండి</span>
        </a>
      </div>
    </section>
  )
}
