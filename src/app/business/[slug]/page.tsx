import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { getCurrentUser, isAdminRole } from '@/lib/session'
import { ListingDetailView } from '@/components/business/listing-detail-view'

export const revalidate = 60

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

/** Fetch + access-control a listing by slug. Returns null for 404. */
async function getListing(slug: string) {
  const listing = await safeDbQuery(
    () =>
      prisma.listing.findUnique({
        where: { slug },
        include: {
          category: true,
          village: true,
          owner: { select: { id: true, name: true, username: true, phone: true, image: true, facebookUrl: true, instagramUrl: true, youtubeUrl: true, twitterUrl: true } },
        },
      }),
    null,
  )
  if (!listing) return null

  // Access control: non-APPROVED listings are only visible to the owner or an admin.
  const viewer = await getCurrentUser().catch(() => null)
  const isOwner = viewer?.id === listing.ownerId
  const isAdmin = viewer ? isAdminRole(viewer.role) : false
  if (listing.status !== 'APPROVED' && !isOwner && !isAdmin) {
    return null
  }

  // Increment views (fire-and-forget; only for approved listings viewed by non-owners).
  if (listing.status === 'APPROVED' && !isOwner) {
    void prisma.listing
      .update({ where: { id: listing.id }, data: { views: { increment: 1 } } })
      .catch(() => {})
  }

  return { listing, isOwner, isAdmin }
}

/** SEO / WhatsApp rich preview metadata. Absolute URLs required for OG. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getListing(slug)
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

  const description = listing.description.slice(0, 155)
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
  const data = await getListing(slug)
  if (!data) notFound()

  // Fetch up to 5 related listings from the same category or village (excluding current).
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
    [],
  )

  return <ListingDetailView data={data} related={related} />
}
