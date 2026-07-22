import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAgent } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/agent/leads
 * Analytics for listings created by the current agent: total views, WhatsApp
 * clicks, total clicks, per-listing breakdown, and lead records.
 */
export async function GET() {
  const auth = await requireApiAgent()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const [listings, leads] = await Promise.all([
    prisma.listing.findMany({
      where: { ownerId: auth.user.id },
      orderBy: { views: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        views: true,
        clicks: true,
        whatsappClicks: true,
        createdAt: true,
      },
    }),
    prisma.lead.findMany({
      where: { agentId: auth.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ])

  const totalViews = listings.reduce((s, l) => s + l.views, 0)
  const totalWhatsapp = listings.reduce((s, l) => s + l.whatsappClicks, 0)
  const totalClicks = listings.reduce((s, l) => s + l.clicks, 0)
  const approved = listings.filter((l) => l.status === 'APPROVED').length
  const pending = listings.filter((l) => l.status === 'PENDING').length

  return NextResponse.json({
    ok: true,
    summary: {
      totalListings: listings.length,
      approved,
      pending,
      totalViews,
      totalWhatsappClicks: totalWhatsapp,
      totalClicks,
      totalLeads: leads.length,
    },
    listings,
    leads,
  })
}
