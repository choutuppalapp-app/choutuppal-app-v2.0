import { NextRequest, NextResponse } from 'next/server'
import Papa from 'papaparse'
import { prisma } from '@/lib/prisma'
import { requireApiAgent } from '@/lib/session'

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

async function uniqueSlug(base: string): Promise<string> {
  let slug = slugify(base) || `listing-${Date.now()}`
  let i = 1
  while (await prisma.listing.findUnique({ where: { slug } })) {
    slug = `${slugify(base)}-${i++}`
  }
  return slug
}

/**
 * Normalize a CSV header to a canonical field key.
 * Accepts: name/title, category, phone, whatsapp, address, location, email,
 * website, description/about, map/maplink, village.
 */
function mapHeader(h: string): string {
  const k = h.toLowerCase().trim()
  if (k === 'name' || k === 'title' || k === 'business') return 'title'
  if (k === 'category' || k === 'cat') return 'categoryName'
  if (k === 'phone' || k === 'mobile') return 'phone'
  if (k === 'whatsapp' || k === 'wa') return 'whatsapp'
  if (k === 'address' || k === 'addr') return 'address'
  if (k === 'location' || k === 'area') return 'location'
  if (k === 'email' || k === 'mail') return 'email'
  if (k === 'website' || k === 'url' || k === 'site') return 'website'
  if (k === 'description' || k === 'about' || k === 'desc') return 'description'
  if (k === 'map' || k === 'maplink' || k === 'googlemap') return 'mapEmbed'
  if (k === 'village' || k === 'town') return 'villageName'
  return k
}

/**
 * POST /api/agent/csv-import
 * multipart/form-data with field `file` (a .csv).
 * Parses with papaparse, maps headers, bulk-inserts listings (status PENDING).
 * Returns { ok, added, skipped, errors }.
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiAgent()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No CSV file provided' }, { status: 400 })
  }
  if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
    return NextResponse.json({ error: 'File must be a .csv' }, { status: 400 })
  }

  const text = await file.text()
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
    transformHeader: mapHeader,
  })

  if (parsed.errors.length && parsed.data.length === 0) {
    return NextResponse.json(
      { error: `CSV parse error: ${parsed.errors[0].message}` },
      { status: 400 },
    )
  }

  // Preload categories + villages for name → id mapping.
  const [categories, villages] = await Promise.all([
    prisma.category.findMany(),
    prisma.village.findMany(),
  ])
  const catByName = new Map(categories.map((c) => [c.name.toLowerCase(), c]))
  const villageByName = new Map(villages.map((v) => [v.name.toLowerCase(), v]))

  let added = 0
  let skipped = 0
  const errors: string[] = []

  for (const [i, row] of parsed.data.entries()) {
    const title = (row.title ?? '').trim()
    if (!title) {
      skipped++
      errors.push(`Row ${i + 2}: missing title`)
      continue
    }
    const description = (row.description ?? `${title} — listed via CSV import.`).trim()
    if (description.length < 2) {
      skipped++
      errors.push(`Row ${i + 2}: description too short`)
      continue
    }

    const cat = row.categoryName ? catByName.get(row.categoryName.toLowerCase()) : null
    const village = row.villageName ? villageByName.get(row.villageName.toLowerCase()) : null

    try {
      const slug = await uniqueSlug(title)
      await prisma.listing.create({
        data: {
          slug,
          title,
          description,
          phone: row.phone ?? null,
          whatsapp: row.whatsapp ?? null,
          email: row.email ?? null,
          website: row.website ?? null,
          address: row.address ?? null,
          location: row.location ?? null,
          mapEmbed: row.mapEmbed ?? null,
          categoryId: cat?.id ?? null,
          villageId: village?.id ?? null,
          ownerId: auth.user.id,
          status: 'PENDING',
        },
      })
      added++
    } catch (err) {
      skipped++
      errors.push(`Row ${i + 2}: ${err instanceof Error ? err.message : 'insert failed'}`)
    }
  }

  return NextResponse.json({ ok: true, added, skipped, errors: errors.slice(0, 10) })
}
