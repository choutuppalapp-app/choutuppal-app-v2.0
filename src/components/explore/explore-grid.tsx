'use client'

import Image from 'next/image'
import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Search,
  MapPin,
  Tag,
  SlidersHorizontal,
  X,
  Star,
  MessageCircle,
  IndianRupee,
  BedDouble,
  Maximize,
  Crown,
  UtensilsCrossed,
  HeartPulse,
  Car,
  GraduationCap,
  ShoppingBag,
  Wrench,
  Sprout,
  Truck,
  Smartphone,
  Store,
  Layers,
  Loader2,
  Globe,
  Flame,
  Armchair,
  Zap,
  BrickWall,
  Paintbrush,
  Shirt,
  Briefcase,
  Building2,
  PhoneCall,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getCoverUrl, getVillage } from '@/lib/listing-utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  services: Wrench,
  'real-estate': Building2,
  agriculture: Sprout,
  'agriculture-seeds': Sprout,
  transport: Truck,
  electronics: Smartphone,
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
      result = result.filter(
        (l) => l.category?.slug === category || l.categoryId === category
      )
    }

    if (village && village !== 'all') {
      result = result.filter(
        (l) => l.village?.slug === village || l.villageId === village
      )
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
      result = result.filter(
        (r) => r.village?.slug === village || r.villageId === village
      )
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

  const updateUrlParams = useCallback(
    (newCat: string, newVill: string, newQ: string, newTab: TabType) => {
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
    },
    [pathname]
  )

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

  function handleResetFilters() {
    setCategory('all')
    setVillage('all')
    setQuery('')
    const basePath = pathname.startsWith('/listings') ? '/listings' : '/explore'
    router.push(basePath)
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-24 md:pb-12">
      {/* 1. SEARCH BAR SECTION (Full Width Header Bar) */}
      <div className="border-b border-slate-200/80 bg-white py-3.5 shadow-xs">
        <div className="mx-auto flex max-w-7xl flex-col gap-2.5 px-3 sm:flex-row sm:items-center sm:gap-3 sm:px-4 lg:px-6">
          {/* Main Full-Width Search Input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search by business name, service, phone number, or village…"
              className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />
            {query ? (
              <button
                type="button"
                onClick={() => handleQueryChange('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                aria-label="Clear search query"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>

          {/* Desktop Village Selector & Action Controls */}
          <div className="hidden items-center gap-2 md:flex shrink-0">
            <Select value={village} onValueChange={handleVillageSelect}>
              <SelectTrigger className="h-11 w-[180px] rounded-2xl border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-700">
                <MapPin className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                <SelectValue placeholder="All Villages" />
              </SelectTrigger>
              <SelectContent className="max-h-72 rounded-2xl">
                <SelectItem value="all">All Villages (మండలం)</SelectItem>
                {villages.map((v) => (
                  <SelectItem key={v.id} value={v.slug}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(category !== 'all' || village !== 'all' || query) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-11 gap-1.5 rounded-2xl text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
            )}
          </div>

          {/* Mobile Filter Sheet Trigger */}
          <div className="flex items-center justify-between gap-2 md:hidden">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSheetOpen(true)}
              className="h-10 flex-1 gap-1.5 rounded-xl border-slate-200 bg-slate-50 text-xs font-bold text-slate-700"
            >
              <SlidersHorizontal className="h-3.5 w-3.5 text-blue-600" />
              <span>
                Village: {village === 'all' ? 'All' : villages.find((v) => v.slug === village)?.name || village}
              </span>
            </Button>
            {(category !== 'all' || village !== 'all' || query) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="h-10 gap-1 rounded-xl px-2.5 text-xs font-bold text-rose-600"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Clear
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM SHEET FOR VILLAGE / FILTERS */}
      {sheetOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setSheetOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-xs" />
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Filter By Village</h3>
              <button
                type="button"
                onClick={() => setSheetOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-slate-600">Select Village / Town</label>
                <Select
                  value={village}
                  onValueChange={(val) => {
                    handleVillageSelect(val)
                    setSheetOpen(false)
                  }}
                >
                  <SelectTrigger className="h-12 w-full rounded-2xl border-slate-200 bg-slate-50 text-sm font-semibold">
                    <MapPin className="mr-2 h-4 w-4 text-blue-600" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-72 rounded-2xl">
                    <SelectItem value="all">All Villages (అన్ని గ్రామాలు)</SelectItem>
                    {villages.map((v) => (
                      <SelectItem key={v.id} value={v.slug}>
                        {v.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={applyFilters}
                className="h-11 w-full rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-md hover:bg-blue-700"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 2. STICKY CONTAINER: 3-WAY TABS + CATEGORY FILTER PILLS */}
      <div className="sticky top-16 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-xs transition-all">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 lg:px-6">
          {/* PRIMARY 3-WAY TABS (Modern Segmented Control) */}
          <div className="flex w-full items-center justify-center">
            <div className="grid w-full max-w-2xl grid-cols-3 gap-1 rounded-2xl bg-slate-100/90 p-1.5 border border-slate-200/60 shadow-inner">
              {/* Tab 1: Businesses */}
              <button
                type="button"
                onClick={() => handleTabChange('businesses')}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs sm:text-sm font-bold transition-all duration-200',
                  tab === 'businesses'
                    ? 'bg-blue-600 text-white shadow-md scale-[1.02]'
                    : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                )}
              >
                <Store className="h-4 w-4 shrink-0" />
                <span className="truncate">Businesses</span>
                <span
                  className={cn(
                    'ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                    tab === 'businesses'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  )}
                >
                  {businesses.length}
                </span>
              </button>

              {/* Tab 2: Services */}
              <button
                type="button"
                onClick={() => handleTabChange('services')}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs sm:text-sm font-bold transition-all duration-200',
                  tab === 'services'
                    ? 'bg-blue-600 text-white shadow-md scale-[1.02]'
                    : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                )}
              >
                <Wrench className="h-4 w-4 shrink-0" />
                <span className="truncate">Services</span>
                <span
                  className={cn(
                    'ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                    tab === 'services'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  )}
                >
                  {services.length}
                </span>
              </button>

              {/* Tab 3: Real Estate */}
              <button
                type="button"
                onClick={() => handleTabChange('realestate')}
                className={cn(
                  'flex items-center justify-center gap-1.5 rounded-xl py-2 px-2 text-xs sm:text-sm font-bold transition-all duration-200',
                  tab === 'realestate'
                    ? 'bg-blue-600 text-white shadow-md scale-[1.02]'
                    : 'bg-transparent text-slate-600 hover:text-slate-900 hover:bg-white/60'
                )}
              >
                <Building2 className="h-4 w-4 shrink-0" />
                <span className="truncate">Real Estate</span>
                <span
                  className={cn(
                    'ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-extrabold',
                    tab === 'realestate'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700'
                  )}
                >
                  {totalRealEstateCount}
                </span>
              </button>
            </div>
          </div>

          {/* VISUAL DIVIDER */}
          <div className="my-2.5 border-t border-slate-100" />

          {/* CATEGORY FILTER PILLS (Single Horizontal Scrollable Line) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
            {/* All Categories Pill */}
            <button
              type="button"
              onClick={() => handleCategorySelect('all')}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-150',
                category === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'border border-slate-200 bg-slate-100/90 text-slate-700 hover:border-slate-300 hover:bg-slate-200'
              )}
            >
              <Layers className="h-3.5 w-3.5 shrink-0" />
              <span>All Categories</span>
            </button>

            {/* Dynamic Category Pills */}
            {categories.map((c) => {
              const IconComp = CATEGORY_ICON_MAP[c.slug] || Store
              const isActive = category === c.slug
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleCategorySelect(c.slug)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-150',
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'border border-slate-200 bg-slate-100/90 text-slate-700 hover:border-slate-300 hover:bg-slate-200 hover:text-blue-600'
                  )}
                >
                  <IconComp className="h-3.5 w-3.5 shrink-0" />
                  <span>{c.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 3. DYNAMIC CONTENT GRID */}
      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-4 lg:px-6">
        {/* Tab 1: Businesses Grid */}
        {tab === 'businesses' &&
          (businesses.length === 0 ? (
            <EmptyNotice
              title="No Businesses Found"
              subtitle="Try clearing the category or village filter to discover local shops and merchants in Choutuppal."
              onReset={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {businesses.map((l) => {
                const rating = (4 + (((l.views ?? 0) * 7) % 10) / 10).toFixed(1)
                const cover = getCoverUrl(l)
                const villageName = getVillage(l)
                return (
                  <Link
                    key={l.id}
                    href={`/business/${l.slug}`}
                    prefetch={true}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition hover:border-blue-400 hover:shadow-md"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                      <GridImage src={cover} alt={l.title} />
                      {l.isFeatured ? (
                        <span className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-extrabold text-white shadow-xs">
                          <Crown className="h-2.5 w-2.5" /> Premium
                        </span>
                      ) : null}
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-3">
                      <div>
                        <h3 className="line-clamp-1 text-xs font-bold text-slate-900 group-hover:text-blue-600 md:text-sm">
                          {l.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span className="flex items-center gap-0.5 font-semibold text-slate-700">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {rating}
                          </span>
                          <span>·</span>
                          <span className="truncate">{l.category?.name ?? 'Business'}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-400">
                        <span className="truncate">{villageName}</span>
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
                            className="rounded-lg p-1 text-blue-600 hover:bg-blue-50"
                          />
                          {l.whatsapp ? (
                            <MessageCircle className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}

        {/* Tab 2: Services Grid */}
        {tab === 'services' &&
          (services.length === 0 ? (
            <EmptyNotice
              title="No Services Found"
              subtitle="No mechanics, electricians, technicians or home services matched your criteria."
              onReset={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {services.map((l) => {
                const rating = (4.5 + (((l.views ?? 0) * 3) % 5) / 10).toFixed(1)
                const cover = getCoverUrl(l)
                const villageName = getVillage(l)
                return (
                  <div
                    key={l.id}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition hover:border-amber-400 hover:shadow-md"
                  >
                    <Link href={`/business/${l.slug}`} prefetch={true} className="block flex-1">
                      <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                        <GridImage src={cover} alt={l.title} />
                        <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-amber-600 px-2 py-0.5 text-[9px] font-bold text-white shadow-xs">
                          <Wrench className="h-2.5 w-2.5" /> Service
                        </span>
                      </div>

                      <div className="p-3">
                        <h3 className="line-clamp-1 text-xs font-bold text-slate-900 group-hover:text-blue-600 md:text-sm">
                          {l.title}
                        </h3>
                        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500">
                          <span className="flex items-center gap-0.5 font-semibold text-slate-700">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {rating}
                          </span>
                          <span>·</span>
                          <span className="truncate">{l.category?.name ?? 'Professional'}</span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-400 truncate">{villageName}</p>
                      </div>
                    </Link>

                    {/* Fast Call / WhatsApp Actions */}
                    <div className="grid grid-cols-3 gap-1 border-t border-slate-100 p-2">
                      {l.phone ? (
                        <a
                          href={`tel:${l.phone}`}
                          className="flex items-center justify-center gap-1 rounded-xl bg-blue-50 py-1.5 text-[10px] sm:text-[11px] font-bold text-blue-700 hover:bg-blue-100 transition"
                        >
                          <PhoneCall className="h-3 w-3 shrink-0" /> Call
                        </a>
                      ) : (
                        <Link
                          href={`/business/${l.slug}`}
                          className="flex items-center justify-center rounded-xl bg-slate-100 py-1.5 text-[10px] font-semibold text-slate-700"
                        >
                          Details
                        </Link>
                      )}

                      {l.whatsapp ? (
                        <a
                          href={`https://wa.me/91${l.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Hi ${l.title}, I found your service on Choutuppal App.`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() =>
                            trackWhatsAppClick({ id: l.id, slug: l.slug, title: l.title })
                          }
                          className="flex items-center justify-center gap-1 rounded-xl bg-emerald-50 py-1.5 text-[10px] sm:text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 transition active:scale-95"
                        >
                          <MessageCircle className="h-3 w-3 shrink-0" /> Chat
                        </a>
                      ) : (
                        <Link
                          href={`/business/${l.slug}`}
                          className="flex items-center justify-center rounded-xl bg-slate-100 py-1.5 text-[10px] font-semibold text-slate-700"
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
                        className="h-auto rounded-xl border-blue-200 bg-blue-50/50 py-1.5 px-1 text-[10px] font-bold text-blue-700 hover:bg-blue-100 justify-center"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ))}

        {/* Tab 3: Real Estate Grid */}
        {tab === 'realestate' &&
          (totalRealEstateCount === 0 ? (
            <EmptyNotice
              title="No Real Estate Found"
              subtitle="No open plots, commercial buildings, or houses matched your filters."
              onReset={handleResetFilters}
            />
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 md:gap-5 lg:grid-cols-4">
              {/* Properties from RealEstate Model */}
              {filteredRE.map((r) => {
                const reCover = getCoverUrl(r)
                return (
                  <Link
                    key={r.id}
                    href={`/business/${r.slug}`}
                    prefetch={true}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition hover:border-emerald-400 hover:shadow-md"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                      <GridImage src={reCover} alt={r.title} />
                      <Badge
                        className={`absolute left-2 top-2 ${
                          r.listingType === 'SALE' ? 'bg-emerald-600 text-white' : 'bg-amber-600 text-white'
                        }`}
                      >
                        For {r.listingType === 'SALE' ? 'Sale' : 'Rent'}
                      </Badge>
                    </div>

                    <div className="p-3">
                      <h3 className="line-clamp-1 text-xs font-bold text-slate-900 group-hover:text-blue-600 md:text-sm">
                        {r.title}
                      </h3>
                      <div className="mt-1 flex items-baseline gap-0.5 text-blue-700">
                        <IndianRupee className="h-3.5 w-3.5" />
                        <span className="text-base font-black md:text-lg">
                          {new Intl.NumberFormat('en-IN').format(r.price).replace('₹', '')}
                          {r.listingType === 'RENT' ? '/mo' : ''}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-500">
                        {r.bedrooms ? (
                          <span className="flex items-center gap-0.5">
                            <BedDouble className="h-3 w-3" /> {r.bedrooms}
                          </span>
                        ) : null}
                        {r.areaSqft ? (
                          <span className="flex items-center gap-0.5">
                            <Maximize className="h-3 w-3" /> {r.areaSqft} sqft
                          </span>
                        ) : null}
                        <span className="flex items-center gap-0.5 truncate">
                          <MapPin className="h-3 w-3 shrink-0" /> {r.village?.name ?? '—'}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}

              {/* Real Estate Items from Listing Model */}
              {listingRealEstate.map((l) => {
                const cover = getCoverUrl(l)
                const villageName = getVillage(l)
                return (
                  <Link
                    key={l.id}
                    href={`/business/${l.slug}`}
                    prefetch={true}
                    className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs transition hover:border-emerald-400 hover:shadow-md"
                  >
                    <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                      <GridImage src={cover} alt={l.title} />
                      <Badge className="absolute left-2 top-2 bg-emerald-600 text-white">Property</Badge>
                    </div>

                    <div className="p-3">
                      <h3 className="line-clamp-1 text-xs font-bold text-slate-900 group-hover:text-blue-600 md:text-sm">
                        {l.title}
                      </h3>
                      <p className="mt-1 text-[11px] text-slate-500 truncate">
                        {l.category?.name ?? 'Real Estate'}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span>{villageName}</span>
                        {l.phone && <span className="font-semibold text-slate-700">{l.phone}</span>}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          ))}

        {/* INFINITE SCROLL SENTINEL */}
        {tab === 'businesses' && (
          <div ref={observerTarget} className="flex w-full justify-center py-8">
            {loadingMore ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <span>Loading more listings…</span>
              </div>
            ) : hasMore ? (
              <div className="h-4" />
            ) : items.length > 0 ? (
              <p className="text-xs text-slate-400">All listings loaded</p>
            ) : null}
          </div>
        )}

        {/* BOTTOM LEAD CTA */}
        <div className="mt-10 flex justify-center">
          <a
            href={`https://wa.me/919494348175?text=${encodeURIComponent(
              'నమస్కారం చౌటుప్పల్ యాప్, మీ యాప్ లో బిజినెస్ లేదా సర్వీస్ లిస్ట్ చేయాలనుకుంటున్నాను. దయచేసి మార్గనిర్దేశనం చేయండి.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-blue-600 bg-white px-5 py-2.5 text-xs sm:text-sm font-bold text-blue-600 shadow-sm transition hover:bg-blue-50"
          >
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            <span>మీ బిజినెస్ / సర్వీస్ ఉచితంగా జోడించండి (WhatsApp)</span>
          </a>
        </div>
      </main>
    </div>
  )
}

function EmptyNotice({
  title,
  subtitle,
  onReset,
}: {
  title: string
  subtitle: string
  onReset?: () => void
}) {
  return (
    <div className="my-12 rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center shadow-xs">
      <div className="mx-auto mb-3.5 grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
        <Store className="h-7 w-7" />
      </div>
      <h4 className="text-base font-bold text-slate-900">{title}</h4>
      <p className="mx-auto mt-1.5 max-w-sm text-xs text-slate-500">{subtitle}</p>
      {onReset && (
        <Button
          onClick={onReset}
          variant="outline"
          size="sm"
          className="mt-4 rounded-xl border-slate-200 text-xs font-bold"
        >
          Reset All Filters
        </Button>
      )}
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
      src={error ? '/images/fallback-cover.webp' : src || '/images/fallback-cover.webp'}
      alt={alt}
      referrerPolicy="no-referrer"
      style={{ objectFit: 'cover' }}
      className="transition duration-300 group-hover:scale-105"
      onError={() => setError(true)}
    />
  )
}
