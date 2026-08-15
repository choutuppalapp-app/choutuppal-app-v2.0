import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_TENANT } from '@/lib/tenant-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const SECRET_TOKEN = process.env.SHEET_SYNC_SECRET || 'sheet_sync_secret_choutuppal_2026'

/**
 * Safely verifies if a tenantId exists in the database.
 * If candidateTenantId is null, undefined, or doesn't exist in Tenant table, returns null.
 */
async function resolveValidTenantId(candidateTenantId?: string): Promise<string | null> {
  if (!candidateTenantId || typeof candidateTenantId !== 'string') return null
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: candidateTenantId.trim() },
      select: { id: true },
    })
    return tenant ? tenant.id : null
  } catch {
    return null
  }
}

/**
 * Normalizes object keys regardless of spacing, capitalization, or special characters.
 * E.g., "Business Name", "business_name", "Primary Phone" -> normalized schema properties.
 */
function normalizePayloadRow(row: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = { ...row }
  if (!row || typeof row !== 'object') return normalized

  for (const [rawKey, val] of Object.entries(row)) {
    if (val === undefined || val === null) continue
    const cleanKey = String(rawKey).toLowerCase().replace(/[^a-z0-9]/g, '')
    const trimmedVal = typeof val === 'string' ? val.trim() : val

    // Title / Business Name synonyms
    if (['businessname', 'name', 'title', 'businesstitle', 'shopname', 'storename', 'firmname'].includes(cleanKey)) {
      normalized.title = trimmedVal
    }
    // Primary Phone synonyms
    if (['primaryphone', 'phone', 'phonenumber', 'contactphone', 'contactnumber', 'mobile', 'mobilenumber'].includes(cleanKey)) {
      normalized.phone = trimmedVal
    }
    // Secondary Phone synonyms
    if (['secondaryphone', 'altphone', 'alternatephone', 'phone2', 'mobile2'].includes(cleanKey)) {
      normalized.secondaryPhone = trimmedVal
    }
    // WhatsApp synonyms
    if (['whatsapp', 'whatsappnumber', 'whatsappphone', 'wapp'].includes(cleanKey)) {
      normalized.whatsapp = trimmedVal
    }
    // Category synonyms
    if (['category', 'businesscategory', 'cat', 'type'].includes(cleanKey)) {
      normalized.category = trimmedVal
    }
    // Village synonyms
    if (['village', 'villagename', 'town', 'location', 'area'].includes(cleanKey)) {
      normalized.village = trimmedVal
    }
    // Address synonyms
    if (['address', 'fulladdress', 'street', 'landmark'].includes(cleanKey)) {
      normalized.address = trimmedVal
    }
    // Description / About synonyms
    if (['about', 'description', 'aboutbusiness', 'details', 'summary', 'info'].includes(cleanKey)) {
      normalized.description = trimmedVal
    }
    // Cover Image / Logo
    if (['coverimage', 'image', 'photo', 'banner', 'img'].includes(cleanKey)) {
      normalized.coverImage = trimmedVal
    }
    if (['logo', 'logoimage', 'icon'].includes(cleanKey)) {
      normalized.logo = trimmedVal
    }
    // Price / Rent
    if (['price', 'amount', 'cost', 'rent'].includes(cleanKey)) {
      normalized.price = trimmedVal
    }
  }

  return normalized
}

/**
 * Parses services string in format: "Name::Price::Description || Name2::Price2::Description2"
 */
function parseServices(servicesStr?: string): Array<{ name: string; price: number | null; description?: string }> | null {
  if (!servicesStr || typeof servicesStr !== 'string') return null
  const entries = servicesStr.split('||').map((s) => s.trim()).filter(Boolean)
  if (entries.length === 0) return null

  return entries.map((entry) => {
    const parts = entry.split('::').map((p) => p.trim())
    const name = parts[0] ?? 'Service'
    const rawPrice = parts[1] ? parseFloat(parts[1]) : NaN
    const price = isNaN(rawPrice) ? null : rawPrice
    const description = parts[2] || undefined
    return { name, price, description }
  })
}

function slugify(text: string): string {
  const clean = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')

  return clean || `item-${Date.now()}`
}

