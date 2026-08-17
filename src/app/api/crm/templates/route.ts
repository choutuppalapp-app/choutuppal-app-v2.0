import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEFAULT_TEMPLATES = [
  {
    name: 'Welcome Greeting',
    type: 'TEXT',
    payload: {
      text: 'నమస్కారం! చౌటుప్పల్ యాప్ కి స్వాగతం. 🙏 మీకు ఏ సమాచారం కావాలో ఇక్కడ టైప్ చేయండి.',
    },
  },
  {
    name: '₹99 Story Banner Ad Pitch',
    type: 'REVENUE_PITCH',
    payload: {
      text: '📢 మీ షాప్ ని వేలాదిమందికి చూపించండి! ₹99/రోజుకే చౌటుప్పల్ యాప్ టాప్ బ్యానర్ ఆడ్. బుక్ చేయడానికి "AD" అని రిప్లై చేయండి. 🎁',
    },
  },
  {
    name: '₹299 Reels Promotion Pitch',
    type: 'REVENUE_PITCH',
    payload: {
      text: '🎬 మీ బిజినెస్ రీల్ ని చౌటుప్పల్ యాప్ లో ప్రమోట్ చేయండి (₹299/3 రోజులు). రీల్ లింక్ ఇక్కడ పంపండి!',
    },
  },
]

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let templates = await prisma.whatsAppTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // If empty, auto-seed default templates
    if (templates.length === 0) {
      await prisma.whatsAppTemplate.createMany({
        data: DEFAULT_TEMPLATES,
      })

      templates = await prisma.whatsAppTemplate.findMany({
        orderBy: { createdAt: 'desc' },
      })
    }

    return NextResponse.json({ ok: true, templates })
  } catch (err) {
    console.error('[CRM Templates GET API] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, type, textMessage } = body

    if (!name || !textMessage) {
      return NextResponse.json({ error: 'Template name and text message required' }, { status: 400 })
    }

    const template = await prisma.whatsAppTemplate.create({
      data: {
        name,
        type: type || 'TEXT',
        payload: { text: textMessage },
      },
    })

    return NextResponse.json({ ok: true, template })
  } catch (err) {
    console.error('[CRM Templates POST API] Error:', err)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
