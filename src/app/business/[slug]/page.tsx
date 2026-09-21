import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { cache } from 'react'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { getCurrentUser, isAdminRole } from '@/lib/session'
import { ListingDetailView } from '@/components/business/listing-detail-view'
import { swrCache } from '@/lib/cache'
import { FALLBACK_FEATURED_LISTINGS, FALLBACK_REAL_ESTATE } from '@/lib/home-data'

export const dynamic = 'force-dynamic'
export const revalidate = 120

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

/** Fetch a listing by slug with in-memory SWR cache & instant fallback matching */
const getListingCached = cache(async (slug: string) => {
  const listing = await swrCache(
    `listing_${slug}`,
    async () => {
      // 1. Try DB lookup first
      const dbItem = await safeDbQuery(
        () =>
          prisma.listing.findUnique({
            where: { slug },
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
        50,
        3000
      )
      if (dbItem) return dbItem

      // 2. Check if slug matches one of the top featured listings
      const fbItem = FALLBACK_FEATURED_LISTINGS.find((f) => f.slug === slug)
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
          avgRating: fbItem.avgRating,
          views: fbItem.views,
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

      // 3. Check if slug matches real estate listings
      const fbRe = FALLBACK_REAL_ESTATE.find((r) => r.slug === slug)
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

      return null
    },
    { ttlMs: 120 * 1000, staleTtlMs: 60 * 60 * 1000 }
  )

  if (!listing) return null

  // Fast viewer check
  const viewer = await getCurrentUser().catch(() => null)
  const isOwner = viewer?.id === listing.ownerId
  const isAdmin = viewer ? isAdminRole(viewer.role) : false
  if (listing.status !== 'APPROVED' && !isOwner && !isAdmin) {
    return null
  }

  // Fire-and-forget view count update in background
  if (listing.status === 'APPROVED' && !isOwner && listing.id && !listing.id.startsWith('ch-feat-') && !listing.id.startsWith('re-')) {
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


