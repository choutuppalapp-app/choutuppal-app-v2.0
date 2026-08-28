import { safeDbQuery } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiUser } from '@/lib/session'
import { getSafeTenantId } from '@/lib/tenant'
import { revalidatePath } from 'next/cache'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TTL_HOURS = 24

const CreateSchema = z.object({
  imageUrl: z.string().min(1),
  title: z.string().optional(),
  link: z.string().optional(),
  position: z.enum(['HOME_TOP', 'HOME_MIDDLE', 'SIDEBAR']).default('HOME_TOP'),
})

/** POST /api/banners — create a banner ad that auto-expires in 24h. */
export async function POST(request: NextRequest) {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  let body: unknown;
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON data received' }, { status: 400 })
  }
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }

  const tenantId = await getSafeTenantId()
  if (!tenantId) {
    return NextResponse.json({ ok: false, error: 'Could not resolve or create a tenant.' }, { status: 500 })
  }
  
  const expiresAt = new Date(Date.now() + TTL_HOURS * 60 * 60 * 1000)
  try {
    const banner = await prisma.banner.create({
      data: { ...parsed.data, expiresAt, ownerId: auth.user.id, tenantId },
    })
    revalidatePath('/')
    return NextResponse.json({ ok: true, banner }, { status: 201 })
  } catch (err: any) {
    console.error('Banner Creation Error:', err)
    return NextResponse.json({ error: err.message || 'Database error occurred while saving' }, { status: 500 })
  }
}

/** GET /api/banners — current user's banners. */
export async function GET() {
  const auth = await requireApiUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  const banners = (await (async () => { try { return await prisma.banner.findMany({
    where: { ownerId: auth.user.id },
    orderBy: { createdAt: 'desc' },
  }); } catch(e) { return [] as any; } })())
  return NextResponse.json({ ok: true, banners })
}
