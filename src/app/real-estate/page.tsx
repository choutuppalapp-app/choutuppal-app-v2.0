import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { getOfflineRealEstates, STANDARD_VILLAGES } from '@/lib/offline-data'
import { Building2, MapPin, Phone, MessageSquare, Plus, CheckCircle2, BedDouble, Bath, Maximize2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'Real Estate & Properties in Choutuppal | Open Plots, Commercial & Houses',
  description: 'Verified real estate listings in Choutuppal, Panthangi, Lingojiguda, and nearby villages. Buy and sell plots, lands, flats, and commercial properties.',
}

async function getRealEstates() {
  let dbList: any[] = []
  try {
    const list = await prisma.realEstate.findMany({
      where: { status: 'APPROVED' },
      include: { village: true, owner: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    if (list && list.length > 0) dbList = list
  } catch {
    // fallback
  }

  const map = new Map<string, any>()
  if (Array.isArray(dbList)) {
    dbList.forEach((item) => item?.id && map.set(item.id, item))
  }
  const offline = getOfflineRealEstates().filter((r) => r.status === 'APPROVED' || !r.status)
  if (Array.isArray(offline)) {
    offline.forEach((item) => {
      if (item?.id) {
        let vil = item.village
        if (!vil || !vil.name) {
          const foundVil = STANDARD_VILLAGES.find((v) => v.id === item.villageId || v.slug === item.villageId) || STANDARD_VILLAGES[0]
          vil = { id: foundVil.id, name: foundVil.name, slug: foundVil.slug }
        }
        map.set(item.id, {
          ...item,
          village: vil,
          status: item.status || 'APPROVED',
        })
      }
    })
  }

  const merged = Array.from(map.values())
  return merged.length > 0 ? merged : getOfflineRealEstates()
}

export default async function RealEstatePage() {
  const properties = await getRealEstates()

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header Banner */}
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <Badge className="mb-3 bg-blue-500/20 text-blue-300 border-blue-400/30 hover:bg-blue-500/30">
              Verified Properties
            </Badge>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Choutuppal Real Estate &amp; Lands
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-300">
              Explore residential open plots, agricultural farmland, commercial buildings, and houses with direct owner contact.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/profile/listings/new"
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
                Post Property Ad
              </Link>
              <a
                href="https://wa.me/919494348175?text=Hi%20I%20am%20interested%20in%20Real%20Estate%20listings%20in%20Choutuppal"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 transition"
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp Real Estate Desk
              </a>
            </div>
          </div>
        </div>

        {/* Property Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <Building2 className="mx-auto h-12 w-12 text-slate-400" />
              <h3 className="mt-3 text-lg font-bold text-slate-900">No properties listed yet</h3>
              <p className="mt-1 text-sm text-slate-500">Be the first to list an open plot or property in Choutuppal!</p>
              <div className="mt-6">
                <Link
                  href="/profile/listings/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  List Your Property Now
                </Link>
              </div>
            </div>
          ) : (
            properties.map((item: any) => {
              const cover = item.coverImage || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80'
              const formattedPrice = item.price ? `₹${Number(item.price).toLocaleString('en-IN')}` : 'Price on Request'
              const contactNumber = item.contactPhone || item.contactWhatsapp || '9494348175'
              const waText = encodeURIComponent(`Hi, I am interested in your property listing: ${item.title} (${formattedPrice}) on Choutuppal App.`)

              return (
                <div
                  key={item.id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                    <Image
                      src={cover}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <Badge className="bg-slate-900/80 text-white backdrop-blur">
                        {item.type || 'PLOT'}
                      </Badge>
                      <Badge className="bg-blue-600 text-white">
                        {item.listingType === 'RENT' ? 'FOR RENT' : 'FOR SALE'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xl font-black text-blue-600">{formattedPrice}</span>
                      {item.negotiable && (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          Negotiable
                        </span>
                      )}
                    </div>

                    <h2 className="mt-2 text-base font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600">
                      {item.title}
                    </h2>

                    <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="line-clamp-1">{item.village?.name || item.address || 'Choutuppal'}</span>
                    </div>

                    {/* Features row */}
                    <div className="mt-4 flex items-center gap-4 border-t border-slate-100 pt-3 text-xs text-slate-600">
                      {item.areaSqft && (
                        <div className="flex items-center gap-1">
                          <Maximize2 className="h-3.5 w-3.5 text-slate-400" />
                          <span>{item.areaSqft} sq.ft</span>
                        </div>
                      )}
                      {item.bedrooms && (
                        <div className="flex items-center gap-1">
                          <BedDouble className="h-3.5 w-3.5 text-slate-400" />
                          <span>{item.bedrooms} BHK</span>
                        </div>
                      )}
                      {item.bathrooms && (
                        <div className="flex items-center gap-1">
                          <Bath className="h-3.5 w-3.5 text-slate-400" />
                          <span>{item.bathrooms} Bath</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-5 grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                      <a
                        href={`https://wa.me/91${contactNumber.replace(/\D/g, '') || '9494348175'}?text=${waText}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        WhatsApp
                      </a>
                      <a
                        href={`tel:${contactNumber}`}
                        className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        Call Owner
                      </a>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
