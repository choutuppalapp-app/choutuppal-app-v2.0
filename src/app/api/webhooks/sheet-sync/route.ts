import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DEFAULT_TENANT } from '@/lib/tenant-types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SECRET_TOKEN = process.env.SHEET_SYNC_SECRET || 'sheet_sync_secret_choutuppal_2026'

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

    // Webhooks coming from external Google Sheets default to DEFAULT_TENANT (Choutuppal) unless tenantId is explicitly provided
    const targetTenantId = bodyTenantId || DEFAULT_TENANT.id

    const results: Array<{ action: string; id: string; title: string | null }> = []
    const sheetType = String(type).trim().toLowerCase()

    // 3. Process records based on sheet type with try/catch per section
    if (sheetType === 'listings' || sheetType === 'business' || sheetType === 'listing') {
      for (const row of items) {
        const title = row.title || row.name || 'Untitled Business'
        const phone = row.phone ? String(row.phone).trim() : null
        const secondaryPhone = row.secondaryPhone ? String(row.secondaryPhone).trim() : null
        const whatsapp = row.whatsapp ? String(row.whatsapp).trim() : phone
        const address = row.address || ''
        const coverImage = row.coverImage || null
        const logo = row.logo || null
        const description = row.description || `${title} in Choutuppal.`
        const hours = row.hours ? { raw: row.hours } : null
        const servicesCatalog = parseServices(row.services)

        const category = await getOrCreateCategory(row.category)
        const village = await getOrCreateVillage(row.village)

        let existing: any = null
        if (phone) {
          existing = await prisma.listing.findFirst({ where: { phone } })
        }

        if (existing) {
          const updated = await prisma.listing.update({
            where: { id: existing.id },
            data: {
              title,
              description,
              coverImage: coverImage ?? existing.coverImage,
              logo: logo ?? existing.logo,
              phone: phone ?? existing.phone,
              secondaryPhone: secondaryPhone ?? existing.secondaryPhone,
              whatsapp: whatsapp ?? existing.whatsapp,
              address: address || existing.address,
              businessHours: hours ? (hours as any) : (existing.businessHours as any),
              servicesCatalog: servicesCatalog ? (servicesCatalog as any) : (existing.servicesCatalog as any),
              categoryId: category?.id ?? existing.categoryId,
              villageId: village?.id ?? existing.villageId,
              tenantId: targetTenantId,
              status: 'APPROVED',
            },
          })
          results.push({ action: 'updated', id: updated.id, title: updated.title })
        } else {
          const slug = `${slugify(title)}-${Math.random().toString(36).substring(2, 7)}`
          const created = await prisma.listing.create({
            data: {
              title,
              slug,
              description,
              coverImage,
              logo,
              phone,
              secondaryPhone: secondaryPhone ?? undefined,
              whatsapp,
              address,
              businessHours: hours ? (hours as any) : undefined,
              servicesCatalog: servicesCatalog ? (servicesCatalog as any) : undefined,
              categoryId: category?.id,
              villageId: village?.id,
              ownerId,
              tenantId: targetTenantId,
              status: 'APPROVED',
            },
          })
          results.push({ action: 'created', id: created.id, title: created.title })
        }
      }
    } else if (
      sheetType === 'real estate' ||
      sheetType === 'realestate' ||
      sheetType === 'properties' ||
      sheetType === 'property'
    ) {
      for (const row of items) {
        const title = row.title || 'Property in Choutuppal'
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

        const village = await getOrCreateVillage(row.village)

        let existing: any = null
        if (phone) {
          existing = await prisma.realEstate.findFirst({
            where: { title, contactPhone: phone },
          })
        }

        if (existing) {
          const updated = await prisma.realEstate.update({
            where: { id: existing.id },
            data: {
              title,
              description,
              type: propType,
              listingType,
              price,
              bedrooms: bhk ?? existing.bedrooms,
              address,
              contactPhone: phone ?? existing.contactPhone,
              contactWhatsapp: row.whatsapp ?? phone ?? existing.contactWhatsapp,
              coverImage: coverImage ?? existing.coverImage,
              villageId: village?.id ?? existing.villageId,
              tenantId: targetTenantId,
              status: 'APPROVED',
            },
          })
          results.push({ action: 'updated', id: updated.id, title: updated.title })
        } else {
          const slug = `${slugify(title)}-${Math.random().toString(36).substring(2, 7)}`
          const created = await prisma.realEstate.create({
            data: {
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
              villageId: village?.id,
              ownerId,
              tenantId: targetTenantId,
              status: 'APPROVED',
            },
          })
          results.push({ action: 'created', id: created.id, title: created.title })
        }
      }
    } else if (sheetType === 'news') {
      for (const row of items) {
        const title = row.title || 'Choutuppal News'
        const content = row.content || row.description || title
        const summary = row.summary || row.excerpt || content.substring(0, 150)
        const image = row.coverImage || row.image || null
        const slug = slugify(title)

        const existing = await prisma.news.findUnique({ where: { slug } })

        if (existing) {
          const updated = await prisma.news.update({
            where: { id: existing.id },
            data: {
              title,
              summary,
              content,
              image: image ?? existing.image,
              tenantId: targetTenantId,
              isPublished: true,
              publishedAt: new Date(),
            },
          })
          results.push({ action: 'updated', id: updated.id, title: updated.title })
        } else {
          const created = await prisma.news.create({
            data: {
              title,
              slug,
              summary,
              content,
              image,
              tenantId: targetTenantId,
              isPublished: true,
              publishedAt: new Date(),
              authorId: ownerId,
            },
          })
          results.push({ action: 'created', id: created.id, title: created.title })
        }
      }
    } else if (sheetType === 'blogs' || sheetType === 'blog') {
      for (const row of items) {
        const title = row.title || 'Choutuppal Blog'
        const content = row.content || row.description || title
        const excerpt = row.excerpt || row.summary || content.substring(0, 150)
        const coverImage = row.coverImage || row.image || null
        const slug = slugify(title)

        const existing = await prisma.blog.findUnique({ where: { slug } })

        if (existing) {
          const updated = await prisma.blog.update({
            where: { id: existing.id },
            data: {
              title,
              excerpt,
              content,
              coverImage: coverImage ?? existing.coverImage,
              tenantId: targetTenantId,
              isPublished: true,
              publishedAt: new Date(),
            },
          })
          results.push({ action: 'updated', id: updated.id, title: updated.title })
        } else {
          const created = await prisma.blog.create({
            data: {
              title,
              slug,
              excerpt,
              content,
              coverImage,
              tenantId: targetTenantId,
              isPublished: true,
              publishedAt: new Date(),
              authorId: ownerId,
            },
          })
          results.push({ action: 'created', id: created.id, title: created.title })
        }
      }
    } else {
      return NextResponse.json(
        { ok: false, error: `Unsupported type: "${type}". Supported types: Listings, Real Estate, News, Blogs, Shorts.` },
        { status: 400 },
      )
    }

    return NextResponse.json({
      ok: true,
      success: true,
      message: `Processed ${results.length} record(s) for type "${type}".`,
      results,
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
