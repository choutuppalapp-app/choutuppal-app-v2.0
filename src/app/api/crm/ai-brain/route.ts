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

    const promptRecord = await prisma.systemPrompt.findUnique({
      where: { key: 'whatsapp_ai_brain' },
    })

    return NextResponse.json({
      content: promptRecord?.content || '',
      updatedAt: promptRecord?.updatedAt || null,
    })
  } catch (err) {
    console.error('[CRM AI Brain GET API] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch AI Brain prompt' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content } = body

    if (typeof content !== 'string') {
      return NextResponse.json({ error: 'Invalid content format' }, { status: 400 })
    }

    const updated = await prisma.systemPrompt.upsert({
      where: { key: 'whatsapp_ai_brain' },
      update: { content },
      create: { key: 'whatsapp_ai_brain', content },
    })

    return NextResponse.json({ ok: true, prompt: updated })
  } catch (err) {
    console.error('[CRM AI Brain POST API] Error:', err)
    return NextResponse.json({ error: 'Failed to save AI Brain prompt' }, { status: 500 })
  }
}
