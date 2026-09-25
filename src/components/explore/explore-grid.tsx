'use client'
import Image from 'next/image'
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Search, MapPin, Tag, SlidersHorizontal, X, Star,
  MessageCircle, IndianRupee, BedDouble, Maximize, Crown,
  UtensilsCrossed, HeartPulse, Car, GraduationCap, ShoppingBag, Wrench,
  Sprout, Truck, Smartphone, Store, Layers, Loader2, Globe, Flame, Armchair,
  Zap, BrickWall, Paintbrush, Shirt, Briefcase, Building2, PhoneCall,
  QrCode, Sparkles,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCoverUrl, getVillage } from '@/lib/listing-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { trackWhatsAppClick } from '@/lib/track-whatsapp'
import { ListingQrCodeModal } from '@/components/business/listing-qr-code'
import type { Category, Village } from '@prisma/client'

type ListingItem = {
  id: string
  title: string
  slug: string
  type?: string | null
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
  initialTab?: 'businesses' | 'services' | 'realestate'
}

type TabType = 'businesses' | 'services' | 'realestate'

const SERVICE_CATEGORY_SLUGS = new Set([
  'services',
  'automobile',
  'engineering-welding',
  'electrical-hardware',
  'interior-decor',
  'building-materials',
  'transport',
  'plumber',
  'electrician',
  'mechanic',
])

const CATEGORY_ICON_MAP: Record<string, LucideIcon> = {
  'food-dining': UtensilsCrossed,
  'health-medical': HeartPulse,
  'automobile': Car,
  'education': GraduationCap,
  'retail-shopping': ShoppingBag,
  'retail-fashion': Shirt,
  'services': Wrench,
  'real-estate': Building2,
  'agriculture': Sprout,
  'agriculture-seeds': Sprout,
  'transport': Truck,
  'electronics': Smartphone,
  'internet-cyber-cafe': Globe,
  'engineering-welding': Flame,
  'furniture-home': Armchair,
  'electrical-hardware': Zap,
  'building-materials': BrickWall,
  'interior-decor': Paintbrush,
  'agencies-distributors': Briefcase,
}

