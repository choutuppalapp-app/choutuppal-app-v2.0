'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, MapPin, Tag, SlidersHorizontal, X, Star, BadgeCheck,
  MessageCircle, Home as HomeIcon, IndianRupee, BedDouble, Maximize, Crown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { Listing, RealEstate, Category, Village } from '@prisma/client'

type ListingItem = Listing & {
  category: { name: string; slug: string } | null
  village: { name: string; slug: string } | null
}
type REItem = RealEstate & {
  village: { name: string; slug: string } | null
}

interface ExploreGridProps {
  listings: ListingItem[]
  realEstates: REItem[]
  villages: Pick<Village, 'id' | 'name' | 'slug'>[]
  categories: Pick<Category, 'id' | 'name' | 'slug'>[]
  initialCategory: string
  initialVillage: string
  initialQuery: string
}

type TabType = 'businesses' | 'realestate'

export function ExploreGrid({
  listings,
  realEstates,
  villages,
  categories,
  initialCategory,
  initialVillage,
  initialQuery,
}: ExploreGridProps) {
  const router = useRouter()
  const [tab, setTab] = useState<TabType>('businesses')
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [village, setVillage] = useState(initialVillage)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Client-side filtering (supplements server-side for the search query)
  const filteredListings = useMemo(() => {
    if (!query.trim()) return listings
    const q = query.toLowerCase()
    return listings.filter(
      (l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q),
    )
  }, [listings, query])

  const filteredRE = useMemo(() => {
    if (!query.trim()) return realEstates
    const q = query.toLowerCase()
    return realEstates.filter(
      (r) => r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q),
    )
  }, [realEstates, query])

  function applyFilters() {
    const params = new URLSearchParams()
    if (category !== 'all') params.set('category', category)
    if (village !== 'all') params.set('village', village)
    if (query.trim()) params.set('q', query.trim())
    router.push(`/explore?${params.toString()}`)
    setSheetOpen(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-24 md:pb-10">
      {/* Desktop sticky filter bar */}
      <div className="sticky top-16 z-30 hidden border-b border-white/40 bg-white/80 backdrop-blur-xl md:block">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search businesses, services, properties…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-400"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-10 w-[160px] bg-white">
              <Tag className="mr-1 h-3.5 w-3.5 text-amber-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={village} onValueChange={setVillage}>
            <SelectTrigger className="h-10 w-[160px] bg-white">
              <MapPin className="mr-1 h-3.5 w-3.5 text-blue-500" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Villages</SelectItem>
              {villages.map((v) => (
                <SelectItem key={v.id} value={v.slug}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={applyFilters} className="gap-2 gradient-brand text-white">
            <Search className="h-4 w-4" /> Search
          </Button>
        </div>
      </div>

      {/* Mobile top bar — just a Filters button */}
      <div className="sticky top-16 z-30 flex items-center gap-2 border-b border-white/40 bg-white/80 px-3 py-2 backdrop-blur-xl md:hidden">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <Button size="sm" variant="outline" onClick={() => setSheetOpen(true)} className="gap-1.5">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </Button>
      </div>

      {/* Mobile bottom sheet modal */}
      {sheetOpen ? (
        <div className="fixed inset-0 z-[60] md:hidden" onClick={() => setSheetOpen(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Filters</h3>
              <button onClick={() => setSheetOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Category</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10 w-full bg-white">
                    <Tag className="mr-1 h-3.5 w-3.5 text-amber-500" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">Village</label>
                <Select value={village} onValueChange={setVillage}>
                  <SelectTrigger className="h-10 w-full bg-white">
                    <MapPin className="mr-1 h-3.5 w-3.5 text-blue-500" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Villages</SelectItem>
                    {villages.map((v) => (
                      <SelectItem key={v.id} value={v.slug}>{v.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={applyFilters} className="w-full gap-2 gradient-brand text-white">
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-3 py-5 sm:px-4 lg:px-6">
        {/* Tab toggle */}
        <div className="mb-5 flex gap-2">
          <button
            onClick={() => setTab('businesses')}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              tab === 'businesses' ? 'gradient-brand text-white' : 'bg-white/60 text-slate-500',
            )}
          >
            Businesses ({filteredListings.length})
          </button>
          <button
            onClick={() => setTab('realestate')}
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              tab === 'realestate' ? 'gradient-brand text-white' : 'bg-white/60 text-slate-500',
            )}
          >
            Real Estate ({filteredRE.length})
          </button>
        </div>

        {/* Business/Service grid */}
        {tab === 'businesses' ? (
          filteredListings.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {filteredListings.map((l) => {
                const rating = (4 + ((l.views * 7) % 10) / 10).toFixed(1)
                return (
                  <Link
                    key={l.id}
                    href={`/business/${l.slug}`}
                    className="hover-lift group overflow-hidden rounded-2xl glass"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      {l.coverImage ? (
                        <img loading="lazy" decoding="async" src={l.coverImage} alt={l.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                      ) : (
                        <div className="grid h-full w-full place-items-center gradient-brand text-3xl font-black text-white">
                          {l.title.charAt(0)}
                        </div>
                      )}
                      {l.isFeatured ? (
                        <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                          <Crown className="h-2.5 w-2.5" /> Premium
                        </span>
                      ) : null}
                    </div>
                    <div className="p-2.5 md:p-3">
                      <h3 className="truncate text-xs font-bold text-slate-900 md:text-sm">{l.title}</h3>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500 md:text-xs">
                        <span className="flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {rating}
                        </span>
                        <span>·</span>
                        <span>{l.category?.name ?? 'Business'}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 md:text-xs">{l.village?.name ?? 'Choutuppal'}</span>
                        {l.whatsapp ? (
                          <MessageCircle className="h-3.5 w-3.5 text-green-500" />
                        ) : null}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        ) : null}

        {/* Real Estate grid */}
        {tab === 'realestate' ? (
          filteredRE.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {filteredRE.map((r) => (
                <Link
                  key={r.id}
                  href={`/business/${r.slug}`}
                  className="hover-lift group overflow-hidden rounded-2xl glass"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    {r.coverImage ? (
                      <img loading="lazy" decoding="async" src={r.coverImage} alt={r.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                    ) : (
                      <div className="h-full w-full bg-gradient-to-br from-blue-500 to-amber-400" />
                    )}
                    <Badge className={`absolute left-2 top-2 ${r.listingType === 'SALE' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                      For {r.listingType === 'SALE' ? 'Sale' : 'Rent'}
                    </Badge>
                  </div>
                  <div className="p-2.5 md:p-3">
                    <h3 className="truncate text-xs font-bold text-slate-900 md:text-sm">{r.title}</h3>
                    <div className="mt-0.5 flex items-baseline gap-0.5 text-blue-700">
                      <IndianRupee className="h-3 w-3 md:h-3.5 md:w-3.5" />
                      <span className="text-base font-black md:text-lg">
                        {new Intl.NumberFormat('en-IN').format(r.price).replace('₹', '')}{r.listingType === 'RENT' ? '/mo' : ''}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 md:text-xs">
                      {r.bedrooms ? <span className="flex items-center gap-0.5"><BedDouble className="h-3 w-3" /> {r.bedrooms}</span> : null}
                      {r.areaSqft ? <span className="flex items-center gap-0.5"><Maximize className="h-3 w-3" /> {r.areaSqft}</span> : null}
                      <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {r.village?.name ?? '—'}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )
        ) : null}

        {/* Lead CTA Button below explore cards */}
        <div className="mt-8 flex justify-center">
          <a
            href={`https://wa.me/919441348175?text=${encodeURIComponent('నమస్కారం చౌటుప్పల్ యాప్, మీ యాప్ లో బిజినెస్ లిస్ట్ చేయాలనుకుంటున్నాను. దయచేసి మార్గనిర్దేశనం చేయండి.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-blue-600 bg-white/80 px-4 py-1.5 text-sm font-medium text-blue-600 shadow-sm backdrop-blur transition-all hover:bg-blue-50"
          >
            <img src="/whatsapp.png" alt="WhatsApp" className="h-4 w-4 shrink-0" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            <span>మీ బిజినెస్ జోడించండి</span>
          </a>
        </div>
      </main>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="rounded-3xl glass p-10 text-center">
      <Search className="mx-auto h-10 w-10 text-slate-300" />
      <p className="mt-2 text-sm text-slate-500">No results found. Try adjusting your filters.</p>
    </div>
  )
}
