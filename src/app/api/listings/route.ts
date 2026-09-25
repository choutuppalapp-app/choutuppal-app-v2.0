import { safeDbQuery } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiUser, isAdminRole } from '@/lib/session'
import { getCurrentTenant, getTenantWhereClause, getSafeTenantId } from '@/lib/tenant'
import { invalidateHomeDataCache } from '@/lib/home-data'
import { invalidateCache } from '@/lib/cache'
import { saveOfflineListing, getOfflineListings, STANDARD_CATEGORIES, STANDARD_VILLAGES } from '@/lib/offline-data'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80)
}

const ServiceItemSchema = z.object({
  name: z.string(),
  price: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
})

const CreateListingSchema = z.object({
  title: z.string().min(1).max(150),
  description: z.string().optional().default(''),
  coverImage: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  logoImage: z.string().nullable().optional(),
  coverImageUrl: z.string().nullable().optional(),
  gallery: z.array(z.string()).optional(),
  galleryImages: z.array(z.string()).optional(),
  phone: z.string().optional(),
  secondaryPhone: z.string().nullable().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  location: z.string().optional(),
  mapEmbed: z.string().optional(),
  mapLink: z.string().optional(),
  businessHours: z.any().optional(),
  servicesCatalog: z.array(ServiceItemSchema).optional(),
  servicesOffered: z.array(ServiceItemSchema).optional(),
  categoryId: z.string().nullable().optional(),
  villageId: z.string().nullable().optional(),
  isFeatured: z.boolean().optional(),
  type: z.string().optional(),
  status: z.string().optional(),
  is_approved: z.boolean().optional(),
  isApproved: z.boolean().optional(),
})

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base) || `listing-${Date.now()}`
  let i = 1
  try {
    while (await prisma.listing.findUnique({ where: { slug } })) {
      slug = `${slugify(base)}-${i++}`
    }
  } catch {
    slug = `${slugify(base)}-${Date.now().toString(36)}`
  }
  return slug
}

/** POST /api/listings — create a new business/service listing */
export async function POST(request: NextRequest) {
  const auth = await requireApiUser()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON data received' }, { status: 400 })
  }

  const parsed = CreateListingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input format' },
      { status: 400 },
    )
  }

  const resolvedTenantId = (await getSafeTenantId().catch(() => null)) || DEFAULT_TENANT.id
  const finalTitle = parsed.data.title.trim()
  const slug = await uniqueSlug(finalTitle)

  const isPaidTier = auth.user.planTier === 'PRO' || auth.user.planTier === 'PREMIUM'
  const expiresAt = isPaidTier ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const finalCoverImage = parsed.data.coverImage || parsed.data.coverImageUrl || body.coverImageUrl || body.coverImage || null
  const finalLogo = parsed.data.logo || parsed.data.logoImage || body.logoUrl || body.logo || null
  const finalGallery = parsed.data.gallery || parsed.data.galleryImages || body.galleryImages || body.gallery || []
  const finalServices = parsed.data.servicesCatalog || parsed.data.servicesOffered || body.servicesCatalog || body.servicesOffered || []
  const finalMap = parsed.data.mapEmbed || parsed.data.mapLink || body.mapLink || null
  const finalSecondaryPhone = parsed.data.secondaryPhone || body.secondaryPhone || null
  const finalPhone = parsed.data.phone || auth.user.phone || '9494348175'
  const finalWhatsapp = parsed.data.whatsapp || body.whatsapp || finalPhone

  // Resolve valid category & village
  const catObj =
    STANDARD_CATEGORIES.find((c) => c.id === parsed.data.categoryId || c.slug === parsed.data.categoryId) ||
    STANDARD_CATEGORIES[0]

  const vilObj =
    STANDARD_VILLAGES.find((v) => v.id === parsed.data.villageId || v.slug === parsed.data.villageId) ||
    STANDARD_VILLAGES[0]

  const status = isAdminRole(auth.user.role) ? 'APPROVED' : 'APPROVED'

  // 1. Save to Offline Store & Disk directly
  const offlineCreated = saveOfflineListing({
    title: finalTitle,
    slug,
    description: parsed.data.description || `${finalTitle} in Choutuppal`,
    type: parsed.data.type || 'BUSINESS',
    status,
    isFeatured: Boolean(body?.isFeatured),
    isPremium: Boolean(isPaidTier),
    coverImage: finalCoverImage,
    logo: finalLogo,
    gallery: finalGallery,
    phone: finalPhone,
    secondaryPhone: finalSecondaryPhone,
    whatsapp: finalWhatsapp,
    address: parsed.data.address || `${vilObj.name}, Choutuppal`,
    mapEmbed: finalMap,
    businessHours: parsed.data.businessHours,
    servicesCatalog: finalServices,
    categoryId: catObj.id,
    villageId: vilObj.id,
    owner: {
      id: auth.user.id,
      name: auth.user.name || auth.user.username || 'User',
      username: auth.user.username,
      phone: finalPhone,
    },
  })

  // 2. Try saving to Prisma DB if available
  let dbListing = null
  try {
    dbListing = await prisma.listing.create({
      data: {
        id: offlineCreated.id,
        title: finalTitle,
        description: parsed.data.description || `${finalTitle} in Choutuppal`,
        coverImage: finalCoverImage,
        logo: finalLogo,
        phone: finalPhone,
        whatsapp: finalWhatsapp,
        address: parsed.data.address || `${vilObj.name}, Choutuppal`,
        mapEmbed: finalMap,
        isFeatured: Boolean(body?.isFeatured),
        slug,
        ownerId: auth.user.id,
        tenantId: resolvedTenantId,
        categoryId: catObj.id,
        villageId: vilObj.id,
        expiresAt,
        status,
      },
    })
  } catch (err) {
    console.warn('[API Listings POST] Prisma save fallback to offline store:', err)
  }

  invalidateHomeDataCache()
  invalidateCache('listings_')
  invalidateCache('listing_')
  invalidateCache('home_data_')
  try {
    revalidatePath('/')
    revalidatePath('/explore')
    revalidatePath('/listings')
    revalidatePath('/dashboard')
    revalidatePath('/profile/listings')
  } catch {}

  return NextResponse.json({ ok: true, listing: dbListing || offlineCreated }, { status: 201 })
}

/** GET /api/listings — list listings for the current user or filters. */
export async function GET(request: NextRequest) {
  const auth = await requireApiUser()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { searchParams } = new URL(request.url)
  const queryUserId = searchParams.get('userId')
  let targetUserId = auth.user.id
  if (queryUserId && isAdminRole(auth.user.role)) {
    targetUserId = queryUserId
  }

  // Get both DB and offline listings
  const offlineAll = getOfflineListings()
  let userListings = offlineAll.filter(
    (l) => l.owner?.id === targetUserId || l.ownerId === targetUserId || (!l.ownerId && auth.user.role === 'ADMIN')
  )

  try {
    const dbListings = await prisma.listing.findMany({
      where: { ownerId: targetUserId },
      orderBy: { createdAt: 'desc' },
      include: { category: true, village: true },
    })
    if (dbListings && dbListings.length > 0) {
      // Merge unique by id/slug
      const map = new Map<string, any>()
      for (const item of dbListings) map.set(item.id, item)
      for (const item of userListings) {
        if (!map.has(item.id)) map.set(item.id, item)
      }
      userListings = Array.from(map.values())
    }
  } catch (err) {
    // safe fallback to offline
  }

  return NextResponse.json({ ok: true, listings: userListings })
}
