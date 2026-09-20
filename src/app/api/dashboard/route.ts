import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { getDashboardData } from '@/lib/dashboard-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (user.isBanned) {
      return NextResponse.json({ error: 'Account banned' }, { status: 403 })
    }

    const data = await getDashboardData(user)
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
      },
    })
  } catch (err: any) {
    console.error('[API /api/dashboard] Error fetching dashboard data:', err)
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
