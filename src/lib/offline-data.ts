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
  clicks?: number
  whatsappClicks?: number
  categoryId?: string | null
  villageId?: string | null
  category?: { id: string; name: string; slug: string; icon?: string | null; telugu?: string } | null
  village?: { id: string; name: string; slug: string } | null
  owner?: { id: string; name: string; username?: string; phone?: string | null; email?: string | null; image?: string | null } | null
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
  { id: 'cat-automobile', name: 'Automobile & Garage', slug: 'automobile', icon: 'Car', telugu: 'ఆటోమొబైల్ & గ్యారేజ్', description: 'Auto sales, service centers, spare parts & bike repair' },
  { id: 'cat-services', name: 'Services & Technicians', slug: 'services', icon: 'Wrench', telugu: 'సేవలు & టెక్నీషియన్లు', description: 'Electricians, plumbers, mechanics, AC repair & home services' },
  { id: 'cat-electrical', name: 'Electrical & Hardware', slug: 'electrical-hardware', icon: 'Zap', telugu: 'ఎలక్ట్రికల్ & హార్డ్‌వేర్', description: 'Electrical goods, wiring, motors & hardware tools' },
  { id: 'cat-health', name: 'Health & Medical', slug: 'health-medical', icon: 'HeartPulse', telugu: 'వైద్యం & ఫార్మసీ', description: 'Hospitals, clinics, medical stores & diagnostic centers' },
  { id: 'cat-food', name: 'Food & Dining', slug: 'food-dining', icon: 'UtensilsCrossed', telugu: 'హోటల్స్ & రెస్టారెంట్లు', description: 'Restaurants, tiffin centers, bakeries & sweets' },
  { id: 'cat-internet', name: 'Internet & MeeSeva', slug: 'internet-cyber-cafe', icon: 'Globe', telugu: 'మీసేవ & నెట్ సెంటర్', description: 'MeeSeva, Cyber Cafe, Xerox, online forms & DTP' },
  { id: 'cat-building', name: 'Building Materials', slug: 'building-materials', icon: 'BrickWall', telugu: 'భవన నిర్మాణ సామాగ్రి', description: 'Cement, steel, sand, bricks & construction supply' },
  { id: 'cat-engineering', name: 'Engineering & Welding', slug: 'engineering-welding', icon: 'Flame', telugu: 'ఇంజనీరింగ్ & వెల్డింగ్', description: 'Welding works, fabrication, grill & shutter manufacturing' },
  { id: 'cat-agriculture', name: 'Agriculture & Seeds', slug: 'agriculture', icon: 'Sprout', telugu: 'వ్యవసాయం & ఎరువులు', description: 'Seeds, pesticides, fertilizers & agriculture equipment' },
  { id: 'cat-furniture', name: 'Furniture & Home', slug: 'furniture-home', icon: 'Armchair', telugu: 'ఫర్నిచర్ & డెకార్', description: 'Furniture showrooms, wood works, mattresses & home decor' },
  { id: 'cat-interior', name: 'Interior & Paints', slug: 'interior-decor', icon: 'Paintbrush', telugu: 'ఇంటీరియర్ & పెయింట్స్', description: 'Paints, false ceiling, glass, ACP & interior design' },
  { id: 'cat-retail', name: 'Retail Shopping', slug: 'retail-shopping', icon: 'ShoppingBag', telugu: 'షాపింగ్ & దుస్తులు', description: 'Supermarkets, cloth stores, readymade garments, footwear' },
  { id: 'cat-realestate', name: 'Real Estate & Lands', slug: 'real-estate', icon: 'Home', telugu: 'రియల్ ఎస్టేట్ & ప్లాట్లు', description: 'Open plots, farmland, commercial properties & houses' },
  { id: 'cat-education', name: 'Education & Coaching', slug: 'education', icon: 'GraduationCap', telugu: 'విద్య & కోచింగ్', description: 'Schools, colleges, coaching centers & tuition classes' },
  { id: 'cat-electronics', name: 'Electronics & Mobiles', slug: 'electronics', icon: 'Smartphone', telugu: 'మొబైల్స్ & ఎలక్ట్రానిక్స్', description: 'Smartphones, repairs, computers & home appliances' },
  { id: 'cat-transport', name: 'Transport & Logistics', slug: 'transport', icon: 'Truck', telugu: 'రవాణా & ట్రాన్స్‌పోర్ట్', description: 'Auto, goods transport, tempo, cabs & parcel service' },
]

