import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiUser, isAdminRole } from '@/lib/session'
import { getCurrentTenant, getTenantWhereClause } from '@/lib/tenant'

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
  title: z.string().min(2).max(120),
  description: z.string().min(2),
  coverImage: z.string().nullable().optional(),
  logo: z.string().nullable().optional(),
  gallery: z.array(z.string()).max(5).optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  location: z.string().optional(),
  mapEmbed: z.string().optional(),
  businessHours: z.any().optional(),
  servicesCatalog: z.array(ServiceItemSchema).optional(),
  categoryId: z.string().optional(),
  villageId: z.string().optional(),
  isFeatured: z.boolean().optional(),
})

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base) || `listing-${Date.now()}`
  let i = 1
  while (await prisma.listing.findUnique({ where: { slug } })) {
    slug = `${slugify(base)}-${i++}`
  }
  return slug
}

/** POST /api/listings — create a new business/service listing (status PENDING). */
export async function POST(request: NextRequest) {
  const auth = await requireApiUser()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const parsed = CreateListingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input' },
      { status: 400 },
    )
  }

  const tenant = await getCurrentTenant()
  const slug = await uniqueSlug(parsed.data.title)

  const isPaidTier = auth.user.planTier === 'PRO' || auth.user.planTier === 'PREMIUM'
  const expiresAt = isPaidTier ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

  const listing = await prisma.listing.create({
    data: {
      ...parsed.data,
      slug,
      gallery: parsed.data.gallery ?? undefined,
      servicesCatalog: parsed.data.servicesCatalog ?? undefined,
      businessHours: parsed.data.businessHours ?? undefined,
      ownerId: auth.user.id,
      tenantId: tenant.id,
      expiresAt,
      status: isAdminRole(auth.user.role) ? 'APPROVED' : 'PENDING',
    },
  })
  return NextResponse.json({ ok: true, listing }, { status: 201 })
}

/** GET /api/listings — list listings. Supports filtering by userId for admins. */
export async function GET(request: NextRequest) {
  const auth = await requireApiUser()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)

  const { searchParams } = new URL(request.url)
  const queryUserId = searchParams.get('userId')
  let targetUserId = auth.user.id
  if (queryUserId && isAdminRole(auth.user.role)) {
    targetUserId = queryUserId
  }

  const listings = await prisma.listing.findMany({
    where: { ownerId: targetUserId, ...tenantFilter },
    orderBy: { createdAt: 'desc' },
    include: { category: true, village: true },
  })
  return NextResponse.json({ ok: true, listings })
}
