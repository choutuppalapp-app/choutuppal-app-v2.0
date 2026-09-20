import fs from 'fs'
import path from 'path'

export interface OfflineListing {
  id: string
  slug: string
  title: string
  description?: string | null
  status: string
  isFeatured: boolean
  isPremium?: boolean
  coverImage?: string | null
  logo?: string | null
  phone?: string | null
  secondaryPhone?: string | null
  whatsapp?: string | null
  email?: string | null
  website?: string | null
  address?: string | null
  mapEmbed?: string | null
  businessHours?: any
  servicesCatalog?: any
  avgRating?: number | null
  views?: number
  categoryId?: string | null
  villageId?: string | null
  category?: { id: string; name: string; slug: string; icon?: string | null; telugu?: string } | null
  village?: { id: string; name: string; slug: string } | null
  owner?: { id: string; name: string; username?: string; phone?: string | null; image?: string | null } | null
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

export interface ServiceCategory {
  id: string
  name: string
  slug: string
  icon: string
  telugu: string
  description: string
}

export const STANDARD_CATEGORIES: ServiceCategory[] = [
  { id: 'cmso8tgy60002v35o914xbblk', name: 'Automobile & Garage', slug: 'automobile', icon: 'Car', telugu: 'ఆటోమొబైల్ & గ్యారేజ్', description: 'Auto sales, service centers, spare parts & bike repair' },
  { id: 'cat-services', name: 'Services & Technicians', slug: 'services', icon: 'Wrench', telugu: 'సేవలు & టెక్నీషియన్లు', description: 'Electricians, plumbers, mechanics, AC repair & home services' },
  { id: 'cat-electrical', name: 'Electrical & Hardware', slug: 'electrical-hardware', icon: 'Zap', telugu: 'ఎలక్ట్రికల్ & హార్డ్‌వేర్', description: 'Electrical goods, wiring, motors & hardware tools' },
  { id: 'cat-medical', name: 'Health & Medical', slug: 'health-medical', icon: 'HeartPulse', telugu: 'వైద్యం & ఫార్మసీ', description: 'Hospitals, clinics, medical stores & diagnostic centers' },
  { id: 'cat-food', name: 'Food & Restaurants', slug: 'food-dining', icon: 'UtensilsCrossed', telugu: 'హోటల్స్ & రెస్టారెంట్లు', description: 'Restaurants, tiffin centers, bakeries & sweets' },
  { id: 'cat-internet', name: 'Internet & MeeSeva', slug: 'internet-cyber-cafe', icon: 'Globe', telugu: 'మీసేవ & నెట్ సెంటర్', description: 'MeeSeva, Cyber Cafe, Xerox, online forms & DTP' },
  { id: 'cat-building', name: 'Building Materials', slug: 'building-materials', icon: 'BrickWall', telugu: 'భవన నిర్మాణ సామాగ్రి', description: 'Cement, steel, sand, bricks & construction supply' },
  { id: 'cat-engineering', name: 'Engineering & Welding', slug: 'engineering-welding', icon: 'Flame', telugu: 'ఇంజనీరింగ్ & వెల్డింగ్', description: 'Welding works, fabrication, grill & shutter manufacturing' },
  { id: 'cat-agriculture', name: 'Agriculture & Seeds', slug: 'agriculture-seeds', icon: 'Sprout', telugu: 'వ్యవసాయం & ఎరువులు', description: 'Seeds, pesticides, fertilizers & agriculture equipment' },
  { id: 'cat-furniture', name: 'Furniture & Home', slug: 'furniture-home', icon: 'Armchair', telugu: 'ఫర్నిచర్ & డెకార్', description: 'Furniture showrooms, wood works, mattresses & home decor' },
  { id: 'cat-interior', name: 'Interior & Paints', slug: 'interior-decor', icon: 'Paintbrush', telugu: 'ఇంటీరియర్ & పెయింట్స్', description: 'Paints, false ceiling, glass, ACP & interior design' },
  { id: 'cat-retail', name: 'Retail & Fashion', slug: 'retail-fashion', icon: 'Shirt', telugu: 'షాపింగ్ & దుస్తులు', description: 'Cloth stores, readymade garments, footwear & matching' },
  { id: 'cat-agencies', name: 'Agencies & Distributors', slug: 'agencies-distributors', icon: 'Briefcase', telugu: 'ఏజెన్సీలు & హోల్‌సేల్', description: 'Wholesale dealers, commercial agencies & distribution' },
  { id: 'cat-realestate', name: 'Real Estate & Lands', slug: 'real-estate', icon: 'Building2', telugu: 'రియల్ ఎస్టేట్ & ప్లాట్లు', description: 'Open plots, farmland, commercial properties & houses' },
]

const CATEGORY_MAP_BY_SLUG = new Map(STANDARD_CATEGORIES.map((c) => [c.slug, c]))

let cachedListings: OfflineListing[] | null = null
let listingsByIdMap: Map<string, OfflineListing> | null = null
let listingsBySlugMap: Map<string, OfflineListing> | null = null
let cachedCategories: ServiceCategory[] | null = null
let cachedVillages: any[] | null = null

export function getOfflineListings(): OfflineListing[] {
  if (cachedListings) return cachedListings
  try {
    const filePath = path.join(process.cwd(), 'listings-backup.json')
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8')
      const rawList: OfflineListing[] = JSON.parse(data) || []
      
      // Deduplicate by Normalized Title + Phone and Unique Slug
      const seenTitles = new Set<string>()
      const seenSlugs = new Set<string>()
      const uniqueListings: OfflineListing[] = []

      for (const item of rawList) {
        if (!item || !item.title) continue
        const cleanTitle = item.title.trim().toLowerCase().replace(/\s+/g, ' ')
        const cleanPhone = (item.phone || '').replace(/\D/g, '')
        const dedupeKey = `${cleanTitle}|${cleanPhone}`

        if (seenTitles.has(dedupeKey)) {
          continue // skip duplicate
        }
        seenTitles.add(dedupeKey)

        // Ensure unique slug
        let slug = item.slug || cleanTitle.replace(/[^a-z0-9]+/g, '-').slice(0, 30)
        if (seenSlugs.has(slug)) {
          slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`
        }
        seenSlugs.add(slug)

        // Enrich category data
        const catSlug = item.category?.slug || 'services'
        const stdCat = CATEGORY_MAP_BY_SLUG.get(catSlug) || {
          id: item.category?.id || `cat-${catSlug}`,
          name: item.category?.name || 'Local Service',
          slug: catSlug,
          icon: item.category?.icon || 'Store',
          telugu: item.category?.name || 'సేవలు',
          description: '',
        }

        const normalizedItem: OfflineListing = {
          ...item,
          slug,
          status: item.status || 'APPROVED',
          avgRating: item.avgRating ?? (4.0 + (Math.abs(item.title.length * 7) % 10) / 10),
          views: typeof item.views === 'number' ? item.views : 15,
          category: {
            id: stdCat.id,
            name: stdCat.name,
            slug: stdCat.slug,
            icon: stdCat.icon,
            telugu: stdCat.telugu,
          },
          village: item.village || {
            id: 'cmsepb40r0000jv04tdwwd5cw',
            name: 'Choutuppal',
            slug: 'choutuppal',
          },
          owner: item.owner || {
            id: item.ownerId || 'cms0du1m40000v32slild2p1s',
            name: 'Business Owner',
            username: 'owner',
            phone: item.phone,
            image: null,
          },
        }

        uniqueListings.push(normalizedItem)
      }

      cachedListings = uniqueListings
      listingsByIdMap = new Map()
      listingsBySlugMap = new Map()

      for (const item of cachedListings) {
        if (item.id) listingsByIdMap.set(item.id, item)
        if (item.slug) listingsBySlugMap.set(item.slug, item)
      }

      return cachedListings
    }
  } catch (err) {
    console.warn('[OfflineData] Failed to load listings-backup.json:', err)
  }
  return []
}

export function getOfflineListingById(id: string): OfflineListing | null {
  if (!listingsByIdMap) getOfflineListings()
  return listingsByIdMap?.get(id) || null
}

export function getOfflineListingBySlug(slug: string): OfflineListing | null {
  if (!listingsBySlugMap) getOfflineListings()
  return listingsBySlugMap?.get(slug) || null
}

export function getOfflineCategories(): ServiceCategory[] {
  if (cachedCategories) return cachedCategories
  cachedCategories = STANDARD_CATEGORIES
  return cachedCategories
}

export function getOfflineVillages(): any[] {
  if (cachedVillages) return cachedVillages
  const listings = getOfflineListings()
  const villageMap = new Map<string, any>()
  for (const item of listings) {
    if (item.village && item.village.id) {
      if (!villageMap.has(item.village.id)) {
        villageMap.set(item.village.id, {
          id: item.village.id,
          name: item.village.name,
          slug: item.village.slug,
        })
      }
    }
  }
  if (villageMap.size === 0) {
    villageMap.set('cmsepb40r0000jv04tdwwd5cw', {
      id: 'cmsepb40r0000jv04tdwwd5cw',
      name: 'Choutuppal',
      slug: 'choutuppal',
    })
  }
  cachedVillages = Array.from(villageMap.values())
  return cachedVillages
}

export function getOfflineSettings(): any[] {
  return [
    { key: 'spin_enabled', value: 'true' },
    { key: 'hero_title', value: 'Choutuppal App' },
    { key: 'hero_subtitle', value: 'Your Town, All In One App' },
    { key: 'hero_bg_image', value: '/images/hero-banner.webp' },
  ]
}

export function getOfflineBanners(): any[] {
  return [
    {
      id: 'banner-welcome',
      title: 'Welcome to Choutuppal',
      imageUrl: '/images/hero-banner.webp',
      link: '/categories',
      isActive: true,
    },
  ]
}

