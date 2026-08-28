import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const revalidate = 3600

/**
 * POST /api/banners/[id]/click
 * Public endpoint: increments the click count for a banner (fire-and-forget
 * tracking when a user clicks a banner CTA).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  try {
    await prisma.banner.update({
      where: { id },
      data: { clicks: { increment: 1 } },
    })
  } catch {
    // silent — click tracking is non-critical
  }
  return NextResponse.json({ ok: true })
}
