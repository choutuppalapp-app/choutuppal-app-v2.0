import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

export const runtime = 'nodejs'
export const revalidate = 3600

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { targetPhone } = body

    if (!targetPhone) {
      return NextResponse.json({ error: 'Target phone number is required' }, { status: 400 })
    }

    const cleanPhone = targetPhone.replace(/\D/g, '')
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
    }

    const success = await sendWhatsAppMessage(
      cleanPhone,
      '🎉 WhatsApp API Connection Test Successful! Choutuppal CRM is connected and active live.',
    )

    if (success) {
      return NextResponse.json({ ok: true, message: `Test message sent to ${cleanPhone}` })
    } else {
      return NextResponse.json(
        { error: 'Meta WhatsApp API returned an error. Please verify Access Token and Phone Number ID.' },
        { status: 400 },
      )
    }
  } catch (err) {
    console.error('[CRM Test WhatsApp API] Error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to test WhatsApp connection' },
      { status: 500 },
    )
  }
}
