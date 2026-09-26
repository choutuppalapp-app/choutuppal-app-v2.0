import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { getWhatsAppCredentials } from '@/lib/whatsapp'
import { routeWhatsAppMessage, WhatsAppInboundEvent } from '@/lib/whatsapp/router'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Verify Meta X-Hub-Signature-256
 */
function verifyMetaSignature(rawBody: string, signatureHeader: string | null, appSecret: string): boolean {
  if (!signatureHeader) {
    console.log('[WhatsApp Webhook] No X-Hub-Signature-256 header provided; skipping signature check.')
    return true
  }
  if (!appSecret) {
    console.log('[WhatsApp Webhook] WHATSAPP_APP_SECRET not set; skipping signature check.')
    return true
  }

  try {
    const parts = signatureHeader.split('=')
    if (parts.length !== 2 || parts[0] !== 'sha256') {
      console.warn('[WhatsApp Webhook] Signature header format invalid:', signatureHeader)
      return false
    }
    const expectedSignature = parts[1]

    const hmac = crypto.createHmac('sha256', appSecret)
    hmac.update(rawBody, 'utf8')
    const calculatedSignature = hmac.digest('hex')

    const isValid = crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'hex'),
      Buffer.from(calculatedSignature, 'hex'),
    )

    console.log(`[WhatsApp Webhook] Signature verification result: ${isValid ? 'PASSED ✅' : 'FAILED ❌'}`)
    return isValid
  } catch (err) {
    console.error('[WhatsApp Webhook] Signature verification exception:', err)
    return false
  }
}

/**
 * GET /api/webhooks/whatsapp — Meta Webhook Verification Handshake
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  console.log('[WhatsApp Webhook] GET Verification Request received:', { mode, token, challenge })

  const creds = await getWhatsAppCredentials().catch((e) => {
    console.warn('[WhatsApp Webhook] getWhatsAppCredentials error in GET:', e)
    return null
  })

  const verifyToken =
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
    process.env.WHATSAPP_VERIFY_TOKEN ||
    creds?.verifyToken ||
    'choutuppal_verify_token'

  console.log('[WhatsApp Webhook] Expected verifyToken:', verifyToken, '| Received token:', token)

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[WhatsApp Webhook] Verification SUCCESS! Returning challenge token.')
    return new NextResponse(challenge || '', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    })
  }

  console.warn('[WhatsApp Webhook] Verification token MISMATCH. Provided:', token, 'Expected:', verifyToken)
  return NextResponse.json({ error: 'Verification token mismatch' }, { status: 403 })
}

/**
 * POST /api/webhooks/whatsapp — Inbound Message Receiver & State Machine Dispatcher
 */
