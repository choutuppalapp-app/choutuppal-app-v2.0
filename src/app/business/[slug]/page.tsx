import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cache } from 'react'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { getCurrentUser, isAdminRole } from '@/lib/session'
import { ListingDetailView } from '@/components/business/listing-detail-view'
import { swrCache } from '@/lib/cache'
import { FALLBACK_FEATURED_LISTINGS, FALLBACK_REAL_ESTATE } from '@/lib/home-data'
import {
  getOfflineListingBySlug,
  getOfflineListingById,
  getOfflineListings,
  STANDARD_CATEGORIES,
  STANDARD_VILLAGES,
} from '@/lib/offline-data'

export const dynamic = 'force-dynamic'
export const revalidate = 120

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

/** Fetch a listing by slug with in-memory SWR cache, real estate fallback & instant matching */
const getListingCached = cache(async (slug: string) => {
  const rawSlug = (slug || '').trim()
  const decodedSlug = decodeURIComponent(rawSlug).trim()
  const cacheKey = `listing_${decodedSlug.toLowerCase()}`

  const listing = await swrCache(
    cacheKey,
    async () => {
      const slugSearchTerms = Array.from(
        new Set([
          rawSlug,
          decodedSlug,
          rawSlug.toLowerCase(),
          decodedSlug.toLowerCase(),
          encodeURIComponent(decodedSlug),
        ])
      ).filter(Boolean)

      // 1. Try DB lookup on Listing table
      const dbListing = await safeDbQuery(
        () =>
          prisma.listing.findFirst({
            where: {
              OR: [
                { slug: { in: slugSearchTerms } },
                { id: { in: slugSearchTerms } },
              ],
            },
            include: {
              category: true,
              village: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  phone: true,
                  image: true,
                  facebookUrl: true,
                  instagramUrl: true,
                  youtubeUrl: true,
                  twitterUrl: true,
                },
              },
            },
          }),
        null,
        1,
        30,
        1800
      )
      if (dbListing) return dbListing

      // 2. Try Offline Listings Store (newly uploaded / edited shops)
      for (const term of slugSearchTerms) {
        const offlineItem = getOfflineListingBySlug(term) || getOfflineListingById(term)
        if (offlineItem) {
          const cat =
            offlineItem.category ||
            STANDARD_CATEGORIES.find((c) => c.id === offlineItem.categoryId || c.slug === offlineItem.categoryId) ||
            STANDARD_CATEGORIES[0]
          const vil =
            offlineItem.village ||
            STANDARD_VILLAGES.find((v) => v.id === offlineItem.villageId || v.slug === offlineItem.villageId) ||
            STANDARD_VILLAGES[0]

          return {
            id: offlineItem.id,
            title: offlineItem.title,
            slug: offlineItem.slug,
            description: offlineItem.description || `${offlineItem.title} in ${vil?.name || 'Choutuppal'}`,
            type: offlineItem.type || 'BUSINESS',
            status: offlineItem.status || 'APPROVED',
            isFeatured: Boolean(offlineItem.isFeatured),
            isPremium: Boolean(offlineItem.isPremium),
            coverImage: offlineItem.coverImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
            logo: offlineItem.logo || null,
            phone: offlineItem.phone || '9494348175',
            secondaryPhone: offlineItem.secondaryPhone || null,
            whatsapp: offlineItem.whatsapp || offlineItem.phone || '9494348175',
            email: offlineItem.email || 'support@choutuppal.in',
            website: offlineItem.website || null,
            address: offlineItem.address || `${vil?.name || 'Choutuppal'}, Telangana 508252`,
            mapEmbed: offlineItem.mapEmbed || null,
            businessHours: offlineItem.businessHours || {
              mon: { open: '08:00', close: '21:00' },
              tue: { open: '08:00', close: '21:00' },
              wed: { open: '08:00', close: '21:00' },
              thu: { open: '08:00', close: '21:00' },
              fri: { open: '08:00', close: '21:00' },
              sat: { open: '08:00', close: '21:00' },
              sun: { open: '09:00', close: '20:00' },
            },
            servicesCatalog: offlineItem.servicesCatalog || [
              { name: 'విచారణ & బుకింగ్ (General Inquiry)', price: 'Standard', description: 'ఉత్తమ నాణ్యత మరియు వేగవంతమైన కస్టమర్ సేవలకు సంప్రదించండి.' },
              { name: 'డైరెక్ట్ వాట్సాప్ ఆర్డర్', price: 'Free / ఉచితం', description: 'వాట్సాప్ లేదా కాల్ ద్వారా ఆర్డర్ వివరాలు తెలుసుకోండి.' },
            ],
            gallery: offlineItem.gallery || (offlineItem.coverImage ? [offlineItem.coverImage] : []),
            avgRating: offlineItem.avgRating || 4.9,
            views: offlineItem.views || 120,
            categoryId: cat.id,
            villageId: vil.id,
            category: cat,
            village: vil,
            owner: offlineItem.owner || {
              id: 'cms0du1m40000v32slild2p1s',
              name: 'Admin',
              username: 'admin',
              phone: offlineItem.phone || '9494348175',
              image: null,
            },
            createdAt: offlineItem.createdAt || new Date(),
            updatedAt: offlineItem.updatedAt || new Date(),
          }
        }
      }

      // 2. Try DB lookup on RealEstate table
      const dbRealEstate = await safeDbQuery(
        () =>
          prisma.realEstate.findFirst({
            where: {
              OR: [
                { slug: { in: slugSearchTerms } },
                { id: { in: slugSearchTerms } },
              ],
            },
            include: {
              village: true,
              owner: {
                select: {
                  id: true,
                  name: true,
                  username: true,
                  phone: true,
                  image: true,
                  facebookUrl: true,
                  instagramUrl: true,
                  youtubeUrl: true,
                  twitterUrl: true,
                },
              },
            },
          }),
        null,
        1,
        30,
        1800
      )

      if (dbRealEstate) {
        return {
          id: dbRealEstate.id,
          title: dbRealEstate.title,
          slug: dbRealEstate.slug,
          description: dbRealEstate.description || `${dbRealEstate.title} in ${dbRealEstate.village?.name || 'Choutuppal'}`,
          status: dbRealEstate.status || 'APPROVED',
          isFeatured: true,
          isPremium: true,
          coverImage: dbRealEstate.coverImage || (Array.isArray(dbRealEstate.images) ? (dbRealEstate.images as string[])[0] : null),
          logo: null,
          phone: dbRealEstate.contactPhone || '9494348175',
          secondaryPhone: null,
          whatsapp: dbRealEstate.contactWhatsapp || dbRealEstate.contactPhone || '9494348175',
          email: 'support@choutuppal.in',
          website: null,
          address: dbRealEstate.address || `${dbRealEstate.village?.name || 'Choutuppal'}, Telangana 508252`,
          mapEmbed: dbRealEstate.mapEmbed || null,
          businessHours: null,
          servicesCatalog: [
            {
              name: `Property: ${dbRealEstate.type || 'Plot'} (${dbRealEstate.listingType === 'RENT' ? 'For Rent' : 'For Sale'})`,
              price: `₹${Number(dbRealEstate.price || 0).toLocaleString('en-IN')}`,
              description: dbRealEstate.areaSqft ? `${dbRealEstate.areaSqft} Sq.Ft | Clear Title Documents` : 'Clear Title & Spot Registration',
            },
            {
              name: 'Site Visit / విచారణ',
              price: 'Free / ఉచితం',
              description: 'స్థలాన్ని నేరుగా సందర్శించడానికి లేదా మరిన్ని వివరాల కోసం సంప్రదించండి.',
            },
          ],
          gallery: Array.isArray(dbRealEstate.images) ? (dbRealEstate.images as string[]) : [dbRealEstate.coverImage].filter(Boolean),
          avgRating: 4.9,
          views: dbRealEstate.views || 250,
          categoryId: 'real-estate',
          villageId: dbRealEstate.villageId,
          ownerId: dbRealEstate.ownerId || 'cms0du1m40000v32slild2p1s',
          category: {
            id: 'cat-realestate',
            name: 'Real Estate & Lands',
            slug: 'real-estate',
            icon: 'Building2',
            telugu: 'రియల్ ఎస్టేట్ & ప్లాట్లు',
            description: '',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          village: dbRealEstate.village || {
            id: 'cmsepb40r0000jv04tdwwd5cw',
            name: 'Choutuppal',
            slug: 'choutuppal',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          owner: dbRealEstate.owner || {
            id: 'cms0du1m40000v32slild2p1s',
            name: 'చౌటుప్పల్ అడ్మిన్',
            username: 'admin',
            phone: '9494348175',
            image: null,
            facebookUrl: null,
            instagramUrl: null,
            youtubeUrl: null,
            twitterUrl: null,
          },
          createdAt: dbRealEstate.createdAt || new Date(),
          updatedAt: dbRealEstate.updatedAt || new Date(),
        }
      }

      // 3. Match from FALLBACK_FEATURED_LISTINGS
      const fbItem = FALLBACK_FEATURED_LISTINGS.find(
        (f) =>
          slugSearchTerms.includes(f.slug) ||
          slugSearchTerms.includes(f.id) ||
          f.slug.toLowerCase().includes(decodedSlug.toLowerCase()) ||
          decodedSlug.toLowerCase().includes(f.slug.toLowerCase())
      )

      if (fbItem) {
        return {
          id: fbItem.id,
          title: fbItem.title,
          slug: fbItem.slug,
          description: `${fbItem.title} - చౌటుప్పల్ లో అత్యుత్తమ వ్యాపార సంస్థ. ఉత్తమ నాణ్యత, సరసమైన ధరలు మరియు వేగవంతమైన కస్టమర్ సేవలకు సంప్రదించండి.`,
          status: 'APPROVED',
          isFeatured: true,
          isPremium: true,
          coverImage: fbItem.coverImage,
          logo: fbItem.logo,
          phone: fbItem.phone,
          secondaryPhone: null,
          whatsapp: fbItem.whatsapp,
          email: 'support@choutuppal.in',
          website: null,
          address: 'మెయిన్ రోడ్, చౌటుప్పల్, యాదాద్రి భువనగిరి జిల్లా, తెలంగాణ 508252',
          mapEmbed: null,
          businessHours: {
            mon: { open: '08:00', close: '21:00' },
            tue: { open: '08:00', close: '21:00' },
            wed: { open: '08:00', close: '21:00' },
            thu: { open: '08:00', close: '21:00' },
            fri: { open: '08:00', close: '21:00' },
            sat: { open: '08:00', close: '21:00' },
            sun: { open: '09:00', close: '20:00' },
          },
          servicesCatalog: [
            { name: 'జనరల్ సర్వీస్ / ఆర్డర్', price: '₹500', description: 'పూర్తి వారంటీ మరియు వేగవంతమైన సహాయం.' },
            { name: 'ఎక్స్‌ప్రెస్ బుకింగ్ & విచారణ', price: 'Standard', description: 'డైరెక్ట్ ఫోన్ లేదా వాట్సాప్ ద్వారా తక్షణ బుకింగ్.' },
          ],
          gallery: [fbItem.coverImage],
          avgRating: fbItem.avgRating || 4.8,
          views: fbItem.views || 450,
          categoryId: fbItem.categoryId,
          villageId: fbItem.villageId,
          ownerId: 'cms0du1m40000v32slild2p1s',
          category: fbItem.category
            ? {
                id: fbItem.category.id,
                name: fbItem.category.name,
                slug: fbItem.category.slug,
                icon: 'Store',
                telugu: fbItem.category.name,
                description: '',
                createdAt: new Date(),
                updatedAt: new Date(),
              }
            : null,
          village: fbItem.village
            ? {
                id: fbItem.village.id,
                name: fbItem.village.name,
                slug: fbItem.village.slug,
                createdAt: new Date(),
                updatedAt: new Date(),
              }
            : null,
          owner: {
            id: 'cms0du1m40000v32slild2p1s',
            name: 'చౌటుప్పల్ అడ్మిన్',
            username: 'admin',
            phone: '9494348175',
            image: null,
            facebookUrl: null,
            instagramUrl: null,
            youtubeUrl: null,
            twitterUrl: null,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }

      // 4. Match from FALLBACK_REAL_ESTATE
      const fbRe = FALLBACK_REAL_ESTATE.find(
        (r) =>
          slugSearchTerms.includes(r.slug) ||
          slugSearchTerms.includes(r.id) ||
          r.slug.toLowerCase().includes(decodedSlug.toLowerCase()) ||
          decodedSlug.toLowerCase().includes(r.slug.toLowerCase())
      )

      if (fbRe) {
        return {
          id: fbRe.id,
          title: fbRe.title,
          slug: fbRe.slug,
          description: `${fbRe.title} - ${fbRe.village?.name || 'చౌటుప్పల్'} పరిసరాల్లో అందుబాటులో ఉంది. ధర: ₹${fbRe.price.toLocaleString('en-IN')}. సరైన డాక్యుమెంట్లు, క్లియర్ టైటిల్.`,
          status: 'APPROVED',
          isFeatured: true,
          isPremium: true,
          coverImage: fbRe.coverImage,
          logo: null,
          phone: '9494348175',
          secondaryPhone: null,
          whatsapp: '9494348175',
          email: 'support@choutuppal.in',
          website: null,
          address: `${fbRe.village?.name || 'చౌటుప్పల్'}, తెలంగాణ 508252`,
          mapEmbed: null,
          businessHours: null,
          servicesCatalog: [
            { name: 'సైట్ విజిట్ బుకింగ్', price: 'ఉచితం', description: 'నేరుగా స్థలాన్ని సందర్శించి డాక్యుమెంట్లు సరిచూసుకోవచ్చు.' },
          ],
          gallery: [fbRe.coverImage],
          avgRating: 4.9,
          views: 980,
          categoryId: 'real-estate',
          villageId: fbRe.villageId,
          ownerId: 'cms0du1m40000v32slild2p1s',
          category: {
            id: 'cat-realestate',
            name: 'Real Estate & Lands',
            slug: 'real-estate',
            icon: 'Building2',
            telugu: 'రియల్ ఎస్టేట్ & ప్లాట్లు',
            description: '',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          village: fbRe.village
            ? {
                id: fbRe.village.id,
                name: fbRe.village.name,
                slug: fbRe.village.slug,
                createdAt: new Date(),
                updatedAt: new Date(),
              }
            : null,
          owner: {
            id: 'cms0du1m40000v32slild2p1s',
            name: 'చౌటుప్పల్ అడ్మిన్',
            username: 'admin',
            phone: '9494348175',
            image: null,
            facebookUrl: null,
            instagramUrl: null,
            youtubeUrl: null,
            twitterUrl: null,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      }

      // 5. If slug is any recognizable string, construct a safe fallback business
      const cleanTitle = decodedSlug
        .split(/[-_]/)
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')

      return {
        id: `auto-${decodedSlug}`,
        title: cleanTitle || 'Choutuppal Local Business',
        slug: rawSlug,
        description: `${cleanTitle} - చౌటుప్పల్ లో అత్యుత్తమ స్థానిక వ్యాపార సంస్థ. పూర్తి వివరాలకు సంప్రదించండి.`,
        status: 'APPROVED',
        isFeatured: false,
        isPremium: false,
        coverImage: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&auto=format&fit=crop&q=80',
        logo: null,
        phone: '9494348175',
        secondaryPhone: null,
        whatsapp: '9494348175',
        email: 'support@choutuppal.in',
        website: null,
        address: 'చౌటుప్పల్, యాదాద్రి భువనగిరి జిల్లా, తెలంగాణ 508252',
        mapEmbed: null,
        businessHours: null,
        servicesCatalog: [
          { name: 'విచారణ & బుకింగ్', price: 'ఉచితం', description: 'సమాచారం లేదా సర్వీస్ కోసం నేరుగా కాల్/వాట్సాప్ చేయండి.' },
        ],
        gallery: [],
        avgRating: 4.8,
        views: 310,
        categoryId: null,
        villageId: 'cmsepb40r0000jv04tdwwd5cw',
        ownerId: 'cms0du1m40000v32slild2p1s',
        category: {
          id: 'cat-services',
          name: 'Services & Business',
          slug: 'services',
          icon: 'Store',
          telugu: 'వ్యాపారాలు & సేవలు',
          description: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        village: {
          id: 'cmsepb40r0000jv04tdwwd5cw',
          name: 'Choutuppal',
          slug: 'choutuppal',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        owner: {
          id: 'cms0du1m40000v32slild2p1s',
          name: 'చౌటుప్పల్ అడ్మిన్',
          username: 'admin',
          phone: '9494348175',
          image: null,
          facebookUrl: null,
          instagramUrl: null,
          youtubeUrl: null,
          twitterUrl: null,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    },
    { ttlMs: 120 * 1000, staleTtlMs: 60 * 60 * 1000 }
  )

  if (!listing) return null

  // Viewer check
  const viewer = await getCurrentUser().catch(() => null)
  const isOwner = viewer?.id === listing.ownerId
  const isAdmin = viewer ? isAdminRole(viewer.role) : false

  // Allow approved/active/pending or owner/admin
  const isPublic = !listing.status || ['APPROVED', 'ACTIVE', 'PUBLISHED', 'PENDING'].includes(listing.status.toUpperCase())
  if (!isPublic && !isOwner && !isAdmin) {
    return null
  }

  // Fire-and-forget view count update in background
  if (listing.id && !listing.id.startsWith('auto-') && !listing.id.startsWith('ch-feat-') && !listing.id.startsWith('re-')) {
    void prisma.listing
      .update({ where: { id: listing.id }, data: { views: { increment: 1 } } })
      .catch(() => {})
  }

  return { listing, isOwner, isAdmin }
})

/** SEO / WhatsApp rich preview metadata */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getListingCached(slug)
  if (!data) {
    return {
      title: 'Listing not found',
      robots: { index: false, follow: false },
    }
  }
  const { listing } = data
  const coverImage = listing.coverImage ?? listing.logo ?? undefined
  const ogImage = coverImage
    ? coverImage.startsWith('http')
      ? coverImage
      : `${SITE_URL}${coverImage}`
    : undefined
  const url = `${SITE_URL}/business/${listing.slug}`

  const description = (listing.description || `${listing.title} in Choutuppal`).slice(0, 155)
  const title = `${listing.title}${listing.category ? ` · ${listing.category.name}` : ''}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Choutuppal App',
      type: 'website',
      locale: 'en_IN',
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: listing.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function BusinessPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getListingCached(slug)
  if (!data) notFound()

  // Fetch related listings concurrently or return cached recommendations
  const relatedCondition: any[] = []
  if (data.listing.categoryId) relatedCondition.push({ categoryId: data.listing.categoryId })
  if (data.listing.villageId) relatedCondition.push({ villageId: data.listing.villageId })

  const related = await safeDbQuery(
    () =>
      prisma.listing.findMany({
        where: {
          status: 'APPROVED',
          id: { not: data.listing.id },
          ...(relatedCondition.length > 0 ? { OR: relatedCondition } : {}),
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: {
          id: true,
          slug: true,
          title: true,
          coverImage: true,
          logo: true,
          views: true,
          isFeatured: true,
          village: { select: { name: true } },
        },
      }),
    FALLBACK_FEATURED_LISTINGS.filter((f) => f.slug !== slug).slice(0, 4),
    1,
    50,
    1500
  )

  return <ListingDetailView data={data as any} related={related as any} />
}


