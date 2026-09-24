import { NextResponse, NextRequest } from 'next/server'
import { requireApiAdmin } from '@/lib/session'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { getOfflineCategories, getOfflineVillages, saveOfflineListing } from '@/lib/offline-data'
import { invalidateHomeDataCache } from '@/lib/home-data'
import { invalidateCache } from '@/lib/cache'
import { revalidatePath } from 'next/cache'

export const dynamic = 'force-dynamic'

const CATEGORY_MAP: Record<string, string> = {
  electrician: 'services',
  plumber: 'services',
  services: 'services',
  carpenter: 'services',
  painter: 'services',
  medical: 'health-medical',
  health: 'health-medical',
  hospital: 'health-medical',
  pharmacy: 'health-medical',
  clinic: 'health-medical',
  doctor: 'health-medical',
  kirana: 'retail-shopping',
  retail: 'retail-shopping',
  shopping: 'retail-shopping',
  supermarket: 'retail-shopping',
  groceries: 'retail-shopping',
  cloth: 'retail-shopping',
  footwear: 'retail-shopping',
  realestate: 'real-estate',
  'real-estate': 'real-estate',
  'real estate': 'real-estate',
  plot: 'real-estate',
  lands: 'real-estate',
  food: 'food-dining',
  dining: 'food-dining',
  restaurant: 'food-dining',
  hotel: 'food-dining',
  bakery: 'food-dining',
  tiffin: 'food-dining',
  automobile: 'automobile',
  auto: 'automobile',
  bike: 'automobile',
  mechanic: 'automobile',
  garage: 'automobile',
  education: 'education',
  school: 'education',
  college: 'education',
  coaching: 'education',
  tuition: 'education',
  electronics: 'electronics',
  mobile: 'electronics',
  computer: 'electronics',
  transport: 'transport',
  travel: 'transport',
  taxi: 'transport',
  agriculture: 'agriculture',
  farming: 'agriculture',
  fertilizer: 'agriculture',
  pesticides: 'agriculture',
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 45)
}

export async function POST(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const { listings: items = [] } = body

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'No listings provided in import payload' },
        { status: 400 }
      )
    }

    if (items.length > 1000) {
      return NextResponse.json(
        { error: 'Maximum 1,000 listings allowed per batch import' },
        { status: 400 }
      )
    }

    // 1. Fetch available taxonomy or fallback
    const [dbCategories, dbVillages] = await Promise.all([
      safeDbQuery(
        () => prisma.category.findMany({ select: { id: true, name: true, slug: true } }),
        getOfflineCategories()
      ),
      safeDbQuery(
        () => prisma.village.findMany({ select: { id: true, name: true, slug: true } }),
        getOfflineVillages()
      ),
    ])

    const categoryLookup = new Map<string, string>()
    for (const c of dbCategories) {
      categoryLookup.set(c.slug.toLowerCase(), c.id)
      categoryLookup.set(c.name.toLowerCase(), c.id)
    }

    const villageLookup = new Map<string, string>()
    for (const v of dbVillages) {
      villageLookup.set(v.slug.toLowerCase(), v.id)
      villageLookup.set(v.name.toLowerCase(), v.id)
    }

    const defaultVillageId =
      villageLookup.get('choutuppal') || dbVillages[0]?.id || 'v-choutuppal'
    const defaultCategoryId =
      categoryLookup.get('services') || dbCategories[0]?.id || 'cat-services'

    let successCount = 0
    let updatedCount = 0
    const errors: { row: number; title: string; error: string }[] = []

    for (let index = 0; index < items.length; index++) {
      const item = items[index]
      const title = (item.title || item.name || '').trim()

      if (!title) {
        errors.push({
          row: index + 1,
          title: 'Empty title',
          error: 'Title / Shop Name is required',
        })
        continue
      }

      const phone = (item.phone || item.mobile || item.contact || '').toString().trim()
      const whatsapp = (item.whatsapp || item.wa || phone).toString().trim()
      const address = (item.address || item.location || 'Choutuppal, Telangana 508252').trim()
      const description = (
        item.description ||
        item.about ||
        `${title} - Quality merchant in Choutuppal, Telangana.`
      ).trim()

      const status = (item.status || 'APPROVED').toUpperCase()
      const isPremium = Boolean(item.isPremium || item.is_premium)
      const isFeatured = Boolean(item.isFeatured || item.is_featured)
      const coverImage = item.coverImage || item.image || item.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80'

      // Resolve category
      const rawCat = (item.category || item.categoryName || '').toLowerCase().trim()
      const mappedSlug = CATEGORY_MAP[rawCat] || rawCat
      const categoryId =
        categoryLookup.get(mappedSlug) ||
        categoryLookup.get(rawCat) ||
        defaultCategoryId

      // Resolve village
      const rawVillage = (item.village || item.villageName || '').toLowerCase().trim()
      const villageId =
        villageLookup.get(rawVillage) ||
        defaultVillageId

      const baseSlug = slugify(title)
      const slug = baseSlug
        ? `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`
        : `shop-${Date.now()}-${index}`

      let listingType = 'BUSINESS'
      if (['services', 'automobile', 'transport', 'education'].includes(mappedSlug)) {
        listingType = 'SERVICE'
      } else if (mappedSlug === 'real-estate') {
        listingType = 'REAL_ESTATE'
      }

      try {
        await safeDbQuery(
          () =>
            prisma.listing.create({
              data: {
                title,
                slug,
                description,
                type: listingType,
                phone: phone || null,
                whatsapp: whatsapp || null,
                address,
                status: ['APPROVED', 'PENDING', 'REJECTED'].includes(status)
                  ? status
                  : 'APPROVED',
                isPremium,
                isFeatured,
                coverImage,
                categoryId,
                villageId,
                ownerId: auth.user.id,
                views: Math.floor(Math.random() * 60) + 15,
                avgRating: 4.8,
              },
            }),
          null
        )

        // Save into persistent JSON store as well
        saveOfflineListing({
          title,
          slug,
          description,
          type: listingType,
          phone,
          whatsapp,
          address,
          status: ['APPROVED', 'PENDING', 'REJECTED'].includes(status) ? status : 'APPROVED',
          isPremium,
          isFeatured,
          coverImage,
          categoryId,
          villageId,
          owner: { id: auth.user.id, name: auth.user.name || 'Admin', username: auth.user.username || 'admin', phone: auth.user.phone },
        })

        successCount++
      } catch (err: any) {
        errors.push({
          row: index + 1,
          title,
          error: err.message || 'Failed to save listing',
        })
      }
    }

    // Invalidate app caches
    invalidateHomeDataCache()
    invalidateCache('listings_')
    invalidateCache('listing_')
    try {
      revalidatePath('/')
      revalidatePath('/explore')
      revalidatePath('/listings')
      revalidatePath('/admin/listings')
    } catch {}

    return NextResponse.json({
      ok: true,
      totalReceived: items.length,
      imported: successCount,
      updated: updatedCount,
      failed: errors.length,
      errors: errors.slice(0, 10),
      message: `Successfully processed ${successCount} listings.`,
    })
  } catch (error: any) {
    console.error('[Bulk Import API] Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error during bulk import' },
      { status: 500 }
    )
  }
}
