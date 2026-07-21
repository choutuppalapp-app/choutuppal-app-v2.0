import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

/** POST /api/real-estate — create a property listing. */
export async function POST(request: NextRequest) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }

  const slug = await uniqueSlug(parsed.data.title)
  const re = await prisma.realEstate.create({
    data: { ...parsed.data, slug, ownerId: auth.user.id, status: 'PENDING' },
  })
  return NextResponse.json({ ok: true, realEstate: re }, { status: 201 })
}

/** GET /api/real-estate — list the current user's properties. */
export async function GET() {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const realEstates = await prisma.realEstate.findMany({
    where: { ownerId: auth.user.id },
    orderBy: { createdAt: 'desc' },
    include: { village: true },
  })
  return NextResponse.json({ ok: true, realEstates })
}
