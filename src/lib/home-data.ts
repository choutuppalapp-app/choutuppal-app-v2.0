import { prisma, safeDbQuery } from '@/lib/prisma'
import { getCurrentTenant, getTenantWhereClause } from '@/lib/tenant'
import {
  getOfflineListings,
  getOfflineBanners,
  getOfflineStories,
  getOfflineRealEstates,
  getOfflineShorts,
  getOfflineNews,
  getOfflineBlogs,
  STANDARD_CATEGORIES,
  STANDARD_VILLAGES,
} from '@/lib/offline-data'

/**
 * Server-side data fetchers for the Home page. Each returns plain serializable
 * objects (safe to pass from a Server Component to Client Components as props).
 */

export async function getActiveStories() {
  const dbStories = await safeDbQuery(
    () =>
      prisma.story.findMany({
        where: {
          isActive: true,
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: {
          id: true,
          mediaUrl: true,
          mediaType: true,
          caption: true,
          views: true,
          expiresAt: true,
          createdAt: true,
          owner: { select: { username: true, name: true, image: true } },
        },
      }),
    [],
  )

  const offlineStories = getOfflineStories().filter((s) => s.isActive !== false)
  if (dbStories && dbStories.length > 0) {
    const map = new Map<string, any>()
    dbStories.forEach((s: any) => map.set(s.id, s))
    offlineStories.forEach((s: any) => map.set(s.id, s))
    return Array.from(map.values())
  }
  return offlineStories.length > 0 ? offlineStories : []
}

export async function getActiveBanners() {
  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)

  const dbBanners = await safeDbQuery(
    async () => {
      let banners = await prisma.banner.findMany({
        where: {
          ...tenantFilter,
          isActive: true,
          NOT: { status: 'REJECTED' },
          OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        },
        orderBy: { createdAt: 'desc' },
        take: 8,
        select: {
          id: true,
          title: true,
          imageUrl: true,
          link: true,
        },
      })

      if (!banners || banners.length === 0) {
        banners = await prisma.banner.findMany({
          where: {
            isActive: true,
            NOT: { status: 'REJECTED' },
            OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
          },
          orderBy: { createdAt: 'desc' },
          take: 8,
          select: {
            id: true,
            title: true,
            imageUrl: true,
            link: true,
          },
        })
      }

      return banners || []
    },
    [],
  )

  const offlineBanners = getOfflineBanners().filter((b) => b.isActive !== false && b.status !== 'REJECTED')
  if (dbBanners && dbBanners.length > 0) {
    const map = new Map<string, any>()
    dbBanners.forEach((b: any) => map.set(b.id, b))
    offlineBanners.forEach((b: any) => map.set(b.id, b))
    return Array.from(map.values())
  }
  return offlineBanners.length > 0 ? offlineBanners : []
}

export async function getCategories() {
  return safeDbQuery(
    () =>
      prisma.category.findMany({
        orderBy: { name: 'asc' },
        take: 12,
        select: {
          id: true,
          name: true,
          slug: true,
          icon: true,
        },
      }),
    [],
  )
}

export const FALLBACK_FEATURED_LISTINGS = [
  {
    id: 'ch-feat-1',
    title: 'శ్రీ సాయి ఆటోమొబైల్ సర్వీసెస్ & గ్యారేజ్',
    slug: 'sri-sai-automobile-choutuppal',
    coverImage: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80',
    logo: null,
    phone: '9494348175',
    whatsapp: '9494348175',
    avgRating: 4.9,
    views: 1420,
    isFeatured: true,
    categoryId: 'automobile',
    villageId: 'choutuppal',
    category: { id: 'cat-auto', name: 'Automobile', slug: 'automobile' },
    village: { id: 'v-ch', name: 'Choutuppal', slug: 'choutuppal' },
  },
  {
    id: 'ch-feat-2',
    title: 'చౌటుప్పల్ డిజిటల్ మీసేవ & ఇంటర్నెట్ సెంటర్',
    slug: 'choutuppal-meeseva-internet-center',
    coverImage: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=800&q=80',
    logo: null,
    phone: '9494348175',
    whatsapp: '9494348175',
    avgRating: 4.8,
    views: 1180,
    isFeatured: true,
    categoryId: 'internet-cyber-cafe',
    villageId: 'choutuppal',
    category: { id: 'cat-meeseva', name: 'Internet & Cyber', slug: 'internet-cyber-cafe' },
    village: { id: 'v-ch', name: 'Choutuppal', slug: 'choutuppal' },
  },
  {
    id: 'ch-feat-3',
    title: 'శ్రీ లక్ష్మి టిఫిన్స్ & ఫ్యామిలీ రెస్టారెంట్',
    slug: 'sri-laxmi-tiffins-choutuppal',
    coverImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
    logo: null,
    phone: '9494348175',
    whatsapp: '9494348175',
    avgRating: 4.9,
    views: 2350,
    isFeatured: true,
    categoryId: 'food-dining',
    villageId: 'choutuppal',
    category: { id: 'cat-food', name: 'Food & Dining', slug: 'food-dining' },
    village: { id: 'v-ch', name: 'Choutuppal', slug: 'choutuppal' },
  },
  {
    id: 'ch-feat-4',
    title: 'బాలాజీ ఎలక్ట్రికల్స్, మోటార్స్ & హార్డ్‌వేర్',
    slug: 'balaji-electricals-choutuppal',
    coverImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    logo: null,
    phone: '9494348175',
    whatsapp: '9494348175',
    avgRating: 4.7,
    views: 940,
    isFeatured: true,
    categoryId: 'electrical-hardware',
    villageId: 'choutuppal',
    category: { id: 'cat-electrical', name: 'Electrical & Hardware', slug: 'electrical-hardware' },
    village: { id: 'v-ch', name: 'Choutuppal', slug: 'choutuppal' },
  },
]

