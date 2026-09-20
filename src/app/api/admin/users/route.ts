import { NextResponse, NextRequest } from 'next/server'
import { requireApiAdmin } from '@/lib/session'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { getOfflineUsers, saveOfflineUser } from '@/lib/offline-data'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')?.toLowerCase() || ''
  const role = searchParams.get('role') || 'ALL'
  const planTier = searchParams.get('planTier') || 'ALL'

  try {
    const dbUsers = await safeDbQuery(
      () =>
        prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            _count: { select: { listings: true, realEstates: true, stories: true } },
          },
        }),
      null
    )

    let users = dbUsers !== null && dbUsers !== undefined ? dbUsers : getOfflineUsers()

    if (search) {
      users = users.filter(
        (u: any) =>
          u.name?.toLowerCase().includes(search) ||
          u.email?.toLowerCase().includes(search) ||
          u.phone?.includes(search) ||
          u.username?.toLowerCase().includes(search)
      )
    }

    if (role !== 'ALL') {
      users = users.filter((u: any) => u.role === role)
    }

    if (planTier !== 'ALL') {
      users = users.filter((u: any) => u.planTier === planTier)
    }

    return NextResponse.json({ ok: true, users, total: users.length })
  } catch (error: any) {
    console.error('[Admin Users GET] Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  try {
    const body = await req.json()
    const { id, role, planTier, isBanned } = body

    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Prevent demoting or banning yourself
    if (id === auth.user.id && (isBanned || (role && role !== 'ADMIN' && role !== 'SUPER_ADMIN'))) {
      return NextResponse.json({ error: 'Cannot ban or demote your own admin account' }, { status: 400 })
    }

    const updateData: any = {}
    if (role !== undefined) updateData.role = role
    if (planTier !== undefined) {
      updateData.planTier = planTier
      if (planTier === 'PREMIUM') {
        updateData.planExpiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      } else {
        updateData.planExpiresAt = null
      }
    }
    if (isBanned !== undefined) updateData.isBanned = Boolean(isBanned)

    // Update in DB
    await safeDbQuery(
      () =>
        prisma.user.update({
          where: { id },
          data: updateData,
        }),
      null
    )

    // Update in offline store
    saveOfflineUser({ id, ...updateData })

    return NextResponse.json({ ok: true, message: 'User updated successfully' })
  } catch (error: any) {
    console.error('[Admin Users PATCH] Error:', error)
    return NextResponse.json({ error: error.message || 'Failed to update user' }, { status: 500 })
  }
}
