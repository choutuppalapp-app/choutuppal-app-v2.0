import { safeDbQuery } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DEFAULT_TEMPLATES = [
  {
    name: 'Welcome Greeting',
    type: 'TEXT',
    triggerText: 'hi',
    payload: {
      text: 'నమస్కారం! చౌటుప్పల్ యాప్ కి స్వాగతం. 🙏 మీకు ఏ సమాచారం కావాలో ఇక్కడ టైప్ చేయండి.',
    },
  },
  {
    name: '₹99 Story Banner Ad Pitch',
    type: 'BUTTON',
    triggerText: 'ad',
    payload: {
      text: '📢 మీ షాప్ ని వేలాదిమందికి చూపించండి! ₹99/రోజుకే చౌటుప్పల్ యాప్ టాప్ బ్యానర్ ఆడ్. 🎁',
      buttons: [{ title: 'Book Ad Now' }, { title: 'Call Support' }],
    },
  },
  {
    name: '₹299 Reels Promotion Pitch',
    type: 'BUTTON',
    triggerText: 'reel',
    payload: {
      text: '🎬 మీ బిజినెస్ రీల్ ని చౌటుప్పల్ యాప్ లో ప్రమోట్ చేయండి (₹299/3 రోజులు). రీల్ లింక్ ఇక్కడ పంపండి!',
      buttons: [{ title: 'Submit Reel Link' }],
    },
  },
]

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let templates = (await (async () => { try { return await prisma.whatsAppTemplate.findMany({
      orderBy: { createdAt: 'desc' },
    }); } catch(e) { return [] as any; } })())

    // If empty, auto-seed default templates
    if (templates.length === 0) {
      await prisma.whatsAppTemplate.createMany({
        data: DEFAULT_TEMPLATES,
      })

      templates = (await (async () => { try { return await prisma.whatsAppTemplate.findMany({
        orderBy: { createdAt: 'desc' },
      }); } catch(e) { return [] as any; } })())
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
    const { name, type, triggerText, payload } = body

    if (!name || !payload) {
      return NextResponse.json({ error: 'Template name and payload required' }, { status: 400 })
    }

    const template = await prisma.whatsAppTemplate.create({
      data: {
        name,
        type: type || 'TEXT',
        triggerText: triggerText ? triggerText.trim().toLowerCase() : null,
        payload,
      },
    })

    // Also sync trigger keyword if triggerText provided
    if (triggerText) {
      const cleanKw = triggerText.trim().toLowerCase()
      await prisma.triggerRule.upsert({
        where: { keyword: cleanKw },
        update: { templateId: template.id, replyText: typeof payload === 'object' ? payload.text : String(payload) },
        create: { keyword: cleanKw, templateId: template.id, replyText: typeof payload === 'object' ? payload.text : String(payload) },
      })
    }

    return NextResponse.json({ ok: true, template })
  } catch (err) {
    console.error('[CRM Templates POST API] Error:', err)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}