async function getOrCreateOwner(): Promise<string> {
  const admin = await prisma.user.findFirst({
    where: { OR: [{ role: 'ADMIN' }, { role: 'SUPER_ADMIN' }] },
  })
  if (admin) return admin.id

  const anyUser = await prisma.user.findFirst()
  if (anyUser) return anyUser.id

  const newUser = await prisma.user.create({
    data: {
      email: 'admin@choutuppal.in',
      name: 'Choutuppal Admin',
      role: 'ADMIN',
    },
  })
  return newUser.id
}

async function getOrCreateCategory(categoryName?: string) {
  if (!categoryName || !categoryName.trim()) return null
  const name = categoryName.trim()
  const slug = slugify(name)

  const existing = await prisma.category.findFirst({
    where: { OR: [{ name: { equals: name, mode: 'insensitive' } }, { slug }] },
  })
  if (existing) return existing

  return prisma.category.create({
    data: { name, slug },
  })
}

async function getOrCreateVillage(villageName?: string) {
  if (!villageName || !villageName.trim()) return null
  const name = villageName.trim()
  const slug = slugify(name)

  const existing = await prisma.village.findFirst({
    where: { OR: [{ name: { equals: name, mode: 'insensitive' } }, { slug }] },
  })
  if (existing) return existing

  return prisma.village.create({
    data: { name, slug },
  })
}

async function resolveCategoriesMap(items: Array<Record<string, any>>): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const rawNames = Array.from(
    new Set(
      items
        .map((i) => i.category)
        .filter((c): c is string => typeof c === 'string' && Boolean(c.trim())),
    ),
  )

  for (const rawName of rawNames) {
    const category = await getOrCreateCategory(rawName)
    if (category) {
      map.set(rawName.trim().toLowerCase(), category.id)
    }
  }
  return map
}

async function resolveVillagesMap(items: Array<Record<string, any>>): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  const rawNames = Array.from(
    new Set(
      items
        .map((i) => i.village)
        .filter((v): v is string => typeof v === 'string' && Boolean(v.trim())),
    ),
  )

  for (const rawName of rawNames) {
    const village = await getOrCreateVillage(rawName)
    if (village) {
      map.set(rawName.trim().toLowerCase(), village.id)
    }
  }
  return map
}