export const FALLBACK_REAL_ESTATE = [
  {
    id: 're-1',
    title: 'హైవే ఫేసింగ్ ఓపెన్ ప్లాట్లు (HMDA / DTCP Approved)',
    slug: 'highway-facing-open-plots-choutuppal',
    coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    price: 1500000,
    type: 'PLOT',
    listingType: 'SALE',
    bedrooms: null,
    areaSqft: 1800,
    villageId: 'v-ch',
    village: { id: 'v-ch', name: 'Choutuppal (NH 65)', slug: 'choutuppal' },
  },
  {
    id: 're-2',
    title: '2BHK ఇండిపెండెంట్ లగ్జరీ హౌస్ అమ్మకానికి',
    slug: '2bhk-independent-luxury-house-lingojiguda',
    coverImage: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=800&q=80',
    price: 4200000,
    type: 'HOUSE',
    listingType: 'SALE',
    bedrooms: 2,
    areaSqft: 1350,
    villageId: 'v-lingo',
    village: { id: 'v-lingo', name: 'Lingojiguda', slug: 'lingojiguda' },
  },
  {
    id: 're-3',
    title: 'మెయిన్ రోడ్ కమర్షియల్ షాప్ స్పేస్ అద్దెకు',
    slug: 'main-road-commercial-shop-space-choutuppal',
    coverImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
    price: 18000,
    type: 'COMMERCIAL',
    listingType: 'RENT',
    bedrooms: null,
    areaSqft: 650,
    villageId: 'v-ch',
    village: { id: 'v-ch', name: 'Choutuppal Main Road', slug: 'choutuppal' },
  },
  {
    id: 're-4',
    title: 'వ్యవసాయ భూమి & ఫామ్‌ల్యాండ్ వెంచర్ ప్లాట్లు',
    slug: 'farmland-venture-plots-koyyalagudem',
    coverImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80',
    price: 2500000,
    type: 'LAND',
    listingType: 'SALE',
    bedrooms: null,
    areaSqft: 5400,
    villageId: 'v-koyya',
    village: { id: 'v-koyya', name: 'Koyyalagudem', slug: 'koyyalagudem' },
  },
]

