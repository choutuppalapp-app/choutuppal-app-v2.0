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

const DEFAULT_OFFLINE_LISTINGS: OfflineListing[] = []

export function getOfflineListings(): OfflineListing[] {
  return []
}

export function getOfflineListingById(id: string): OfflineListing | null {
  return null
}

export function getOfflineListingBySlug(slug: string): OfflineListing | null {
  return null
}

export function getOfflineCategories(): ServiceCategory[] {
  if (cachedCategories) return cachedCategories
  cachedCategories = STANDARD_CATEGORIES
  return cachedCategories
}

export function getOfflineVillages(): any[] {
  if (cachedVillages) return cachedVillages
  cachedVillages = [
    {
      id: 'cmsepb40r0000jv04tdwwd5cw',
      name: 'Choutuppal',
      slug: 'choutuppal',
    },
  ]
  return cachedVillages
}

export function getOfflineSettings(): any[] {
  return [
    { key: 'spin_enabled', value: 'true' },
    { key: 'pricing_free', value: 'true' },
    { key: 'banner_free', value: 'true' },
    { key: 'ads_paid', value: 'false' },
    { key: 'banner_price', value: '99' },
    { key: 'announcement_ticker', value: '' },
    { key: 'ticker_items_json', value: '[]' },
    { key: 'hero_title', value: 'చౌటుప్పల్ సూపర్ యాప్' },
    { key: 'hero_subtitle', value: 'మీ పట్టణం, మీ వ్యాపారాలు - అన్నీ ఒకే యాప్‌లో' },
    { key: 'hero_bg_image', value: '/images/hero-banner.webp' },
  ]
}

export function getOfflineBanners(): any[] {
  return []
}

export function getOfflineNews(): any[] {
  return []
}

export function getOfflineBlogs(): any[] {
  return []
}

export function getOfflineNewsBySlug(slug: string): any | null {
  return null
}

export function getOfflineBlogBySlug(slug: string): any | null {
  return null
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
    villageId: 'cmsepb40r0000jv04tdwwd5cw',
    bio: 'Official administrator and community lead for Choutuppal App.',
    image: 'https://i.ibb.co/BVdvN5rB/Untitled-design-removebg-preview.png',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
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
    villageId: 'cmsepb40r0000jv04tdwwd5cw',
    bio: 'Official administrator and community lead for Choutuppal App.',
    image: 'https://i.ibb.co/BVdvN5rB/Untitled-design-removebg-preview.png',
    coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
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
    villageId: user.villageId || 'cmsepb40r0000jv04tdwwd5cw',
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