export async function POST(req: NextRequest) {
  try {
    // 1. Authorization check
    const authHeader = req.headers.get('authorization')
    const customHeader = req.headers.get('x-webhook-secret')
    const { searchParams } = new URL(req.url)
    const tokenParam = searchParams.get('token')

    const isAuthorized =
      authHeader === `Bearer ${SECRET_TOKEN}` ||
      authHeader === SECRET_TOKEN ||
      customHeader === SECRET_TOKEN ||
      tokenParam === SECRET_TOKEN

    if (!isAuthorized) {
      console.warn('[SheetSync Webhook] Unauthorized attempt with token:', tokenParam || authHeader)
      return NextResponse.json({ ok: false, error: 'Unauthorized: Invalid secret token' }, { status: 401 })
    }

    // 2. Parse & Log Incoming Payload
    const body = await req.json()
    console.log('[SheetSync Webhook Payload Received]:', JSON.stringify(body, null, 2))

    const { type, data, tenantId: bodyTenantId } = body

    if (!type || !data) {
      return NextResponse.json({ ok: false, error: 'Invalid payload. Missing "type" or "data".' }, { status: 400 })
    }

    const rawItems = Array.isArray(data) ? data : [data]
    const items = rawItems.map(normalizePayloadRow)
    const ownerId = await getOrCreateOwner()

    // Verify candidate tenantId against database. Returns null if tenant row does not exist, avoiding foreign key errors.
    const candidateTenantId = bodyTenantId || DEFAULT_TENANT.id
    const targetTenantId = await resolveValidTenantId(candidateTenantId)

    const sheetType = String(type).trim().toLowerCase()
    let processedCount = 0

    // 3. Process records in bulk using Prisma createMany
    if (sheetType === 'listings' || sheetType === 'business' || sheetType === 'listing') {
      const categoryMap = await resolveCategoriesMap(items)
      const villageMap = await resolveVillagesMap(items)

      const mappedListings = items.map((row, idx) => {
        const title = row.title || row.name || `Business ${idx + 1}`
        const phone = row.phone ? String(row.phone).trim() : null
        const secondaryPhone = row.secondaryPhone ? String(row.secondaryPhone).trim() : null
        const whatsapp = row.whatsapp ? String(row.whatsapp).trim() : phone
        const address = row.address || ''
        const coverImage = row.coverImage || null
        const logo = row.logo || null
        const description = row.description || `${title} in Choutuppal.`
        const hours = row.hours ? { raw: row.hours } : null
        const servicesCatalog = parseServices(row.services)
        const categoryId = row.category ? categoryMap.get(String(row.category).trim().toLowerCase()) || null : null
        const villageId = row.village ? villageMap.get(String(row.village).trim().toLowerCase()) || null : null
        const baseSlug = slugify(title)
        const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`

        return {
          title,
          slug,
          description,
          coverImage,
          logo,
          phone,
          secondaryPhone,
          whatsapp,
          address,
          businessHours: hours ? (hours as any) : undefined,
          servicesCatalog: servicesCatalog ? (servicesCatalog as any) : undefined,
          categoryId,
          villageId,
          ownerId,
          tenantId: targetTenantId,
          status: 'APPROVED',
        }
      })

      const res = await prisma.listing.createMany({
        data: mappedListings,
        skipDuplicates: true,
      })
      processedCount = res.count
    } else if (
      sheetType === 'real estate' ||
      sheetType === 'realestate' ||
      sheetType === 'properties' ||
      sheetType === 'property'
    ) {
      const villageMap = await resolveVillagesMap(items)

      const mappedProperties = items.map((row, idx) => {
        const title = row.title || `Property ${idx + 1}`
        const rawType = String(row.type || 'PLOT').toUpperCase()
        const propType = ['PLOT', 'HOUSE', 'COMMERCIAL', 'AGRICULTURE', 'RENTAL'].includes(rawType)
          ? rawType
          : 'PLOT'
        const listingType = String(row.listingType || (propType === 'RENTAL' ? 'RENT' : 'SALE')).toUpperCase()
        const price = parseFloat(row.price) || 0
        const address = row.address || 'Choutuppal, Yadadri'
        const phone = row.phone ? String(row.phone).trim() : null
        const coverImage = row.coverImage || null
        const description = row.description || title
        const bhk = parseInt(row.bhk || row.bedrooms) || null
        const villageId = row.village ? villageMap.get(String(row.village).trim().toLowerCase()) || null : null
        const baseSlug = slugify(title)
        const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`

        return {
          title,
          slug,
          description,
          type: propType,
          listingType,
          price,
          bedrooms: bhk,
          address,
          contactPhone: phone,
          contactWhatsapp: row.whatsapp ?? phone,
          coverImage,
          villageId,
          ownerId,
          tenantId: targetTenantId,
          status: 'APPROVED',
        }
      })

      const res = await prisma.realEstate.createMany({
        data: mappedProperties,
        skipDuplicates: true,
      })
      processedCount = res.count
    } else if (sheetType === 'news') {
      const mappedNews = items.map((row, idx) => {
        const title = row.title || `Choutuppal News ${idx + 1}`
        const content = row.content || row.description || title
        const summary = row.summary || row.excerpt || content.substring(0, 150)
        const image = row.coverImage || row.image || null
        const baseSlug = slugify(title)
        const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`

        return {
          title,
          slug,
          summary,
          content,
          image,
          tenantId: targetTenantId,
          isPublished: true,
          publishedAt: new Date(),
          authorId: ownerId,
        }
      })

      const res = await prisma.news.createMany({
        data: mappedNews,
        skipDuplicates: true,
      })
      processedCount = res.count
    } else if (sheetType === 'blogs' || sheetType === 'blog') {
      const mappedBlogs = items.map((row, idx) => {
        const title = row.title || `Choutuppal Blog ${idx + 1}`
        const content = row.content || row.description || title
        const excerpt = row.excerpt || row.summary || content.substring(0, 150)
        const coverImage = row.coverImage || row.image || null
        const baseSlug = slugify(title)
        const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`

        return {
          title,
          slug,
          excerpt,
          content,
          coverImage,
          tenantId: targetTenantId,
          isPublished: true,
          publishedAt: new Date(),
          authorId: ownerId,
        }
      })

      const res = await prisma.blog.createMany({
        data: mappedBlogs,
        skipDuplicates: true,
      })
      processedCount = res.count
    } else {
      return NextResponse.json(
        { ok: false, error: `Unsupported type: "${type}". Supported types: Listings, Real Estate, News, Blogs.` },
        { status: 400 },
      )
    }

    return NextResponse.json({
      ok: true,
      success: true,
      message: `Processed ${processedCount} records successfully for type "${type}".`,
      count: processedCount,
    })
  } catch (error) {
    console.error('[SheetSync Webhook Error]:', error)
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
