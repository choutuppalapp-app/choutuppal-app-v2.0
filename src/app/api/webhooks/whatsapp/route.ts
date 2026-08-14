import { NextRequest, NextResponse } from 'next/server'
import { getAIResponse } from '@/lib/ai-agent'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { prisma } from '@/lib/prisma'

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
 * POST /api/webhooks/whatsapp — Smart Rule-Based Auto-Replies & Auto Lead Capture
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Extract incoming message details from Meta payload structure
    const entry = body?.entry?.[0]
    const changes = entry?.changes?.[0]
    const value = changes?.value
    const message = value?.messages?.[0]
    const contact = value?.contacts?.[0]

    if (message && message.type === 'text') {
      const senderPhone = message.from
      const rawText = (message.text?.body || '').trim()
      const lowerText = rawText.toLowerCase()
      const senderName = contact?.profile?.name || 'WhatsApp Lead'

      if (senderPhone && rawText) {
        console.log(`[WhatsApp Webhook] Inbound from ${senderPhone} (${senderName}): "${rawText}"`)

        // 1. Auto Lead Capture & Tagging in Database
        let tag = 'General Inquiry'
        if (lowerText.includes('list') || lowerText.includes('business')) {
          tag = 'Business Owner'
        } else if (lowerText.includes('offer') || lowerText.includes('ad')) {
          tag = 'Lead'
        }

        try {
          const cleanPhone = senderPhone.replace(/\D/g, '')
          await prisma.whatsAppContact.upsert({
            where: { phone: cleanPhone },
            update: {
              name: senderName !== 'WhatsApp Lead' ? senderName : undefined,
              tag,
            },
            create: {
              name: senderName,
              phone: cleanPhone,
              source: 'inbound_whatsapp',
              tag,
            },
          })
          console.log(`[WhatsApp Lead Engine] Saved/Updated contact ${cleanPhone} tagged as "${tag}"`)
        } catch (dbErr) {
          console.error('[WhatsApp Lead Engine] DB contact capture error:', dbErr)
        }

        // 2. Rule-Based Smart Auto-Reply Engine
        if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('హలో') || lowerText.includes('నమస్తే')) {
          // Rule A: Greeting -> Interactive List Message
          await sendWhatsAppMessage(senderPhone, 'నమస్కారం! చౌటుప్పల్ యాప్ అసిస్టెంట్ కు స్వాగతం. క్రింది ఆప్షన్లలో ఒకదాన్ని ఎంచుకోండి:', {
            messageType: 'interactive_list',
            headerText: 'Choutuppal App Official Help Engine',
            footerText: 'choutuppal.in • Local Super App',
            listButtonTitle: 'ఆప్షన్లు ఎంచుకోండి',
            listSectionTitle: 'ముఖ్యమైన సేవలు',
            listOptions: [
              { id: 'opt_business', title: 'List my Business', description: 'మీ షాప్ లేదా సర్వీస్ ఉచితంగా ప్రచురించండి' },
              { id: 'opt_offers', title: "View Today's Offers", description: 'చౌటుప్పల్ లో ఈరోజు ప్రత్యేక ఆఫర్లు' },
              { id: 'opt_support', title: 'Talk to Support', description: 'మా కస్టమర్ సపోర్ట్ టీమ్ తో మాట్లాడండి' },
            ],
          })
        } else if (lowerText.includes('offer') || lowerText.includes('ad') || lowerText.includes('ఆఫర్')) {
          // Rule B: Offers / Banner Ads -> Interactive Buttons
          await sendWhatsAppMessage(
            senderPhone,
            'చౌటుప్పల్ యాప్ లో ₹99/రోజుకే మీ వ్యాపార ప్రకటనల బ్యానర్ ని వేలాదిమంది ప్రజలకు చూపించండి!',
            {
              messageType: 'interactive_button',
              buttonType: 'quick_reply',
              headerText: '₹99/Day Banner Ads Monetization',
              footerText: 'చౌటుప్పల్ యాప్ బ్రాండింగ్',
              buttons: [
                { id: 'btn_ad_99', title: 'Get ₹99/day Ad' },
                { id: 'btn_call', title: 'Call Support' },
              ],
            },
          )
        } else if (lowerText.includes('list') || lowerText.includes('business') || lowerText.includes('బిజినెస్')) {
          // Rule C: Business Listing -> Text message with onboarding link
          await sendWhatsAppMessage(
            senderPhone,
            'నమస్తే! మీ షాప్ లేదా వ్యాపారాన్ని చౌటుప్పల్ యాప్ లో లిస్ట్ చేయడం చాలా సులభం.\n\nక్రింది లింక్ ద్వారా లాగిన్ అయి మీ బిజినెస్ వివరాలు నమోదు చేయగలరు:\nhttps://choutuppal.in/dashboard',
          )
        } else {
          // Default: RAG AI Agent Intelligent Reply
          const aiReply = await getAIResponse(senderPhone, rawText)
          await sendWhatsAppMessage(senderPhone, aiReply)
        }
      }
    }

    // Always return HTTP 200 OK to Meta
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('[WhatsApp Webhook] POST error:', err)
    return NextResponse.json({ ok: true, error: 'Internal processing error' }, { status: 200 })
  }
}
