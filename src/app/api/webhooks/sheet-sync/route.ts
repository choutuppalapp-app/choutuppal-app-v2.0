import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const SECRET_TOKEN = process.env.SHEET_SYNC_SECRET || 'sheet_sync_secret_choutuppal_2026'

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

export async function POST(req: Request) {
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
      return NextResponse.json({ error: 'Unauthorized: Invalid secret token' }, { status: 401 })
    }

    // 2. Parse request body
    const body = await req.json()
    const { type, data } = body

    if (!type || !data) {
      return NextResponse.json({ error: 'Invalid payload. Missing "type" or "data".' }, { status: 400 })
    }

    const items = Array.isArray(data) ? data : [data]
    const ownerId = await getOrCreateOwner()
    const results: Array<{ action: string; id: string; title: string | null }> = []

    const sheetType = String(type).trim().toLowerCase()

    // 3. Process records based on sheet type
    if (sheetType === 'listings' || sheetType === 'business' || sheetType === 'listing') {
      for (const row of items) {
        const title = row.name || row.title || 'Untitled Business'
        const phone = row.phone ? String(row.phone).trim() : null
        const whatsapp = row.whatsapp ? String(row.whatsapp).trim() : phone
        const address = row.address || ''
        const coverImage = row.coverImage || row.image || null
        const logo = row.logo || null
        const description = row.about || row.description || `${title} in Choutuppal.`
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
              whatsapp: whatsapp ?? existing.whatsapp,
              address: address || existing.address,
              businessHours: hours ? (hours as any) : (existing.businessHours as any),
              servicesCatalog: servicesCatalog ? (servicesCatalog as any) : (existing.servicesCatalog as any),
              categoryId: category?.id ?? existing.categoryId,
              villageId: village?.id ?? existing.villageId,
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
              whatsapp,
              address,
              businessHours: hours ? (hours as any) : undefined,
              servicesCatalog: servicesCatalog ? (servicesCatalog as any) : undefined,
              categoryId: category?.id,
              villageId: village?.id,
              ownerId,
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
        const coverImage = row.coverImage || row.image || null
        const description = row.about || row.description || title
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
        const image = row.image || row.coverImage || null
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
              isPublished: true,
              publishedAt: new Date(),
              authorId: ownerId,
            },
          })
          results.push({ action: 'created', id: created.id, title: created.title })
        }
      }
    } else if (sheetType === 'shorts' || sheetType === 'short') {
      for (const row of items) {
        const videoUrl = row.url || row.videoUrl
        if (!videoUrl) continue
        const title = row.title || 'Short Video'
        const platform = String(row.platform || 'YOUTUBE').toUpperCase()

        const existing = await prisma.short.findFirst({ where: { videoUrl } })

        if (existing) {
          const updated = await prisma.short.update({
            where: { id: existing.id },
            data: { title, platform },
          })
          results.push({ action: 'updated', id: updated.id, title: updated.title })
        } else {
          const created = await prisma.short.create({
            data: {
              videoUrl,
              title,
              platform,
              ownerId,
            },
          })
          results.push({ action: 'created', id: created.id, title: created.title })
        }
      }
    } else {
      return NextResponse.json(
        { error: `Unsupported type: "${type}". Supported types: Listings, Real Estate, News, Blogs, Shorts.` },
        { status: 400 },
      )
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${results.length} record(s) for type "${type}".`,
      results,
    })
  } catch (error) {
    console.error('[SheetSync Webhook] Error:', error)
    return NextResponse.json(
      { error: 'Internal Server Error', message: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
