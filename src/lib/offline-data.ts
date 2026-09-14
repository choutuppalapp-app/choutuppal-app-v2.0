import fs from 'fs'
import path from 'path'

interface OfflineListing {
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
  whatsapp?: string | null
  avgRating?: number | null
  views?: number
  categoryId?: string | null
  villageId?: string | null
  category?: { id: string; name: string; slug: string; icon?: string | null } | null
  village?: { id: string; name: string; slug: string } | null
  [key: string]: any
}

let cachedListings: OfflineListing[] | null = null
let listingsByIdMap: Map<string, OfflineListing> | null = null
let listingsBySlugMap: Map<string, OfflineListing> | null = null
let cachedCategories: any[] | null = null
let cachedVillages: any[] | null = null

export function getOfflineListings(): OfflineListing[] {
  if (cachedListings) return cachedListings
  try {
    const filePath = path.join(process.cwd(), 'listings-backup.json')
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8')
      cachedListings = JSON.parse(data) || []
      listingsByIdMap = new Map()
      listingsBySlugMap = new Map()
      for (const item of cachedListings!) {
        if (item.id) listingsByIdMap.set(item.id, item)
        if (item.slug) listingsBySlugMap.set(item.slug, item)
      }
      return cachedListings || []
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

export function getOfflineCategories(): any[] {
  if (cachedCategories) return cachedCategories
  const listings = getOfflineListings()
  const catMap = new Map<string, any>()
  for (const item of listings) {
    if (item.category && item.category.id) {
      if (!catMap.has(item.category.id)) {
        catMap.set(item.category.id, {
          id: item.category.id,
          name: item.category.name,
          slug: item.category.slug,
          icon: item.category.icon || 'Store',
        })
      }
    }
  }
  cachedCategories = Array.from(catMap.values())
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
