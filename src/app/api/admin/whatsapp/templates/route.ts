import { safeDbQuery } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600

/**
 * GET /api/admin/whatsapp/templates — Fetch all saved custom WhatsApp templates
 */
export async function GET() {
  try {
    const templates = (await (async () => { try { return await prisma.whatsAppTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    }); } catch(e) { return [] as any; } })())

    return NextResponse.json({ ok: true, templates })
  } catch (err) {
    console.error('[WhatsApp Templates GET error]:', err)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

/**
 * POST /api/admin/whatsapp/templates — Create/save a custom WhatsApp template
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, type, payload } = body

    if (!name || !type || !payload) {
      return NextResponse.json({ error: 'Name, type, and payload are required' }, { status: 400 })
    }

    const template = await prisma.whatsAppTemplate.create({
      data: {
        name,
        type,
        payload,
      },
    })

    return NextResponse.json({ ok: true, template })
  } catch (err) {
    console.error('[WhatsApp Templates POST error]:', err)
    return NextResponse.json({ error: 'Failed to save template' }, { status: 500 })
  }
}