const FALLBACK_NEWS = [
  {
    id: 'news-1',
    title: 'చౌటుప్పల్ - హైదరాబాద్ జాతీయ రహదారి 65 విస్తరణ పనులు ముమ్మరం',
    slug: 'choutuppal-nh65-highway-expansion-update',
    summary: 'హైదరాబాద్-విజయవాడ జాతీయ రహదారిపై ట్రాఫిక్ సమస్యల నివారణకు అండర్‌పాస్ మరియు ఫ్లైఓవర్ పనులు వేగవంతం చేశారు.',
    image: 'https://images.unsplash.com/photo-1545459720-aac8509eb02c?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'news-2',
    title: 'చౌటుప్పల్ మున్సిపాలిటీలో కొత్త తాగునీటి ప్రాజెక్ట్ ప్రారంభం',
    slug: 'choutuppal-new-drinking-water-project',
    summary: 'ప్రతి వార్డుకు నిరంతర శుద్ధ జలాల సరఫరా కోసం నూతన పైప్‌లైన్ మరియు స్టోరేజ్ ట్యాంక్ పనులు ప్రారంభమయ్యాయి.',
    image: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'news-3',
    title: 'యాదాద్రి భువనగిరి జిల్లా రైతులకు ఉచిత విత్తనాల పంపిణీ',
    slug: 'yadadri-farmers-seeds-distribution',
    summary: 'వ్యవసాయ శాఖ ఆధ్వర్యంలో రైతులకు రాయితీ ఎరువులు మరియు నాణ్యమైన విత్తనాల పంపిణీ కేంద్రాలను ఏర్పాటు చేశారు.',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'news-4',
    title: 'చౌటుప్పల్ స్థానిక వ్యాపారులకు డిజిటల్ రిజిస్ట్రేషన్ అవకాశం',
    slug: 'choutuppal-digital-business-registration-launch',
    summary: 'చౌటుప్పల్ యాప్ ద్వారా చిన్న, పెద్ద వ్యాపారాలు ఉచితంగా ఆన్‌లైన్‌లో లిస్టింగ్ చేసుకోవచ్చని నిర్వాహకులు తెలిపారు.',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
]

const FALLBACK_BLOGS = [
  {
    id: 'blog-1',
    title: 'చౌటుప్పల్ పరిసరాల్లో ఓపెన్ ప్లాట్లు కొనేముందు తెలుసుకోవాల్సిన 5 విషయాలు',
    slug: '5-things-to-know-before-buying-plots-in-choutuppal',
    excerpt: 'హెచ్‌ఎండిఏ/డిటిసిపి లేఅవుట్ అనుమతులు, లింక్ డాక్యుమెంట్లు మరియు ఫ్యూచర్ గ్రోత్ విశ్లేషణ పూర్తి గైడ్.',
    coverImage: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'blog-2',
    title: 'స్థానిక దుకాణాన్ని డిజిటల్ బిజినెస్‌గా ఎలా మార్చాలి?',
    slug: 'how-to-grow-local-business-digitally-in-choutuppal',
    excerpt: 'వాట్సాప్ కాటలాగ్, ఆన్‌లైన్ లిస్టింగ్స్ మరియు సోషల్ మీడియా ద్వారా కస్టమర్లను ఎలా ఆకర్షించవచ్చో తెలుసుకోండి.',
    coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
  },
  {
    id: 'blog-3',
    title: 'చౌటుప్పల్ సమీపంలోని ప్రముఖ ఆధ్యాత్మిక మరియు చారిత్రక ప్రదేశాలు',
    slug: 'top-places-to-visit-near-choutuppal',
    excerpt: 'యాదాద్రి శ్రీ లక్ష్మీ నరసింహ స్వామి క్షేత్రం, కొలనుపాక జైన మందిరం మరియు పర్యాటక విశేషాలు.',
    coverImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
  },
  {
    id: 'blog-4',
    title: 'హైదరాబాద్ - విజయవాడ కారిడార్‌లో రియల్ ఎస్టేట్ గ్రోత్ భవిష్యత్తు',
    slug: 'future-of-real-estate-in-hyderabad-vijayawada-corridor',
    excerpt: 'రీజినల్ రింగ్ రోడ్ (RRR), ఇండస్ట్రియల్ హబ్స్ మరియు ఫార్మా సిటీ అనుసంధానంతో ప్రాపర్టీ విలువల పెరుగుదల.',
    coverImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
  },
]

export async function getFeaturedListings() {
  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)
  const dbListings = await safeDbQuery(
    async () => {
      let results = await prisma.listing.findMany({
        where: {
          ...tenantFilter,
          status: { in: ['APPROVED', 'ACTIVE'] },
        },
        orderBy: [
          { isFeatured: 'desc' },
          { isPremium: 'desc' },
          { createdAt: 'desc' },
        ],
        take: 30,
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          logo: true,
          phone: true,
          whatsapp: true,
          avgRating: true,
          views: true,
          isFeatured: true,
          isPremium: true,
          villageId: true,
          categoryId: true,
          category: { select: { id: true, name: true, slug: true } },
          village: { select: { id: true, name: true, slug: true } },
        },
      })
      return results || []
    },
    [],
  )

  const offlineListings = getOfflineListings()
    .filter((l) => l.status === 'APPROVED' || l.status === 'ACTIVE' || !l.status)

  const map = new Map<string, any>()
  if (Array.isArray(dbListings)) {
    dbListings.forEach((item: any) => {
      if (item?.id) map.set(item.id, item)
    })
  }
  if (Array.isArray(offlineListings)) {
    offlineListings.forEach((item: any) => {
      if (item?.id) map.set(item.id, item)
    })
  }

  const merged = Array.from(map.values())
  if (merged.length > 0) {
    // Sort featured / premium / newest
    merged.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
      if (a.isPremium !== b.isPremium) return (b.isPremium ? 1 : 0) - (a.isPremium ? 1 : 0)
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0
      return timeB - timeA
    })
    return merged.slice(0, 24)
  }

  return FALLBACK_FEATURED_LISTINGS
}

