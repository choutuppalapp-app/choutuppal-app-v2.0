import { safeDbQuery } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phone } = await params
    const cleanPhone = phone.replace(/\D/g, '')

    const logs = (await (async () => { try { return await prisma.whatsAppLog.findMany({
      where: { phone: cleanPhone },
      orderBy: { createdAt: 'asc' },
      take: 200,
    }); } catch(e) { return [] as any; } })())

    const contact = await prisma.whatsAppContact.findUnique({
      where: { phone: cleanPhone },
    })

    return NextResponse.json({ logs, contact })
  } catch (err) {
    console.error('[CRM Messages GET API] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ phone: string }> },
) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { phone } = await params
    const cleanPhone = phone.replace(/\D/g, '')
    const body = await request.json()

    const { text, options } = body
    if (!text && !options) {
      return NextResponse.json({ error: 'Message content is required' }, { status: 400 })
    }

    const res = await sendWhatsAppMessage(cleanPhone, text || '', options || {})

    if (!res.ok) {
      return NextResponse.json({ error: res.error || 'Failed to send WhatsApp message' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, data: res.data })
  } catch (err) {
    console.error('[CRM Messages POST API] Error:', err)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