export function ExploreGrid({
  listings: initialListings,
  realEstates,
  villages,
  categories,
  initialCategory,
  initialVillage,
  initialQuery,
  initialTab = 'businesses',
}: ExploreGridProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [tab, setTab] = useState<TabType>(initialTab)
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState(initialCategory)
  const [village, setVillage] = useState(initialVillage)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [selectedStandeeListing, setSelectedStandeeListing] = useState<ListingItem | null>(null)
  const [standeeDialogOpen, setStandeeDialogOpen] = useState(false)

  // Infinite Scroll state
  const [items, setItems] = useState<ListingItem[]>(initialListings)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialListings.length >= 24)
  const [loadingMore, setLoadingMore] = useState(false)
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setItems(initialListings)
    setPage(1)
    setHasMore(initialListings.length >= 24 && initialListings.length < 200)
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
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 6000)
      const res = await fetch(`/api/listings/public?${params.toString()}`, {
        signal: controller.signal,
      })
      clearTimeout(timeoutId)
      if (!res.ok) {
        setHasMore(false)
        return
      }
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
    } catch {
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

  // Filter all base items by category, village, and search query
  const filteredListings = useMemo(() => {
    let result = items

    if (category && category !== 'all') {
      result = result.filter((l) => l.category?.slug === category)
    }

    if (village && village !== 'all') {
      result = result.filter((l) => l.village?.slug === village)
    }

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

  // Split into Businesses, Services, and Real Estate
  const { businesses, services, listingRealEstate } = useMemo(() => {
    const bList: ListingItem[] = []
    const sList: ListingItem[] = []
    const reList: ListingItem[] = []

    for (const item of filteredListings) {
      const type = (item.type || '').toUpperCase()
      const catSlug = item.category?.slug?.toLowerCase() || ''

      if (type === 'REAL_ESTATE' || catSlug === 'real-estate') {
        reList.push(item)
      } else if (type === 'SERVICE' || SERVICE_CATEGORY_SLUGS.has(catSlug)) {
        sList.push(item)
      } else {
        bList.push(item)
      }
    }

    return { businesses: bList, services: sList, listingRealEstate: reList }
  }, [filteredListings])

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

  const totalRealEstateCount = filteredRE.length + listingRealEstate.length

  const updateUrlParams = useCallback((newCat: string, newVill: string, newQ: string, newTab: TabType) => {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams()
    if (newTab && newTab !== 'businesses') params.set('tab', newTab)
    if (newCat && newCat !== 'all') params.set('category', newCat)
    if (newVill && newVill !== 'all') params.set('village', newVill)
    if (newQ && newQ.trim()) params.set('q', newQ.trim())
    const queryString = params.toString()
    const basePath = pathname.startsWith('/listings') ? '/listings' : '/explore'
    const newUrl = queryString ? `${basePath}?${queryString}` : basePath
    window.history.replaceState(null, '', newUrl)
  }, [pathname])

  function handleTabChange(newTab: TabType) {
    setTab(newTab)
    updateUrlParams(category, village, query, newTab)
  }

  function handleCategorySelect(slug: string) {
    setCategory(slug)
    updateUrlParams(slug, village, query, tab)
  }

  function handleVillageSelect(vSlug: string) {
    setVillage(vSlug)
    updateUrlParams(category, vSlug, query, tab)
  }

  function handleQueryChange(newQ: string) {
    setQuery(newQ)
    updateUrlParams(category, village, newQ, tab)
  }

  function applyFilters() {
    updateUrlParams(category, village, query, tab)
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
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search by name, service, phone number, or village…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {query ? (
              <button
                onClick={() => handleQueryChange('')}
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
          <Select value={village} onValueChange={handleVillageSelect}>
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
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search name, phone, village…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 text-sm outline-none focus:border-blue-400"
          />
          {query ? (
            <button
              onClick={() => handleQueryChange('')}
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
                <Select value={category} onValueChange={(val) => { handleCategorySelect(val); setSheetOpen(false); }}>
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
                <Select value={village} onValueChange={(val) => handleVillageSelect(val)}>
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

        {/* Merchant Standee & QR Generator Hero Card */}
        <div className="mb-6 rounded-3xl border border-blue-200/80 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 p-4 sm:p-5 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
            <QrCode className="h-48 w-48 text-white" />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-300/30 mb-2">
                <Sparkles className="h-3 w-3" />
                <span>Official Merchant Standee & QR Code</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                మీ వ్యాపారం కోసం QR కోడ్ స్టాండీ ప్రింట్ చేసుకోండి
              </h3>
              <p className="text-xs text-blue-100/90 mt-1 leading-relaxed">
                Generate and print high-resolution verified merchant standee posters for your shop counter. Customers can scan to instantly open your shop page & connect on WhatsApp!
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {items.length > 0 && (
                <ListingQrCodeModal
                  listingId={selectedStandeeListing?.id || items[0]?.id || 'choutuppal'}
                  slug={selectedStandeeListing?.slug || items[0]?.slug || 'choutuppal'}
                  title={selectedStandeeListing?.title || items[0]?.title || 'Choutuppal Merchant'}
                  categoryName={selectedStandeeListing?.category?.name || items[0]?.category?.name}
                  villageName={selectedStandeeListing?.village?.name || items[0]?.village?.name}
                  logoUrl={selectedStandeeListing?.logo || items[0]?.logo}
                  phone={selectedStandeeListing?.phone || items[0]?.phone}
                  whatsapp={selectedStandeeListing?.whatsapp || items[0]?.whatsapp}
                  variant="button"
                  className="gradient-brand text-white border-none shadow-md font-bold px-4 py-2.5 rounded-2xl text-xs h-auto"
                />
              )}
            </div>
          </div>
        </div>

        {/* 3-Way Tab toggle (Businesses vs Services vs Real Estate) */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="grid grid-cols-3 gap-1.5 sm:flex sm:gap-2.5 p-1 rounded-2xl bg-slate-200/50 backdrop-blur-md">
            {/* Tab 1: Businesses */}
            <button
              onClick={() => handleTabChange('businesses')}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold transition-all duration-200',
                tab === 'businesses'
                  ? 'bg-white text-blue-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              )}
            >
              <Store className="h-4 w-4 text-blue-600 shrink-0" />
              <span>Businesses</span>
              <span className={cn(
                'rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                tab === 'businesses' ? 'bg-blue-100 text-blue-800' : 'bg-slate-300/60 text-slate-700'
              )}>
                {businesses.length}
              </span>
            </button>

            {/* Tab 2: Services */}
            <button
              onClick={() => handleTabChange('services')}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold transition-all duration-200',
                tab === 'services'
                  ? 'bg-white text-amber-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              )}
            >
              <Wrench className="h-4 w-4 text-amber-600 shrink-0" />
              <span>Services</span>
              <span className={cn(
                'rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                tab === 'services' ? 'bg-amber-100 text-amber-800' : 'bg-slate-300/60 text-slate-700'
              )}>
                {services.length}
              </span>
            </button>

            {/* Tab 3: Real Estate */}
            <button
              onClick={() => handleTabChange('realestate')}
              className={cn(
                'flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 sm:px-5 sm:py-2.5 text-xs sm:text-sm font-bold transition-all duration-200',
                tab === 'realestate'
                  ? 'bg-white text-emerald-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              )}
            >
              <Building2 className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Real Estate</span>
              <span className={cn(
                'rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                tab === 'realestate' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-300/60 text-slate-700'
              )}>
                {totalRealEstateCount}
              </span>
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
              className="text-xs text-blue-600 hover:underline font-semibold self-end sm:self-auto"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Tab 1: Businesses Grid */}
        {tab === 'businesses' && (
          businesses.length === 0 ? (
            <EmptyNotice
              title="No Businesses Found"
              subtitle="Try clearing category or village filters to view local shops and stores."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {businesses.map((l) => {
                const rating = (4 + (((l.views ?? 0) * 7) % 10) / 10).toFixed(1)
                const cover = getCoverUrl(l)
                const villageName = getVillage(l)
                return (
                  <Link
                    key={l.id}
                    href={`/business/${l.slug}`}
                    prefetch={true}
                    className="hover-lift group overflow-hidden rounded-2xl glass transition-all duration-200 hover:border-blue-300 flex flex-col"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                      <GridImage src={cover} alt={l.title} />
                      {l.isFeatured ? (
                        <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-bold text-amber-700 shadow-xs">
                          <Crown className="h-2.5 w-2.5" /> Premium
                        </span>
                      ) : null}
                    </div>
                    <div className="p-2.5 md:p-3 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="truncate text-xs font-bold text-slate-900 md:text-sm">{l.title}</h3>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500 md:text-xs">
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {rating}
                          </span>
                          <span>·</span>
                          <span className="truncate">{l.category?.name ?? 'Business'}</span>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-100 gap-1">
                        <span className="text-[10px] text-slate-400 md:text-xs truncate">{villageName}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <ListingQrCodeModal
                            listingId={l.id}
                            slug={l.slug}
                            title={l.title}
                            categoryName={l.category?.name}
                            villageName={l.village?.name}
                            logoUrl={l.logo}
                            phone={l.phone}
                            whatsapp={l.whatsapp}
                            variant="icon"
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                          />
                          {l.whatsapp ? (
                            <MessageCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        )}

        {/* Tab 2: Services Grid (Electricians, Plumbers, Mechanics, etc.) */}
        {tab === 'services' && (
          services.length === 0 ? (
            <EmptyNotice
              title="No Services Found"
              subtitle="No mechanics, electricians, or technicians matched your search."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {services.map((l) => {
                const rating = (4.5 + (((l.views ?? 0) * 3) % 5) / 10).toFixed(1)
                const cover = getCoverUrl(l)
                const villageName = getVillage(l)
                return (
                  <div
                    key={l.id}
                    className="hover-lift group overflow-hidden rounded-2xl glass transition-all duration-200 hover:border-amber-300 flex flex-col justify-between"
                  >
                    <Link href={`/business/${l.slug}`} prefetch={true} className="block">
                      <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                        <GridImage src={cover} alt={l.title} />
                        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-amber-500/90 text-white px-2 py-0.5 text-[9px] font-bold shadow-xs backdrop-blur-xs">
                          <Wrench className="h-2.5 w-2.5" /> Service
                        </span>
                      </div>
                      <div className="p-2.5 md:p-3">
                        <h3 className="truncate text-xs font-bold text-slate-900 md:text-sm">{l.title}</h3>
                        <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500 md:text-xs">
                          <span className="flex items-center gap-0.5">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {rating}
                          </span>
                          <span>·</span>
                          <span className="truncate">{l.category?.name ?? 'Professional'}</span>
                        </div>
                        <p className="mt-1 text-[10px] text-slate-400 truncate">{villageName}</p>
                      </div>
                    </Link>

                    {/* Quick Call / WhatsApp / QR Action Bar */}
                    <div className="px-2.5 pb-2.5 pt-1 grid grid-cols-3 gap-1 border-t border-slate-100">
                      {l.phone ? (
                        <a
                          href={`tel:${l.phone}`}
                          className="flex items-center justify-center gap-0.5 rounded-lg bg-blue-50 py-1.5 text-[10px] sm:text-[11px] font-semibold text-blue-700 hover:bg-blue-100 transition"
                        >
                          <PhoneCall className="h-3 w-3 shrink-0" /> Call
                        </a>
                      ) : (
                        <Link
                          href={`/business/${l.slug}`}
                          className="flex items-center justify-center rounded-lg bg-slate-100 py-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-700"
                        >
                          Details
                        </Link>
                      )}

                      {l.whatsapp ? (
                        <a
                          href={`https://wa.me/91${l.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi ${l.title}, I found your service on Choutuppal App.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => trackWhatsAppClick({ id: l.id, slug: l.slug, title: l.title })}
                          className="flex items-center justify-center gap-0.5 rounded-lg bg-emerald-50 py-1.5 text-[10px] sm:text-[11px] font-semibold text-emerald-700 hover:bg-emerald-100 transition active:scale-95"
                        >
                          <MessageCircle className="h-3 w-3 shrink-0" /> Book
                        </a>
                      ) : (
                        <Link
                          href={`/business/${l.slug}`}
                          className="flex items-center justify-center rounded-lg bg-slate-100 py-1.5 text-[10px] sm:text-[11px] font-semibold text-slate-700"
                        >
                          View
                        </Link>
                      )}

                      <ListingQrCodeModal
                        listingId={l.id}
                        slug={l.slug}
                        title={l.title}
                        categoryName={l.category?.name}
                        villageName={l.village?.name}
                        logoUrl={l.logo}
                        phone={l.phone}
                        whatsapp={l.whatsapp}
                        variant="button"
                        className="h-auto py-1.5 px-1 text-[10px] sm:text-[11px] rounded-lg border-blue-200 bg-blue-50/50 text-blue-700 font-bold hover:bg-blue-100 justify-center"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )
        )}

        {/* Tab 3: Real Estate Grid (Plots, Houses, Rentals) */}
        {tab === 'realestate' && (
          totalRealEstateCount === 0 ? (
            <EmptyNotice
              title="No Real Estate Found"
              subtitle="No plots, houses, or commercial properties matched your criteria."
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-6 lg:grid-cols-4">
              {/* Items from RealEstate model */}
              {filteredRE.map((r) => {
                const reCover = getCoverUrl(r)
                return (
                  <Link
                    key={r.id}
                    href={`/business/${r.slug}`}
                    prefetch={true}
                    className="hover-lift group overflow-hidden rounded-2xl glass transition-all duration-200 hover:border-emerald-300"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                      <GridImage src={reCover} alt={r.title} />
                      <Badge className={`absolute left-2 top-2 ${r.listingType === 'SALE' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'}`}>
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
                        {r.areaSqft ? <span className="flex items-center gap-0.5"><Maximize className="h-3 w-3" /> {r.areaSqft} sqft</span> : null}
                        <span className="flex items-center gap-0.5 truncate"><MapPin className="h-3 w-3 shrink-0" /> {r.village?.name ?? '—'}</span>
                      </div>
                    </div>
                  </Link>
                )
              })}

              {/* Items from Listing model with type = REAL_ESTATE */}
              {listingRealEstate.map((l) => {
                const cover = getCoverUrl(l)
                const villageName = getVillage(l)
                return (
                  <Link
                    key={l.id}
                    href={`/business/${l.slug}`}
                    prefetch={true}
                    className="hover-lift group overflow-hidden rounded-2xl glass transition-all duration-200 hover:border-emerald-300"
                  >
                    <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
                      <GridImage src={cover} alt={l.title} />
                      <Badge className="absolute left-2 top-2 bg-emerald-600 text-white">
                        Property
                      </Badge>
                    </div>
                    <div className="p-2.5 md:p-3">
                      <h3 className="truncate text-xs font-bold text-slate-900 md:text-sm">{l.title}</h3>
                      <p className="mt-1 text-[10px] text-slate-500 truncate">{l.category?.name ?? 'Real Estate'}</p>
                      <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400 md:text-xs">
                        <span>{villageName}</span>
                        {l.phone && <span className="font-semibold text-slate-700">{l.phone}</span>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )
        )}

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

        {/* Lead CTA Button below explore cards */}
        <div className="mt-8 flex justify-center">
          <a
            href={`https://wa.me/919494348175?text=${encodeURIComponent('నమస్కారం చౌటుప్పల్ యాప్, మీ యాప్ లో బిజినెస్ లేదా సర్వీస్ లిస్ట్ చేయాలనుకుంటున్నాను. దయచేసి మార్గనిర్దేశనం చేయండి.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-blue-600 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-600 shadow-xs backdrop-blur transition-all hover:bg-blue-50"
          >
            <MessageCircle className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>మీ బిజినెస్ / సర్వీస్ జోడించండి (WhatsApp)</span>
          </a>
        </div>
      </main>
    </div>
  )
}

function EmptyNotice({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="my-10 rounded-2xl border border-dashed border-slate-300 bg-white/60 p-8 text-center backdrop-blur-xs">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
        <Store className="h-6 w-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-800 md:text-base">{title}</h4>
      <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">{subtitle}</p>
    </div>
  )
}

function GridImage({ src, alt }: { src: string; alt: string }) {
  const [error, setError] = useState(false)
  return (
    <Image 
      fill
      decoding="async" 
      loading="lazy" 
      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
      src={error ? '/images/fallback-cover.webp' : (src || '/images/fallback-cover.webp')}
      alt={alt}
      referrerPolicy="no-referrer"
      style={{ objectFit: 'cover' }}
      className="transition group-hover:scale-105"
      onError={() => setError(true)}
    />
  )
}
