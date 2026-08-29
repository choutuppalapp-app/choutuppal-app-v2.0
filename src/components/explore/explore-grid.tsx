'use client'
import Image from 'next/image';

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Search, MapPin, Tag, SlidersHorizontal, X, Star,
  MessageCircle, Home as HomeIcon, IndianRupee, BedDouble, Maximize, Crown,
  UtensilsCrossed, HeartPulse, Car, GraduationCap, ShoppingBag, Wrench,
  Sprout, Truck, Smartphone, Store, Layers, Loader2,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCoverUrl, getVillage } from '@/lib/listing-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { Listing, RealEstate, Category, Village } from '@prisma/client'

type ListingItem = {
  id: string
  title: string
  slug: string
  coverImage: string | null
  logo?: string | null
  avgRating?: number | null
  views?: number
  isFeatured?: boolean
  phone?: string | null
  secondaryPhone?: string | null
  whatsapp?: string | null
  categoryId?: string | null
  villageId?: string | null
  category?: { id?: string; name: string; slug: string; icon?: string | null } | null
  village?: { id?: string; name: string; slug: string } | null
  description?: string
}

type REItem = {
  id: string
  title: string
  slug: string
  coverImage: string | null
  price: number
  listingType: string
  bedrooms?: number | null
  areaSqft?: number | null
  villageId?: string | null
  village?: { id?: string; name: string; slug: string } | null
  description?: string
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

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  'food-dining': UtensilsCrossed,
  'health-medical': HeartPulse,
  'automobile': Car,
  'education': GraduationCap,
  'retail-shopping': ShoppingBag,
  'services': Wrench,
  'real-estate': HomeIcon,
  'agriculture': Sprout,
  'transport': Truck,
  'electronics': Smartphone,
}

