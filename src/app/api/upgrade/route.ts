import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** POST /api/upgrade — upgrade user plan to PREMIUM */
export async function POST() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { planTier: 'PREMIUM' },
      select: { id: true, email: true, planTier: true },
    })

    return NextResponse.json({
      ok: true,
      message: 'Congratulations! Your account has been upgraded to PREMIUM.',
      user: updated,
    })
  } catch (err) {
    console.error('[UpgradeAPI] Error updating plan:', err)
    return NextResponse.json(
      { ok: false, error: 'Failed to upgrade plan. Please try again.' },
      { status: 500 },
    )
  }
}