export const STANDARD_VILLAGES = [
  { id: 'v-choutuppal', name: 'Choutuppal Town', slug: 'choutuppal', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-panthangi', name: 'Panthangi', slug: 'panthangi', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-malkapur', name: 'Malkapur', slug: 'malkapur', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-peddakondur', name: 'Peddakondur', slug: 'peddakondur', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-lingojiguda', name: 'Lingoji Guda', slug: 'lingoji-guda', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-koyalagudem', name: 'Koyalagudem', slug: 'koyalagudem', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-lakkaram', name: 'Lakkaram', slug: 'lakkaram', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-tupranpet', name: 'Tupranpet', slug: 'tupranpet', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-tallasingaram', name: 'Tallasingaram', slug: 'tallasingaram', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-allapur', name: 'Allapur', slug: 'allapur', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-chinnakondur', name: 'Chinna Kondur', slug: 'chinna-kondur', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-devalamma', name: 'Devalamma Nagaram', slug: 'devalamma-nagaram', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-jaikesaram', name: 'Jai Kesaram', slug: 'jai-kesaram', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-khairathpur', name: 'Khairathpur', slug: 'khairathpur', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-nelapatla', name: 'Nelapatla', slug: 'nelapatla', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-peepalpahad', name: 'Peepal Pahad', slug: 'peepal-pahad', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-swamulavari', name: 'Swamulavari Lingotam', slug: 'swamulavari-lingotam', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-tangadpalle', name: 'Tangad Palle', slug: 'tangad-palle', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  { id: 'v-yellagiri', name: 'Yellagiri', slug: 'yellagiri', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
]

/**
 * Empty content stores (Zero dummy data returned on empty database)
 */
export const INITIAL_OFFLINE_LISTINGS: OfflineListing[] = []
let offlineListingsStore: OfflineListing[] = []

export function getOfflineListings(): OfflineListing[] {
  return offlineListingsStore
}

export function getOfflineListingById(id: string): OfflineListing | null {
  return offlineListingsStore.find((l) => l.id === id) || null
}

export function getOfflineListingBySlug(slug: string): OfflineListing | null {
  const clean = slug.toLowerCase().trim()
  return offlineListingsStore.find((l) => l.slug?.toLowerCase() === clean || l.id === clean) || null
}

export function saveOfflineListing(listing: Partial<OfflineListing> & { id?: string; title?: string }): OfflineListing {
  const now = new Date().toISOString()
  const id = listing.id || `listing_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
  const slug = listing.slug || (listing.title ? listing.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') : `listing-${Date.now()}`)

  const catObj = STANDARD_CATEGORIES.find((c) => c.id === listing.categoryId || c.slug === listing.categoryId) || STANDARD_CATEGORIES[0]
  const vilObj = STANDARD_VILLAGES.find((v) => v.id === listing.villageId || v.slug === listing.villageId) || STANDARD_VILLAGES[0]

  const existingIdx = offlineListingsStore.findIndex((l) => l.id === id || l.slug === slug)

  if (existingIdx >= 0) {
    const updated: OfflineListing = {
      ...offlineListingsStore[existingIdx],
      ...listing,
      id: offlineListingsStore[existingIdx].id,
      category: catObj ? { id: catObj.id, name: catObj.name, slug: catObj.slug, icon: catObj.icon, telugu: catObj.telugu } : offlineListingsStore[existingIdx].category,
      village: vilObj ? { id: vilObj.id, name: vilObj.name, slug: vilObj.slug } : offlineListingsStore[existingIdx].village,
      updatedAt: now,
    }
    offlineListingsStore[existingIdx] = updated
    return updated
  }

  const newListing: OfflineListing = {
    id,
    slug,
    title: listing.title || 'New Shop Listing',
    description: listing.description || '',
    status: listing.status || 'APPROVED',
    isFeatured: listing.isFeatured ?? false,
    isPremium: listing.isPremium ?? false,
    coverImage: listing.coverImage || null,
    phone: listing.phone || '9494348175',
    whatsapp: listing.whatsapp || listing.phone || '9494348175',
    address: listing.address || 'Choutuppal, Telangana',
    avgRating: listing.avgRating ?? 5.0,
    views: listing.views ?? 0,
    clicks: listing.clicks ?? 0,
    whatsappClicks: listing.whatsappClicks ?? 0,
    categoryId: catObj.id,
    villageId: vilObj.id,
    category: { id: catObj.id, name: catObj.name, slug: catObj.slug, icon: catObj.icon, telugu: catObj.telugu },
    village: { id: vilObj.id, name: vilObj.name, slug: vilObj.slug },
    owner: listing.owner || { id: 'cms0du1m40000v32slild2p1s', name: 'Admin', username: 'admin', phone: '9494348175' },
    createdAt: now,
    updatedAt: now,
  }

  offlineListingsStore.unshift(newListing)
  return newListing
}

export function deleteOfflineListing(id: string): boolean {
  const initialLen = offlineListingsStore.length
  offlineListingsStore = offlineListingsStore.filter((l) => l.id !== id && l.slug !== id)
  return offlineListingsStore.length < initialLen
}

export function getOfflineCategories(): ServiceCategory[] {
  return STANDARD_CATEGORIES
}

export function getOfflineVillages(): any[] {
  return STANDARD_VILLAGES
}

export function getOfflineSettings(): any[] {
  return [
    { key: 'spin_enabled', value: 'true' },
    { key: 'pricing_free', value: 'true' },
    { key: 'banner_free', value: 'true' },
    { key: 'ads_paid', value: 'false' },
    { key: 'banner_price', value: '99' },
    { key: 'announcement_ticker', value: 'చౌటుప్పల్ సూపర్ యాప్‌లోకి స్వాగతం!' },
    { key: 'hero_title', value: 'చౌటుప్పల్ సూపర్ యాప్' },
    { key: 'hero_subtitle', value: 'మీ పట్టణం, మీ వ్యాపారాలు - అన్నీ ఒకే యాప్‌లో' },
    { key: 'hero_bg_image', value: '' },
  ]
}

const OFFLINE_NEWS_ARTICLES: any[] = []
let offlineNewsStore: any[] = []

export function getOfflineNews(): any[] {
  return offlineNewsStore
}

export function getOfflineNewsBySlug(slug: string): any | null {
  const cleanSlug = slug.toLowerCase().trim()
  return (
    offlineNewsStore.find(
      (n) => n.slug.toLowerCase() === cleanSlug || n.id.toLowerCase() === cleanSlug
    ) ||
    offlineBlogsStore.find(
      (b) => b.slug.toLowerCase() === cleanSlug || b.id.toLowerCase() === cleanSlug
    ) ||
    null
  )
}

export function saveOfflineNews(newsItem: any): any {
  const now = new Date()
  const id = newsItem.id || `news-${Date.now()}`
  const slug = newsItem.slug || (newsItem.title ? newsItem.title.toLowerCase().replace(/[^a-z0-9\u0C00-\u0C7F]+/g, '-').replace(/^-|-$/g, '').slice(0, 45) + '-' + Math.random().toString(36).substring(2, 5) : `news-${Date.now()}`)

  const existingIdx = offlineNewsStore.findIndex((n) => n.id === id || n.slug === slug)
  if (existingIdx >= 0) {
    const updated = {
      ...offlineNewsStore[existingIdx],
      ...newsItem,
      id: offlineNewsStore[existingIdx].id,
      updatedAt: now,
    }
    offlineNewsStore[existingIdx] = updated
    return updated
  }

  const newItem = {
    id,
    slug,
    title: newsItem.title || 'News Update',
    summary: newsItem.summary || (newsItem.content ? newsItem.content.slice(0, 120) : ''),
    content: newsItem.content || '',
    image: newsItem.image || null,
    tags: newsItem.tags || ['Choutuppal', 'News'],
    isPublished: newsItem.isPublished ?? true,
    views: newsItem.views || 0,
    createdAt: now,
    updatedAt: now,
    author: newsItem.author || { name: 'చౌటుప్పల్ న్యూస్ డెస్క్' },
  }
  offlineNewsStore.unshift(newItem)
  return newItem
}

export function deleteOfflineNews(id: string): boolean {
  const initial = offlineNewsStore.length
  offlineNewsStore = offlineNewsStore.filter((n) => n.id !== id && n.slug !== id)
  return offlineNewsStore.length < initial
}

const OFFLINE_BLOG_POSTS: any[] = []
let offlineBlogsStore: any[] = []

export function getOfflineBlogs(): any[] {
  return offlineBlogsStore
}

export function getOfflineBlogBySlug(slug: string): any | null {
  const cleanSlug = slug.toLowerCase().trim()
  return (
    offlineBlogsStore.find(
      (b) => b.slug.toLowerCase() === cleanSlug || b.id.toLowerCase() === cleanSlug
    ) ||
    offlineNewsStore.find(
      (n) => n.slug.toLowerCase() === cleanSlug || n.id.toLowerCase() === cleanSlug
    ) ||
    null
  )
}

export function saveOfflineBlog(blogItem: any): any {
  const now = new Date()
  const id = blogItem.id || `blog-${Date.now()}`
  const slug = blogItem.slug || (blogItem.title ? blogItem.title.toLowerCase().replace(/[^a-z0-9\u0C00-\u0C7F]+/g, '-').replace(/^-|-$/g, '').slice(0, 45) + '-' + Math.random().toString(36).substring(2, 5) : `blog-${Date.now()}`)

  const existingIdx = offlineBlogsStore.findIndex((b) => b.id === id || b.slug === slug)
  if (existingIdx >= 0) {
    const updated = {
      ...offlineBlogsStore[existingIdx],
      ...blogItem,
      id: offlineBlogsStore[existingIdx].id,
      updatedAt: now,
    }
    offlineBlogsStore[existingIdx] = updated
    return updated
  }

  const newItem = {
    id,
    slug,
    title: blogItem.title || 'Blog Post',
    excerpt: blogItem.excerpt || (blogItem.content ? blogItem.content.slice(0, 120) : ''),
    content: blogItem.content || '',
    coverImage: blogItem.coverImage || blogItem.image || null,
    category: blogItem.category || 'General',
    tags: blogItem.tags || ['Choutuppal', 'Guide'],
    isPublished: blogItem.isPublished ?? true,
    views: blogItem.views || 0,
    createdAt: now,
    updatedAt: now,
    author: blogItem.author || { name: 'చౌటుప్పల్ బ్లాగ్ డెస్క్' },
  }
  offlineBlogsStore.unshift(newItem)
  return newItem
}

export function deleteOfflineBlog(id: string): boolean {
  const initial = offlineBlogsStore.length
  offlineBlogsStore = offlineBlogsStore.filter((b) => b.id !== id && b.slug !== id)
  return offlineBlogsStore.length < initial
}

const INITIAL_BANNERS: any[] = []
let offlineBannersStore: any[] = []

export function getOfflineBanners(): any[] {
  return offlineBannersStore
}

export function saveOfflineBanner(banner: any): any {
  const id = banner.id || `banner_${Date.now()}`
  const existingIdx = offlineBannersStore.findIndex((b) => b.id === id)
  if (existingIdx >= 0) {
    const updated = { ...offlineBannersStore[existingIdx], ...banner, id }
    offlineBannersStore[existingIdx] = updated
    return updated
  }
  const newBanner = {
    id,
    title: banner.title || 'Special Banner Ad',
    imageUrl: banner.imageUrl || '',
    link: banner.link || '/categories',
    position: banner.position || 'HOME_TOP',
    status: banner.status || 'APPROVED',
    isActive: banner.isActive ?? true,
    createdAt: new Date().toISOString(),
  }
  offlineBannersStore.unshift(newBanner)
  return newBanner
}

export function deleteOfflineBanner(id: string): boolean {
  const initial = offlineBannersStore.length
  offlineBannersStore = offlineBannersStore.filter((b) => b.id !== id)
  return offlineBannersStore.length < initial
}

const INITIAL_STORIES: any[] = []
let offlineStoriesStore: any[] = []

export function getOfflineStories(): any[] {
  return offlineStoriesStore
}

export function saveOfflineStory(story: any): any {
  const id = story.id || `story_${Date.now()}`
  const existingIdx = offlineStoriesStore.findIndex((s) => s.id === id)
  if (existingIdx >= 0) {
    const updated = { ...offlineStoriesStore[existingIdx], ...story, id }
    offlineStoriesStore[existingIdx] = updated
    return updated
  }
  const newStory = {
    id,
    mediaUrl: story.mediaUrl || '',
    mediaType: story.mediaType || 'IMAGE',
    caption: story.caption || 'Choutuppal Story',
    link: story.link || '/',
    isActive: story.isActive ?? true,
    createdAt: new Date().toISOString(),
  }
  offlineStoriesStore.unshift(newStory)
  return newStory
}

export function deleteOfflineStory(id: string): boolean {
  const initial = offlineStoriesStore.length
  offlineStoriesStore = offlineStoriesStore.filter((s) => s.id !== id)
  return offlineStoriesStore.length < initial
}

const INITIAL_SHORTS: any[] = []
let offlineShortsStore: any[] = []

export function getOfflineShorts(): any[] {
  return offlineShortsStore
}

export function saveOfflineShort(short: any): any {
  const id = short.id || `short_${Date.now()}`
  const existingIdx = offlineShortsStore.findIndex((s) => s.id === id)
  if (existingIdx >= 0) {
    const updated = { ...offlineShortsStore[existingIdx], ...short, id }
    offlineShortsStore[existingIdx] = updated
    return updated
  }
  const newShort = {
    id,
    videoUrl: short.videoUrl || '',
    youtubeId: short.youtubeId || '',
    title: short.title || 'Choutuppal Short Video',
    thumbnail: short.thumbnail || '',
    views: short.views || 0,
    likes: short.likes || 0,
    createdAt: new Date().toISOString(),
  }
  offlineShortsStore.unshift(newShort)
  return newShort
}

export function deleteOfflineShort(id: string): boolean {
  const initial = offlineShortsStore.length
  offlineShortsStore = offlineShortsStore.filter((s) => s.id !== id)
  return offlineShortsStore.length < initial
}

const INITIAL_REAL_ESTATES: any[] = []
let offlineRealEstatesStore: any[] = []

export function getOfflineRealEstates(): any[] {
  return offlineRealEstatesStore
}

export function saveOfflineRealEstate(item: any): any {
  const id = item.id || `re_${Date.now()}`
  const existingIdx = offlineRealEstatesStore.findIndex((r) => r.id === id)
  if (existingIdx >= 0) {
    const updated = { ...offlineRealEstatesStore[existingIdx], ...item, id }
    offlineRealEstatesStore[existingIdx] = updated
    return updated
  }
  const newItem = {
    id,
    title: item.title || 'Real Estate Property',
    slug: item.slug || `property-${Date.now()}`,
    coverImage: item.coverImage || null,
    price: item.price || 0,
    type: item.type || 'PLOT',
    listingType: item.listingType || 'SALE',
    bedrooms: item.bedrooms ?? null,
    areaSqft: item.areaSqft || 0,
    villageId: item.villageId || 'v-choutuppal',
    status: item.status || 'APPROVED',
    contactPhone: item.contactPhone || '9494348175',
    contactWhatsapp: item.contactWhatsapp || '9494348175',
    views: item.views || 0,
    village: STANDARD_VILLAGES.find((v) => v.id === item.villageId) || STANDARD_VILLAGES[0],
    createdAt: new Date().toISOString(),
  }
  offlineRealEstatesStore.unshift(newItem)
  return newItem
}

export function deleteOfflineRealEstate(id: string): boolean {
  const initial = offlineRealEstatesStore.length
  offlineRealEstatesStore = offlineRealEstatesStore.filter((r) => r.id !== id)
  return offlineRealEstatesStore.length < initial
}

export interface OfflineUser {
  id: string
  name: string | null
  email: string | null
  username: string | null
  phone: string | null
  passwordHash: string | null
  role: string
  planTier: string
  planExpiresAt: Date | null
  villageId: string | null
  bio: string | null
  image: string | null
  coverImage: string | null
  isPublic: boolean
  isBanned: boolean
  createdAt: Date
  updatedAt: Date
  facebookUrl?: string | null
  instagramUrl?: string | null
  youtubeUrl?: string | null
  twitterUrl?: string | null
}

const DEFAULT_DEMO_USERS: OfflineUser[] = [
  {
    id: 'cms0du1m40000v32slild2p1s',
    name: 'Super Admin',
    email: 'admin@choutuppal.in',
    username: 'admin',
    phone: '9494348175',
    passwordHash: '$2b$10$eKgBR72xp3KfFQMMGtD/1edRXRft8EmWoxePGQ1ukYtpabWVBneoO', // Admin@123 / 123456
    role: 'ADMIN',
    planTier: 'PREMIUM',
    planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    villageId: 'v-choutuppal',
    bio: 'Official administrator and community lead for Choutuppal App.',
    image: 'https://i.ibb.co/BVdvN5rB/Untitled-design-removebg-preview.png',
    coverImage: null,
    isPublic: true,
    isBanned: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date(),
  },
  {
    id: 'cms0du1m40000v32slild2p1s_alt',
    name: 'Choutuppal Admin',
    email: 'choutuppalapp@gmail.com',
    username: 'choutuppalapp',
    phone: '9494348175',
    passwordHash: '$2b$10$eKgBR72xp3KfFQMMGtD/1edRXRft8EmWoxePGQ1ukYtpabWVBneoO', // 123456
    role: 'ADMIN',
    planTier: 'PREMIUM',
    planExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    villageId: 'v-choutuppal',
    bio: 'Official administrator and community lead for Choutuppal App.',
    image: 'https://i.ibb.co/BVdvN5rB/Untitled-design-removebg-preview.png',
    coverImage: null,
    isPublic: true,
    isBanned: false,
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date(),
  },
]

let offlineUsersStore: OfflineUser[] | null = null

export function getOfflineUsers(): OfflineUser[] {
  if (offlineUsersStore) return offlineUsersStore
  offlineUsersStore = [...DEFAULT_DEMO_USERS]
  return offlineUsersStore
}

export function saveOfflineUser(user: Partial<OfflineUser> & { id?: string }): OfflineUser {
  const users = getOfflineUsers()
  const existingIdx = users.findIndex(
    (u) =>
      (user.id && u.id === user.id) ||
      (user.email && u.email?.toLowerCase() === user.email.toLowerCase()) ||
      (user.phone && u.phone === user.phone) ||
      (user.username && u.username?.toLowerCase() === user.username.toLowerCase())
  )

  const now = new Date()
  if (existingIdx >= 0) {
    const updated = {
      ...users[existingIdx],
      ...user,
      updatedAt: now,
    }
    users[existingIdx] = updated as OfflineUser
    return updated as OfflineUser
  }

  const newUser: OfflineUser = {
    id: user.id || `user_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: user.name || 'Citizen',
    email: user.email || null,
    username: user.username || `user_${Math.random().toString(36).substring(2, 7)}`,
    phone: user.phone || null,
    passwordHash: user.passwordHash || null,
    role: user.role || 'USER',
    planTier: user.planTier || 'FREE',
    planExpiresAt: user.planExpiresAt || null,
    villageId: user.villageId || 'v-choutuppal',
    bio: user.bio || null,
    image: user.image || null,
    coverImage: user.coverImage || null,
    isPublic: user.isPublic ?? true,
    isBanned: user.isBanned ?? false,
    createdAt: now,
    updatedAt: now,
    facebookUrl: user.facebookUrl || null,
    instagramUrl: user.instagramUrl || null,
    youtubeUrl: user.youtubeUrl || null,
    twitterUrl: user.twitterUrl || null,
  }

  users.push(newUser)
  return newUser
}

export function deleteOfflineUser(id: string): boolean {
  const users = getOfflineUsers()
  const initial = users.length
  offlineUsersStore = users.filter((u) => u.id !== id && u.email !== id && u.username !== id)
  return offlineUsersStore.length < initial
}