export async function getPremiumRealEstate() {
  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)
  const dbProperties = await safeDbQuery(
    async () => {
      let properties = await prisma.realEstate.findMany({
        where: { ...tenantFilter, status: { in: ['APPROVED', 'ACTIVE'] } },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: {
          id: true,
          title: true,
          slug: true,
          coverImage: true,
          price: true,
          type: true,
          listingType: true,
          bedrooms: true,
          areaSqft: true,
          villageId: true,
          village: { select: { id: true, name: true, slug: true } },
        },
      })
      return properties || []
    },
    [],
  )

  const offlineProperties = getOfflineRealEstates()
    .filter((r) => r.status === 'APPROVED' || r.status === 'ACTIVE' || !r.status)

  const map = new Map<string, any>()
  if (Array.isArray(dbProperties)) {
    dbProperties.forEach((item: any) => {
      if (item?.id) map.set(item.id, item)
    })
  }
  if (Array.isArray(offlineProperties)) {
    offlineProperties.forEach((item: any) => {
      if (item?.id) map.set(item.id, item)
    })
  }

  const merged = Array.from(map.values())
  if (merged.length > 0) {
    return merged.slice(0, 12)
  }
  return FALLBACK_REAL_ESTATE
}

export async function getShorts() {
  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)
  const dbShorts = await safeDbQuery(
    async () => {
      let shorts = await prisma.short.findMany({
        where: tenantFilter,
        orderBy: { createdAt: 'desc' },
        take: 15,
        select: {
          id: true,
          videoUrl: true,
          platform: true,
          thumbnail: true,
          title: true,
          description: true,
          views: true,
          likes: true,
          youtubeId: true,
          createdAt: true,
          owner: { select: { id: true, username: true, name: true, image: true } },
        },
      })
      return shorts || []
    },
    [],
  )

  const offlineShorts = getOfflineShorts()
  if (dbShorts && dbShorts.length > 0) {
    const map = new Map<string, any>()
    dbShorts.forEach((s: any) => map.set(s.id, s))
    offlineShorts.forEach((s: any) => map.set(s.id, s))
    return Array.from(map.values())
  }
  return offlineShorts.length > 0 ? offlineShorts : []
}

export async function getLatestNews() {
  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)
  const dbNews = await safeDbQuery(
    async () => {
      let articles = await prisma.news.findMany({
        where: { ...tenantFilter, isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          image: true,
          createdAt: true,
        },
      })
      return articles || []
    },
    [],
  )

  const offlineNews = getOfflineNews().filter((n) => n.isPublished !== false)
  if (dbNews && dbNews.length > 0) {
    const map = new Map<string, any>()
    dbNews.forEach((n: any) => map.set(n.id, n))
    offlineNews.forEach((n: any) => map.set(n.id, n))
    return Array.from(map.values())
  }
  return offlineNews.length > 0 ? offlineNews : FALLBACK_NEWS
}

export async function getLatestBlogs() {
  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)
  const dbBlogs = await safeDbQuery(
    async () => {
      let blogs = await prisma.blog.findMany({
        where: { ...tenantFilter, isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 4,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          createdAt: true,
        },
      })
      return blogs || []
    },
    [],
  )

  const offlineBlogs = getOfflineBlogs().filter((b) => b.isPublished !== false)
  if (dbBlogs && dbBlogs.length > 0) {
    const map = new Map<string, any>()
    dbBlogs.forEach((b: any) => map.set(b.id, b))
    offlineBlogs.forEach((b: any) => map.set(b.id, b))
    return Array.from(map.values())
  }
  return offlineBlogs.length > 0 ? offlineBlogs : FALLBACK_BLOGS
}

export async function getVillages() {
  return safeDbQuery(
    () => prisma.village.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true, slug: true } }),
    [],
  )
}

import { swrCache, invalidateCache } from '@/lib/cache'

export function invalidateHomeDataCache() {
  invalidateCache('home_data_')
  invalidateCache('home_')
}

export async function getHomePageData(forceRefresh = false) {
  let tenantId = 'default'
  try {
    const tenant = await getCurrentTenant()
    if (tenant?.id) tenantId = tenant.id
  } catch {
    // fallback to default
  }

  const cacheKey = `home_data_${tenantId}`

  if (forceRefresh) {
    invalidateCache(cacheKey)
  }

  return swrCache(
    cacheKey,
    async () => {
      const [
        stories,
        banners,
        categories,
        featured,
        realEstate,
        shorts,
        villages,
        latestNews,
        latestBlogs,
      ] = await Promise.all([
        getActiveStories(),
        getActiveBanners(),
        getCategories(),
        getFeaturedListings(),
        getPremiumRealEstate(),
        getShorts(),
        getVillages(),
        getLatestNews(),
        getLatestBlogs(),
      ])
      return { stories, banners, categories, featured, realEstate, shorts, villages, latestNews, latestBlogs }
    },
    {
      ttlMs: 60 * 1000,           // 1 minute fresh
      staleTtlMs: 30 * 60 * 1000, // 30 mins stale window with background revalidation
    }
  )
}

export type HomePageData = Awaited<ReturnType<typeof getHomePageData>>
