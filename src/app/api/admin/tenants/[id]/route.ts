import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, isAdminRole } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** PATCH /api/admin/tenants/[id] — Update tenant details */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { name, domain, logoUrl, primaryColor, adminPhone } = body

    const existing = await prisma.tenant.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Tenant not found' }, { status: 404 })
    }

    const dataToUpdate: any = {}
    if (name) dataToUpdate.name = String(name).trim()
    if (domain) dataToUpdate.domain = String(domain).toLowerCase().trim().replace(/^https?:\/\//, '')
    if (logoUrl !== undefined) dataToUpdate.logoUrl = logoUrl || null
    if (primaryColor) dataToUpdate.primaryColor = primaryColor
    if (adminPhone) dataToUpdate.adminPhone = String(adminPhone).trim()

    const updated = await prisma.tenant.update({
      where: { id },
      data: dataToUpdate,
    })

    return NextResponse.json({ ok: true, tenant: updated })
  } catch (err) {
    console.error('[AdminTenantItemAPI] PATCH error:', err)
    return NextResponse.json(
      { ok: false, error: err instanceof Error ? err.message : 'Failed to update tenant' },
      { status: 500 },
    )
  }
}

/** DELETE /api/admin/tenants/[id] — Delete tenant configuration */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user || !isAdminRole(user.role)) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    await prisma.tenant.delete({ where: { id } })

    return NextResponse.json({ ok: true, message: 'Tenant deleted successfully' })
  } catch (err) {
    console.error('[AdminTenantItemAPI] DELETE error:', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to delete tenant' },
      { status: 500 },
    )
  }
}
