import { safeDbQuery } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const campaigns = (await (async () => { try { return await prisma.whatsAppCampaign.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    }); } catch(e) { return [] as any; } })())

    return NextResponse.json({ ok: true, campaigns })
  } catch (err) {
    console.error('[CRM Campaign History GET API] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch campaign history' }, { status: 500 })
  }
}
