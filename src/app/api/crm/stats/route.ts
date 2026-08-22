import { NextResponse } from 'next/server'
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

    const totalContacts = await prisma.whatsAppContact.count()

    const businessOwnersCount = await prisma.whatsAppContact.count({
      where: { userType: 'business_owner' },
    })

    const emergencyGovtCount = await prisma.whatsAppContact.count({
      where: { userType: 'emergency_govt_leader' },
    })

    const messagesSentCount = await prisma.whatsAppLog.count({
      where: { direction: 'outbound' },
    })

    const templatesCount = await prisma.whatsAppTemplate.count()

    const recentLogs = await prisma.whatsAppLog.findMany({
      where: { direction: 'inbound' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const recentInbound = await Promise.all(
      recentLogs.map(async (log) => {
        const contact = await prisma.whatsAppContact.findUnique({
          where: { phone: log.phone },
          select: { name: true, userType: true },
        })

        return {
          id: log.id,
          phone: log.phone,
          name: contact?.name || 'WhatsApp Lead',
          userType: contact?.userType || 'customer',
          message: log.message,
          createdAt: log.createdAt,
        }
      }),
    )

    const revenueData = [
      { name: 'Story / Banner Ads (₹99)', value: 14850, color: '#3b82f6' },
      { name: 'Bulk Promo Messages (₹499)', value: 19960, color: '#10b981' },
      { name: 'City Franchise (₹10,000)', value: 20000, color: '#8b5cf6' },
      { name: 'Festival Greetings (₹149)', value: 5970, color: '#f59e0b' },
    ]

    return NextResponse.json({
      ok: true,
      stats: {
        totalContacts,
        businessOwnersCount,
        emergencyGovtCount,
        messagesSentCount,
        templatesCount,
      },
      recentInbound,
      revenueData,
    })
  } catch (err) {
    console.error('[CRM Stats API] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch CRM stats' }, { status: 500 })
  }
}
