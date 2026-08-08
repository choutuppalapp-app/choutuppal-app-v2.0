import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdminRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** GET /api/admin/tenants — List all tenant partner configurations */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            listings: true,
            realEstates: true,
            news: true,
            blogs: true,
          },
        },
      },
    })

    return NextResponse.json({ ok: true, tenants })
  } catch (err) {
    console.error('[AdminTenantsAPI] GET error:', err)
    return NextResponse.json({ ok: false, tenants: [] }, { status: 500 })
  }
}

/** POST /api/admin/tenants — Create a new tenant partner configuration */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, domain, logoUrl, primaryColor, adminPhone } = body

    if (!name || !domain || !adminPhone) {
      return NextResponse.json(
        { ok: false, error: 'Missing required fields: name, domain, adminPhone' },
        { status: 400 },
      )
    }

    const cleanDomain = String(domain).toLowerCase().trim().replace(/^https?:\/\//, '')

    const existing = await prisma.tenant.findUnique({
      where: { domain: cleanDomain },
    })

    if (existing) {
      return NextResponse.json(
        { ok: false, error: `Domain "${cleanDomain}" is already registered to another tenant.` },
        { status: 400 },
      )
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: name.trim(),
        domain: cleanDomain,
        logoUrl: logoUrl || null,
        primaryColor: primaryColor || '#1d4ed8',
        adminPhone: adminPhone.trim(),
      },
    })

    return NextResponse.json({ ok: true, tenant }, { status: 201 })
  } catch (err) {
    console.error('[AdminTenantsAPI] POST error:', err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Failed to create tenant' },
      { status: 500 },
    )
  }
}
