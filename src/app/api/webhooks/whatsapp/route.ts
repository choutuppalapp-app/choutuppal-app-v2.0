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

    if (message && (message.type === 'text' || message.type === 'interactive')) {
      const senderPhone = message.from
      let rawText = ''
      if (message.type === 'text') {
        rawText = (message.text?.body || '').trim()
      } else if (message.type === 'interactive') {
        rawText = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || ''
      }

      const lowerText = rawText.toLowerCase()
      const senderName = contact?.profile?.name || 'WhatsApp Lead'

      if (senderPhone && rawText) {
        console.log(`[WhatsApp Webhook] Inbound from ${senderPhone} (${senderName}): "${rawText}"`)

        // 1. Auto Lead Capture & Tagging in Database
        let tag = 'General Inquiry'
        if (rawText.includes('వైట్-లేబుల్') || rawText.includes('ఫ్రాంచైజీ') || lowerText.includes('franchise')) {
          tag = 'Franchise Lead'
        } else if (rawText.includes('న్యూస్') || rawText.includes('వార్త') || lowerText.includes('news')) {
          tag = 'News Lead'
        } else if (lowerText.includes('list') || lowerText.includes('business') || rawText.includes('బిజినెస్')) {
          tag = 'Business Owner'
        } else if (lowerText.includes('offer') || lowerText.includes('ad')) {
          tag = 'Ad Lead'
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
        if (rawText.includes('చౌటుప్పల్ యాప్ గురించి సమాచారం') || (lowerText.includes('సమాచారం') && lowerText.includes('కావాలి'))) {
          // Floating Button CTA Auto-Reply
          await sendWhatsAppMessage(
            senderPhone,
            'నమస్కారం! చౌటుప్పల్ యాప్ కి స్వాగతం. మీకు ఏ సమాచారం కావాలి?',
            {
              messageType: 'interactive_button',
              buttonType: 'quick_reply',
              headerText: 'Choutuppal App Official',
              footerText: 'choutuppal.in • Local Super App',
              buttons: [
                { id: 'btn_list', title: 'బిజినెస్ లిస్ట్ చేయడం' },
                { id: 'btn_news', title: 'న్యూస్ అందించడం' },
                { id: 'btn_franchise', title: 'ఫ్రాంచైజీ' },
              ],
            },
          )
        } else if (rawText.includes('లోకల్ న్యూస్/ఈవెంట్') || rawText.includes('న్యూస్ అందించడం')) {
          // News CTA Auto-Reply
          await sendWhatsAppMessage(
            senderPhone,
            'మీరు షేర్ చేయదలచిన న్యూస్/ఈవెంట్ వివరాలను దయచేసి ఇక్కడ టైప్ చేయండి లేదా ఫొటో పంపండి.',
          )
        } else if (rawText.includes('వైట్-లేబుల్ సూపర్ యాప్') || rawText.includes('ఫ్రాంచైజీ')) {
          // Franchise CTA Auto-Reply
          await sendWhatsAppMessage(
            senderPhone,
            'మీ ఊరి కోసం యాప్ సెటప్ చేయడానికి మా టీమ్ మీతో వెంటనే కనెక్ట్ అవుతుంది. దయచేసి మీ ఊరి పేరు తెలియజేయండి.',
          )
        } else if (lowerText.includes('hi') || lowerText.includes('hello') || rawText.includes('హలో') || rawText.includes('నమస్తే')) {
          // Greeting -> Interactive List Message
          await sendWhatsAppMessage(senderPhone, 'నమస్కారం! చౌటుప్పల్ యాప్ అసిస్టెంట్ కు స్వాగతం. క్రింది ఆప్షన్లలో ఒకదాన్ని ఎంచుకోండి:', {
            messageType: 'interactive_list',
            headerText: 'Choutuppal App Help Engine',
            footerText: 'choutuppal.in • Local Super App',
            listButtonTitle: 'ఆప్షన్లు ఎంచుకోండి',
            listSectionTitle: 'ముఖ్యమైన సేవలు',
            listOptions: [
              { id: 'opt_business', title: 'List my Business', description: 'మీ షాప్ లేదా సర్వీస్ ఉచితంగా ప్రచురించండి' },
              { id: 'opt_offers', title: "View Today's Offers", description: 'చౌటుప్పల్ లో ఈరోజు ప్రత్యేక ఆఫర్లు' },
              { id: 'opt_support', title: 'Talk to Support', description: 'మా కస్టమర్ సపోర్ట్ టీమ్ తో మాట్లాడండి' },
            ],
          })
        } else if (lowerText.includes('offer') || lowerText.includes('ad') || rawText.includes('ఆఫర్')) {
          // Banner Ads / Offers
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
        } else if (lowerText.includes('list') || lowerText.includes('business') || rawText.includes('బిజినెస్ లిస్ట్ చేయడం') || rawText.includes('బిజినెస్')) {
          // Business Listing
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