export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 8)
  const timestamp = new Date().toISOString()
  console.log(`\n================== [WhatsApp Webhook POST #${requestId} @ ${timestamp}] START ==================`)

  try {
    const rawBody = await request.text()
    const signature = request.headers.get('x-hub-signature-256')
    const appSecret = (process.env.WHATSAPP_APP_SECRET || '').trim()

    // --------------------------------------------------------------------------
    // DEBUG LOGS BEFORE VALIDATION BEGINS: Raw Body & X-Hub-Signature-256 Header
    // --------------------------------------------------------------------------
    console.log(`\n------------------ [DEBUG WA WEBHOOK INCOMING PAYLOAD] ------------------`)
    console.log(`[DEBUG WA WEBHOOK] X-Hub-Signature-256 (exact string): "${signature ?? ''}"`)
    console.log(`[DEBUG WA WEBHOOK] Content-Type: "${request.headers.get('content-type') ?? ''}"`)
    console.log(`[DEBUG WA WEBHOOK] App Secret Configured: ${appSecret ? 'YES (' + appSecret.length + ' chars)' : 'NO'}`)
    console.log(`[DEBUG WA WEBHOOK] req.body (raw string, ${rawBody.length} bytes):\n${rawBody}`)

    let parsedBodyObject: any = null
    try {
      parsedBodyObject = JSON.parse(rawBody || '{}')
      console.log(`[DEBUG WA WEBHOOK] req.body (parsed JSON object):`, JSON.stringify(parsedBodyObject, null, 2))
    } catch (parseErr) {
      console.error(`[DEBUG WA WEBHOOK] JSON parse error:`, parseErr)
    }
    console.log(`------------------------------------------------------------------------\n`)

    // 1. Signature Verification
    if (appSecret && signature) {
      console.log(`[WhatsApp Webhook #${requestId}] Validating X-Hub-Signature-256 against WHATSAPP_APP_SECRET...`)
      const isValid = verifyMetaSignature(rawBody, signature, appSecret)
      if (!isValid) {
        console.warn(`[WhatsApp Webhook #${requestId}] ❌ Invalid signature rejected! Signature: "${signature}"`)
        return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 })
      }
      console.log(`[WhatsApp Webhook #${requestId}] Signature Validation PASSED ✅`)
    } else {
      console.log(`[WhatsApp Webhook #${requestId}] Signature check skipped (appSecret=${Boolean(appSecret)}, signature=${Boolean(signature)})`)
    }

    const payload = parsedBodyObject || {}

    // 2. Extract incoming message details from Meta structure
    const entry = payload?.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const message = value?.messages?.[0]
    const contact = value?.contacts?.[0]
    const senderName = contact?.profile?.name || undefined
    const statuses = value?.statuses?.[0]

    // Handle delivery status updates (sent, delivered, read, failed)
    if (statuses) {
      console.log(`[WhatsApp Webhook #${requestId}] Received status update:`, {
        recipient_id: statuses.recipient_id,
        status: statuses.status,
        id: statuses.id,
        errors: statuses.errors,
      })
      return NextResponse.json({ ok: true, statusHandled: true }, { status: 200 })
    }

    if (!message) {
      console.log(`[WhatsApp Webhook #${requestId}] No message in payload (possibly status update or ping). Full payload:`, JSON.stringify(payload, null, 2).slice(0, 500))
      return NextResponse.json({ ok: true, note: 'No incoming message to process' }, { status: 200 })
    }

    const senderPhone = message.from
    let text = ''
    let interactiveId = ''
    let interactiveType: 'button_reply' | 'list_reply' | undefined

    console.log(`[WhatsApp Webhook #${requestId}] Inbound Message Type: "${message.type}" from "${senderPhone}" (Sender: "${senderName || 'Unknown'}")`)

    if (message.type === 'text') {
      text = (message.text?.body || '').trim()
    } else if (message.type === 'interactive') {
      if (message.interactive?.type === 'button_reply') {
        interactiveType = 'button_reply'
        text = message.interactive?.button_reply?.title || ''
        interactiveId = message.interactive?.button_reply?.id || ''
      } else if (message.interactive?.type === 'list_reply') {
        interactiveType = 'list_reply'
        text = message.interactive?.list_reply?.title || ''
        interactiveId = message.interactive?.list_reply?.id || ''
      }
    } else if (message.type === 'button') {
      text = message.button?.text || ''
      interactiveId = message.button?.payload || ''
    }

    console.log(`[WhatsApp Webhook #${requestId}] Extracted Content: Text="${text}", ActionID="${interactiveId}", InteractiveType="${interactiveType || 'none'}"`)

    if (senderPhone && (text || interactiveId)) {
      const cleanPhone = senderPhone.replace(/\D/g, '')

      // 3. Log inbound message in WhatsAppLog (safely caught)
      try {
        await prisma.whatsAppLog.create({
          data: {
            phone: cleanPhone,
            direction: 'inbound',
            message: text || `[Interactive: ${interactiveId}]`,
            status: 'received',
          },
        })
        console.log(`[WhatsApp Webhook #${requestId}] Inbound message logged to database ✅`)
      } catch (logErr: any) {
        console.warn(`[WhatsApp Webhook #${requestId}] Warning logging to whatsAppLog (table may not exist yet, continuing):`, logErr?.message || logErr)
      }

      // 4. Dispatch to WhatsApp Chatbot State Router
      const event: WhatsAppInboundEvent = {
        phone: cleanPhone,
        text,
        interactiveId,
        interactiveType,
        senderName,
        rawMessage: message,
      }

      console.log(`[WhatsApp Webhook #${requestId}] Dispatching to routeWhatsAppMessage()...`)
      await routeWhatsAppMessage(event)
      console.log(`[WhatsApp Webhook #${requestId}] routeWhatsAppMessage completed ✅`)
    } else {
      console.warn(`[WhatsApp Webhook #${requestId}] Message lacked text or interactiveId. Message object:`, JSON.stringify(message))
    }

    console.log(`================== [WhatsApp Webhook POST #${requestId}] END ==================\n`)
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err: any) {
    console.error(`[WhatsApp Webhook #${requestId}] CRITICAL ERROR in POST:`, err)
    return NextResponse.json({ ok: true, error: err?.message || 'Processing error' }, { status: 200 })
  }
}
