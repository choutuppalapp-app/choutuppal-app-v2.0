import { safeDbQuery } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiUser, isAdminRole } from '@/lib/session'
import { getCurrentTenant, getTenantWhereClause } from '@/lib/tenant'

export const runtime = 'nodejs'
export const revalidate = 3600

function slugify(s: string): string {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 80)
}

const CreateSchema = z.object({
  title: z.string().min(2).max(120),
  description: z.string().min(2),
  type: z.enum(['PLOT', 'HOUSE', 'APARTMENT', 'COMMERCIAL', 'FARM']).default('PLOT'),
  listingType: z.enum(['SALE', 'RENT', 'LEASE']).default('SALE'),
  price: z.number().min(0),
  negotiable: z.boolean().optional(),
  areaSqft: z.number().optional(),
  bedrooms: z.number().int().optional(),
  bathrooms: z.number().int().optional(),
  furnished: z.boolean().optional(),
  images: z.array(z.string()).max(8).optional(),
  coverImage: z.string().nullable().optional(),
  address: z.string().min(2),
  location: z.string().optional(),
  mapEmbed: z.string().optional(),
  contactPhone: z.string().optional(),
  contactWhatsapp: z.string().optional(),
  villageId: z.string().optional(),
})

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base) || `property-${Date.now()}`
  let i = 1
  while (await prisma.realEstate.findUnique({ where: { slug } })) {
    slug = `${slugify(base)}-${i++}`
  }
  return slug
}

/** POST /api/real-estate ?" create a property listing. */
export async function POST(request: NextRequest) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: any
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON data received' }, { status: 400 })
  }

  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }

  const tenant = await getCurrentTenant()
  
  // Safely resolve tenantId to prevent foreign key constraint violations
  let resolvedTenantId: string | undefined = tenant.id
  if (resolvedTenantId === 'choutuppal-default') {
    const realTenant = await prisma.tenant.findFirst({
      where: { OR: [{ domain: 'choutuppal.in' }, { name: 'Choutuppal App' }] }
    }) || await prisma.tenant.findFirst()
    
    if (realTenant) {
      resolvedTenantId = realTenant.id
    } else {
      resolvedTenantId = undefined // Let it be null if no tenant exists at all
    }
  }

  const slug = await uniqueSlug(parsed.data.title)
  
  try {
    const re = await prisma.realEstate.create({
      data: { ...parsed.data, slug, ownerId: auth.user.id, tenantId: resolvedTenantId, status: isAdminRole(auth.user.role) ? 'APPROVED' : 'PENDING' },
    })
    return NextResponse.json({ ok: true, realEstate: re }, { status: 201 })
  } catch (err: any) {
    console.error('[API RealEstate POST] Error:', err)
    return NextResponse.json({ error: err.message || 'Database error occurred' }, { status: 500 })
  }
}

/** GET /api/real-estate ?" list properties. Supports filtering by userId for admins. */
export async function GET(request: NextRequest) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const tenant = await getCurrentTenant()
  const tenantFilter = getTenantWhereClause(tenant.id)

  const { searchParams } = new URL(request.url)
  const queryUserId = searchParams.get('userId')
  let targetUserId = auth.user.id
  if (queryUserId && isAdminRole(auth.user.role)) {
    targetUserId = queryUserId
  }

  const realEstates = (await (async () => { try { return await prisma.realEstate.findMany({
    where: { ownerId: targetUserId, ...tenantFilter },
    orderBy: { createdAt: 'desc' },
    include: { village: true },
  }); } catch(e) { return [] as any; } })())
  return NextResponse.json({ ok: true, realEstates })
}