export function ExploreGrid({
  listings: initialListings,
  realEstates,
  villages,
  categories,
  initialCategory,
  initialVillage,
  initialQuery,
}: ExploreGridProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [tab, setTab] = useState<TabType>('businesses')
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [village, setVillage] = useState(initialVillage)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Infinite Scroll state
  const [items, setItems] = useState<ListingItem[]>(initialListings)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialListings.length >= 24)
  const [loadingMore, setLoadingMore] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setItems(initialListings)
    setPage(1)
    setHasMore(initialListings.length >= 24)
  }, [initialListings])

  const fetchNextPage = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)

    const nextPage = page + 1
    const params = new URLSearchParams({
      page: String(nextPage),
      limit: '24',
    })
    if (category && category !== 'all') params.set('category', category)
    if (village && village !== 'all') params.set('village', village)
    if (query.trim()) params.set('q', query.trim())

    try {
      const res = await fetch(`/api/listings/public?${params.toString()}`)
      const j = await res.json()
      if (j.ok && Array.isArray(j.listings) && j.listings.length > 0) {
        setItems((prev) => {
          const existingIds = new Set(prev.map((i) => i.id))
          const newItems = j.listings.filter((i: ListingItem) => !existingIds.has(i.id))
          return [...prev, ...newItems]
        })
        setPage(nextPage)
        setHasMore(Boolean(j.hasMore))
      } else {
        setHasMore(false)
      }
    } catch (err) {
      console.error('Failed to fetch next page:', err)
      setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }, [page, hasMore, loadingMore, category, village, query])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !loadingMore) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 }
    )

    const target = observerTarget.current
    if (target) observer.observe(target)

    return () => {
      if (target) observer.unobserve(target)
    }
  }, [fetchNextPage, hasMore, loadingMore])

  // Dynamic instant client-side filtering by category, village, and search query
  const filteredListings = useMemo(() => {
    let result = items

    // Filter by selected category pill/select
    if (category && category !== 'all') {
      result = result.filter((l) => l.category?.slug === category)
    }

    // Filter by village
    if (village && village !== 'all') {
      result = result.filter((l) => l.village?.slug === village)
    }

    // Filter search query matching name (title), phone, village name, or description
    if (query.trim()) {
      const q = query.toLowerCase().trim()
      result = result.filter((l) => {
        const nameMatch = l.title.toLowerCase().includes(q)
        const phoneMatch = Boolean(
          (l.phone && l.phone.includes(q)) ||
          (l.secondaryPhone && l.secondaryPhone.includes(q)) ||
          (l.whatsapp && l.whatsapp.includes(q))
        )
        const villageMatch = Boolean(l.village?.name.toLowerCase().includes(q))
        const descMatch = Boolean(l.description && l.description.toLowerCase().includes(q))
        return nameMatch || phoneMatch || villageMatch || descMatch
      })
    }

    return result
  }, [items, category, village, query])

  const filteredRE = useMemo(() => {
    let result = realEstates

    if (village && village !== 'all') {
      result = result.filter((r) => r.village?.slug === village)
    }

    if (query.trim()) {
      const q = query.toLowerCase().trim()
      result = result.filter((r) => {
        const nameMatch = r.title.toLowerCase().includes(q)
        const villageMatch = Boolean(r.village?.name.toLowerCase().includes(q))
        const descMatch = Boolean(r.description && r.description.toLowerCase().includes(q))
        return nameMatch || villageMatch || descMatch
      })
    }

    return result
  }, [realEstates, village, query])

  function handleCategorySelect(slug: string) {
    setCategory(slug)
    const params = new URLSearchParams()
    if (slug !== 'all') params.set('category', slug)
    if (village !== 'all') params.set('village', village)
    if (query.trim()) params.set('q', query.trim())
    const queryString = params.toString()
    const basePath = pathname.startsWith('/listings') ? '/listings' : '/explore'
    router.push(queryString ? `${basePath}?${queryString}` : basePath)
  }

  function applyFilters() {
    const params = new URLSearchParams()
    if (category !== 'all') params.set('category', category)
    if (village !== 'all') params.set('village', village)
    if (query.trim()) params.set('q', query.trim())
    const basePath = pathname.startsWith('/listings') ? '/listings' : '/explore'
    router.push(`${basePath}?${params.toString()}`)
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
              placeholder="Search by business name, phone number, or village…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {query ? (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          <Select value={category} onValueChange={handleCategorySelect}>
            <SelectTrigger className="h-10 w-[170px] bg-white">
              <Tag className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
              <SelectValue placeholder="All Categories" />
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
              <MapPin className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
              <SelectValue placeholder="All Villages" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Villages</SelectItem>
              {villages.map((v) => (
                <SelectItem key={v.id} value={v.slug}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={applyFilters} className="gap-2 gradient-brand text-white shadow-md">
            <Search className="h-4 w-4" /> Filter
          </Button>
        </div>
      </div>

      {/* Mobile top bar with search input & filters trigger */}
      <div className="sticky top-16 z-30 flex items-center gap-2 border-b border-white/40 bg-white/80 px-3 py-2 backdrop-blur-xl md:hidden">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, phone, village…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm outline-none focus:border-blue-400"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
        <Button size="sm" variant="outline" onClick={() => setSheetOpen(true)} className="gap-1.5 shrink-0">
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
                <Select value={category} onValueChange={(val) => { setCategory(val); setSheetOpen(false); handleCategorySelect(val); }}>
                  <SelectTrigger className="h-10 w-full bg-white">
                    <Tag className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
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
                    <MapPin className="mr-1.5 h-3.5 w-3.5 text-blue-500" />
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
        {/* Category Navigation Pills */}
        <div className="mb-5 flex items-center gap-2 overflow-x-auto pb-2.5 no-scrollbar scroll-smooth">
          <button
            onClick={() => handleCategorySelect('all')}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 shadow-xs',
              category === 'all'
                ? 'gradient-brand text-white shadow-md font-bold scale-105'
                : 'bg-white/80 text-slate-700 hover:bg-white hover:text-blue-600 border border-slate-200/80 backdrop-blur'
            )}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>All Categories</span>
          </button>

          {categories.map((c) => {
            const IconComp = CATEGORY_ICON_MAP[c.slug] || Store
            const isActive = category === c.slug
            return (
              <button
                key={c.id}
                onClick={() => handleCategorySelect(c.slug)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-200 shadow-xs',
                  isActive
                    ? 'gradient-brand text-white shadow-md font-bold scale-105'
                    : 'bg-white/80 text-slate-700 hover:bg-white hover:text-blue-600 border border-slate-200/80 backdrop-blur'
                )}
              >
                <IconComp className="h-3.5 w-3.5" />
                <span>{c.name}</span>
              </button>
            )
          })}
        </div>

        {/* Tab toggle (Businesses vs Real Estate) */}
        <div className="mb-5 flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div className="flex gap-2">
            <button
              onClick={() => setTab('businesses')}
              className={cn(
                'rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition',
                tab === 'businesses' ? 'gradient-brand text-white shadow-xs' : 'bg-white/60 text-slate-600 hover:bg-white',
              )}
            >
              Businesses ({filteredListings.length})
            </button>
            <button
              onClick={() => setTab('realestate')}
              className={cn(
                'rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition',
                tab === 'realestate' ? 'gradient-brand text-white shadow-xs' : 'bg-white/60 text-slate-600 hover:bg-white',
              )}
            >
              Real Estate ({filteredRE.length})
            </button>
          </div>
          {(category !== 'all' || village !== 'all' || query) && (
            <button
              onClick={() => {
                setCategory('all')
                setVillage('all')
                setQuery('')
                const basePath = pathname.startsWith('/listings') ? '/listings' : '/explore'
                router.push(basePath)
              }}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Business/Service grid */}
        {tab === 'businesses' ? (
          filteredListings.length === 0 ? (
            <EmptyState query={query} category={category} />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {filteredListings.map((l, idx) => {
                const rating = (4 + (((l.views ?? 0) * 7) % 10) / 10).toFixed(1)
                const cover = getCoverUrl(l)
                const villageName = getVillage(l)
                return (
                  <Link
                    key={l.id}
                    href={`/business/${l.slug}`}
                    className="hover-lift group overflow-hidden rounded-2xl glass transition-all duration-200 hover:border-blue-300"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image width={800} height={800} decoding="async" loading="lazy" sizes="(max-width: 768px) 100vw, 33vw"
                        src={cover}
                        alt={l.title}
                        className="h-full w-full object-cover transition group-hover:scale-105"
                      />
                      {l.isFeatured ? (
                        <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 shadow-xs">
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
                        <span className="truncate">{l.category?.name ?? 'Business'}</span>
                      </div>
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400 md:text-xs">{villageName}</span>
                        {l.whatsapp ? (
                          <MessageCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                        ) : null}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        ) : null}

        {/* Infinite Scroll Sentinel */}
        {tab === 'businesses' && (
          <div ref={observerTarget} className="py-6 flex justify-center w-full">
            {loadingMore ? (
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>Loading more listings…</span>
              </div>
            ) : hasMore ? (
              <div className="h-4" />
            ) : items.length > 0 ? (
              <p className="text-xs text-slate-400">All available listings loaded</p>
            ) : null}
          </div>
        )}

        {/* Real Estate grid */}
        {tab === 'realestate' ? (
          filteredRE.length === 0 ? (
            <EmptyState query={query} category={category} />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {filteredRE.map((r) => {
                const reCover = getCoverUrl(r)
                return (
                  <Link
                    key={r.id}
                    href={`/business/${r.slug}`}
                    className="hover-lift group overflow-hidden rounded-2xl glass transition-all duration-200 hover:border-blue-300"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <Image width={800} height={800} loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, 33vw" src={reCover} alt={r.title} className="h-full w-full object-cover transition group-hover:scale-105" />
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
                      <span className="flex items-center gap-0.5 truncate"><MapPin className="h-3 w-3 shrink-0" /> {r.village?.name ?? '—'}</span>
                    </div>
                  </div>
                </Link>
                )
              })}
            </div>
          )
        ) : null}

        {/* Lead CTA Button below explore cards */}
        <div className="mt-8 flex justify-center">
          <a
            href={`https://wa.me/919494348175?text=${encodeURIComponent('నమస్కారం చౌటుప్పల్ యాప్, మీ యాప్ లో బిజినెస్ లిస్ట్ చేయాలనుకుంటున్నాను. దయచేసి మార్గనిర్దేశనం చేయండి.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-blue-600 bg-white/80 px-4 py-1.5 text-sm font-medium text-blue-600 shadow-xs backdrop-blur transition-all hover:bg-blue-50"
          >
            <MessageCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>మీ బిజినెస్ జోడించండి</span>
          </a>
        </div>
      </main>
    </div>
  )
}

function EmptyState({ query, category }: { query?: string; category?: string }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4 my-4 animate-pulse">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl glass border border-slate-200/50 p-2.5 space-y-2">
          <div className="aspect-[16/9] bg-slate-200/80 rounded-xl" />
          <div className="h-4 bg-slate-200/80 rounded-md w-3/4" />
          <div className="h-3 bg-slate-200/60 rounded-md w-1/2" />
        </div>
      ))}
    </div>
  )
}
