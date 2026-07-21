'use client'

import Link from 'next/link'
import { BedDouble, Bath, Maximize, MapPin, ChevronRight, IndianRupee } from 'lucide-react'
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
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <SectionHeading
        eyebrow="Real Estate"
        title="Premium Real Estate"
        subtitle="Plots, houses and rentals in & around Choutuppal."
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
        {properties.map((p, i) => {
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
              href={`/business/${p.slug}`}
              className="hover-lift group w-[270px] shrink-0 overflow-hidden rounded-2xl glass"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${grad}`} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_15%,rgba(255,255,255,0.35),transparent_45%)]" />
                <Badge
                  className={`absolute left-3 top-3 ${
                    p.listingType === 'SALE'
                      ? 'bg-emerald-500 text-white hover:bg-emerald-500'
                      : 'bg-amber-500 text-white hover:bg-amber-500'
                  }`}
                >
                  For {p.listingType === 'SALE' ? 'Sale' : 'Rent'}
                </Badge>
                <span className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold uppercase text-blue-700 backdrop-blur">
                  {p.type}
                </span>
              </div>

              <div className="p-3.5">
                <h3 className="truncate font-bold text-slate-900">{p.title}</h3>
                <div className="mt-1 flex items-baseline gap-1 text-blue-700">
                  <IndianRupee className="h-4 w-4" />
                  <span className="text-lg font-black tracking-tight">
                    {formatPrice(p.price, p.listingType).replace('₹', '')}
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-3 text-xs text-slate-600">
                  {p.bedrooms ? (
                    <span className="flex items-center gap-1">
                      <BedDouble className="h-3.5 w-3.5 text-blue-500" />
                      {p.bedrooms} BHK
                    </span>
                  ) : null}
                  {p.bathrooms ? (
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5 text-amber-500" />
                      {p.bathrooms}
                    </span>
                  ) : null}
                  {p.areaSqft ? (
                    <span className="flex items-center gap-1">
                      <Maximize className="h-3.5 w-3.5 text-slate-400" />
                      {p.areaSqft} sqft
                    </span>
                  ) : null}
                </div>

                <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="h-3 w-3 text-blue-500" />
                  {p.village?.name ?? 'Choutuppal'}
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
