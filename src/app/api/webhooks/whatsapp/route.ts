import { NextRequest, NextResponse } from 'next/server'
import { getAIResponse } from '@/lib/ai-agent'
import { sendWhatsAppMessage } from '@/lib/whatsapp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/webhooks/whatsapp — Meta Webhook Verification Handshake
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  const verifyToken =
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'choutuppal_verify_token'

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WhatsApp Webhook] Verification successful!')
    return new NextResponse(challenge || '', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  console.warn('[WhatsApp Webhook] Verification token mismatch.')
  return NextResponse.json({ error: 'Verification token mismatch' }, { status: 403 })
}

/**
 * POST /api/webhooks/whatsapp — Handle Incoming WhatsApp Messages & AI Reply
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract incoming message details from Meta payload structure
    const entry = body?.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const message = value?.messages?.[0]

    if (message && message.type === 'text') {
      const senderPhone = message.from
      const messageText = message.text?.body

      if (senderPhone && messageText) {
        console.log(`[WhatsApp Webhook] Message from ${senderPhone}: "${messageText}"`)

        // 1. Process message through AI Agent (with RAG database context)
        const aiReply = await getAIResponse(senderPhone, messageText)

        // 2. Send AI reply back via WhatsApp Cloud API
        await sendWhatsAppMessage(senderPhone, aiReply)
      }
    }

    // Always return HTTP 200 OK to Meta
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('[WhatsApp Webhook] POST error:', err)
    // Return HTTP 200 to prevent Meta from retrying broken Webhook requests endlessly
    return NextResponse.json({ ok: true, error: 'Internal processing error' }, { status: 200 })
  }
}
