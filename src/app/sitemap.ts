import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'https://choutuppal.in').replace(/\/$/, '')

export const revalidate = 86400 // Revalidate once per day

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}`, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/listings`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/explore`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/shorts`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/community`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ]

  let listingRoutes: MetadataRoute.Sitemap = []
  let realEstateRoutes: MetadataRoute.Sitemap = []
  let newsRoutes: MetadataRoute.Sitemap = []
  let blogRoutes: MetadataRoute.Sitemap = []

  try {
    const [listings, realEstate, news, blogs] = await Promise.all([
      prisma.listing.findMany({
        where: { status: 'APPROVED' },
        select: { slug: true, updatedAt: true },
        take: 1000,
      }),
      prisma.realEstate.findMany({
        where: { status: 'APPROVED' },
        select: { slug: true, updatedAt: true },
        take: 1000,
      }),
      prisma.news.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
        take: 500,
      }),
      prisma.blog.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
        take: 500,
      }),
    ])

    listingRoutes = listings.map((l) => ({
      url: `${SITE_URL}/business/${l.slug}`,
      lastModified: l.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.9,
    }))

    realEstateRoutes = realEstate.map((r) => ({
      url: `${SITE_URL}/listings?type=realestate`,
      lastModified: r.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    newsRoutes = news.map((n) => ({
      url: `${SITE_URL}/news/${n.slug}`,
      lastModified: n.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    }))

    blogRoutes = blogs.map((b) => ({
      url: `${SITE_URL}/blog/${b.slug}`,
      lastModified: b.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    }))
  } catch (err) {
    console.error('[Sitemap] Error fetching routes from DB:', err)
  }

  return [...staticRoutes, ...listingRoutes, ...realEstateRoutes, ...newsRoutes, ...blogRoutes]
}
