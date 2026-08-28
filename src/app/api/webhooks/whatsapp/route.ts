import { safeDbQuery } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { getAIResponse } from '@/lib/ai-agent'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const revalidate = 3600

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
 * POST /api/webhooks/whatsapp — Human-like Smart Webhook & State Machine with Intent Logic
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
      let buttonId = ''
      if (message.type === 'text') {
        rawText = (message.text?.body || '').trim()
      } else if (message.type === 'interactive') {
        rawText = message.interactive?.button_reply?.title || message.interactive?.list_reply?.title || ''
        buttonId = message.interactive?.button_reply?.id || message.interactive?.list_reply?.id || ''
      }

      const lowerText = rawText.toLowerCase()

      if (senderPhone && rawText) {
        const cleanPhone = senderPhone.replace(/\D/g, '')
        console.log(`[WhatsApp Webhook] Inbound from ${cleanPhone}: "${rawText}"`)

        try {
          await prisma.whatsAppLog.create({
            data: {
              phone: cleanPhone,
              direction: 'inbound',
              message: rawText,
              status: 'received',
            },
          })
        } catch (logErr) {
          console.warn('[WhatsApp Webhook] Inbound log error:', logErr)
        }

        // Lookup Contact Record
        let dbContact = await prisma.whatsAppContact.findUnique({
          where: { phone: cleanPhone },
        })

        // ----------------------------------------------------------------------
        // STEP 2: New User Onboarding (Phone NOT in DB)
        // ----------------------------------------------------------------------
        if (!dbContact) {
          await prisma.whatsAppContact.create({
            data: {
              phone: cleanPhone,
              messageCount: 1,
              chatState: 'awaiting_name',
              source: 'inbound_whatsapp',
              tag: 'New Lead',
            },
          })

          await sendWhatsAppMessage(
            senderPhone,
            'నమస్కారం! చౌటుప్పల్ యాప్ కి స్వాగతం. 🙏 మీ పేరు ఏమిటి?',
          )
          return NextResponse.json({ ok: true }, { status: 200 })
        }

        // ----------------------------------------------------------------------
        // STEP 3: Name Capture (chatState === "awaiting_name")
        // ----------------------------------------------------------------------
        if (dbContact.chatState === 'awaiting_name') {
          const userName = rawText.trim()
          await prisma.whatsAppContact.update({
            where: { phone: cleanPhone },
            data: {
              name: userName,
              chatState: 'awaiting_type',
              messageCount: (dbContact.messageCount || 0) + 1,
            },
          })

          await sendWhatsAppMessage(
            senderPhone,
            `శుభోదయం ${userName} గారు! మీరు చౌటుప్పల్ లో ఏమి చేస్తున్నారు? మీకు సర్వీసెస్ కావాలా? లేదా మీరే ఏదైనా బిజినెస్/సర్వీస్ చేస్తున్నారా?`,
            {
              messageType: 'interactive_button',
              buttonType: 'quick_reply',
              headerText: 'Choutuppal App Community',
              footerText: 'choutuppal.in • Local Super App',
              buttons: [
                { id: 'btn_customer', title: 'కస్టమర్' },
                { id: 'btn_business_owner', title: 'బిజినెస్ ఓనర్' },
              ],
            },
          )
          return NextResponse.json({ ok: true }, { status: 200 })
        }

        // ----------------------------------------------------------------------
        // STEP 4: User Type & Listing Pitch (chatState === "awaiting_type")
        // ----------------------------------------------------------------------
        if (dbContact.chatState === 'awaiting_type') {
          const isBusinessOwner =
            buttonId === 'btn_business_owner' ||
            lowerText.includes('బిజినెస్') ||
            lowerText.includes('business') ||
            rawText.includes('2')

          if (isBusinessOwner) {
            await prisma.whatsAppContact.update({
              where: { phone: cleanPhone },
              data: {
                userType: 'business_owner',
                tag: 'Business Owner',
                chatState: 'none',
                messageCount: (dbContact.messageCount || 0) + 1,
              },
            })

            await sendWhatsAppMessage(
              senderPhone,
              'అద్భుతం! మీ బిజినెస్ ని మన వెబ్సైట్ లో ఉచితంగా లిస్ట్ చేయండి. రెడీ అయితే "LIST" అని టైప్ చేయండి, నేను లింక్ పంపుతాను.',
            )
          } else {
            await prisma.whatsAppContact.update({
              where: { phone: cleanPhone },
              data: {
                userType: 'customer',
                tag: 'Service Seeker',
                chatState: 'none',
                messageCount: (dbContact.messageCount || 0) + 1,
              },
            })

            await sendWhatsAppMessage(
              senderPhone,
              `ధన్యవాదాలు ${dbContact.name || ''} గారు! మీకు కావలసిన సమాచారం చెప్పండి, నేను సహాయం చేస్తాను.`,
            )
          }
          return NextResponse.json({ ok: true }, { status: 200 })
        }

        // Increment message count for general interaction
        const newCount = (dbContact.messageCount || 0) + 1
        await prisma.whatsAppContact.update({
          where: { phone: cleanPhone },
          data: { messageCount: newCount },
        })

        // ----------------------------------------------------------------------
        // INTENT A: Emergency & Government Officials Fetch (No AI Cost)
        // ----------------------------------------------------------------------
        const isEmergencyQuery =
          lowerText.includes('police') ||
          lowerText.includes('emergency') ||
          lowerText.includes('collector') ||
          lowerText.includes('mla') ||
          lowerText.includes('hospital number') ||
          lowerText.includes('fire') ||
          lowerText.includes('tahsildar') ||
          lowerText.includes('mpdo') ||
          lowerText.includes('rdo') ||
          lowerText.includes('sarpanch') ||
          lowerText.includes('పోలీస్') ||
          lowerText.includes('అత్యవసర') ||
          lowerText.includes('కలెక్టర్') ||
          lowerText.includes('ఎమ్మెల్యే')

        if (isEmergencyQuery) {
          // Extract search token keyword
          const searchKey = lowerText
            .replace(/police|emergency|collector|mla|hospital number|hospital|fire|tahsildar|mpdo|rdo|sarpanch|నంబర్|నెంబర్|ఫోన్/gi, '')
            .trim()

          const emergencyContacts = (await (async () => { try { return await prisma.whatsAppContact.findMany({
            where: {
              userType: 'emergency_govt_leader',
              ...(searchKey
                ? {
                    OR: [
                      { name: { contains: searchKey, mode: 'insensitive' } },
                      { tag: { contains: searchKey, mode: 'insensitive' } },
                    ],
                  }
                : {}),
            },
            take: 10,
          }); } catch(e) { return [] as any; } })())

          if (emergencyContacts.length > 0) {
            let emergencyReply = '🚨 *చౌటుప్పల్ అత్యవసర & ప్రభుత్వ ఫోన్ నంబర్లు:*\n\n'
            emergencyContacts.forEach((item, idx) => {
              emergencyReply += `${idx + 1}. *${item.name}*\n📱 Phone: +${item.phone}\n\n`
            })
            emergencyReply += 'మరిన్ని అత్యవసర నంబర్ల కోసం చౌటుప్పల్ యాప్ ని విజిట్ చేయండి: https://choutuppal.in'
            await sendWhatsAppMessage(senderPhone, emergencyReply)
            return NextResponse.json({ ok: true }, { status: 200 })
          }
        }

        // ----------------------------------------------------------------------
        // INTENT B: Business Info & Shop Details Fetch (No AI Cost)
        // ----------------------------------------------------------------------
        const isBusinessQuery =
          lowerText.includes('phone number of') ||
          lowerText.includes('address of') ||
          lowerText.includes('mobile number of') ||
          lowerText.includes('shop name') ||
          lowerText.includes('contact of') ||
          lowerText.includes('number of') ||
          lowerText.includes('details of') ||
          lowerText.includes('షాప్ నంబర్') ||
          lowerText.includes('ఫోన్ నంబర్')

        if (isBusinessQuery) {
          // Extract business keyword from query
          const bizKeyword = rawText
            .replace(/phone number of|address of|mobile number of|shop name|contact of|number of|details of|షాప్ నంబర్|ఫోన్ నంబర్|నంబర్|నెంబర్/gi, '')
            .trim()

          if (bizKeyword) {
            const listings = (await (async () => { try { return await prisma.listing.findMany({
              where: {
                title: { contains: bizKeyword, mode: 'insensitive' },
              },
              select: {
                title: true,
                phone: true,
                address: true,
                category: { select: { name: true } },
              },
              take: 5,
            }); } catch(e) { return [] as any; } })())

            if (listings.length > 0) {
              let bizReply = `🏪 *చౌటుప్పల్ బిజినెస్ వివరాలు ("${bizKeyword}"):*\n\n`
              listings.forEach((item, idx) => {
                bizReply += `${idx + 1}. *${item.title}* (${item.category?.name || 'Local Business'})\n`
                if (item.phone) bizReply += `📱 Phone: ${item.phone}\n`
                if (item.address) bizReply += `📍 Address: ${item.address}\n`
                bizReply += '\n'
              })
              bizReply += 'మరిన్ని వ్యాపారాల కోసం చూడండి: https://choutuppal.in/listings'
              await sendWhatsAppMessage(senderPhone, bizReply)
              return NextResponse.json({ ok: true }, { status: 200 })
            }
          }
        }

        // ----------------------------------------------------------------------
        // STEP 5.5: Exact-Match Trigger Rules & Saved Templates (No AI Cost)
        // ----------------------------------------------------------------------
        const exactRule = await prisma.triggerRule.findFirst({
          where: { keyword: { equals: lowerText, mode: 'insensitive' } },
        })

        if (exactRule) {
          let triggerMsg = exactRule.replyText
          if (exactRule.templateId) {
            const linkedTpl = await prisma.whatsAppTemplate.findUnique({
              where: { id: exactRule.templateId },
            })
            if (linkedTpl?.payload) {
              triggerMsg = typeof linkedTpl.payload === 'object' && (linkedTpl.payload as any).text
                ? (linkedTpl.payload as any).text
                : String(linkedTpl.payload)
            }
          }
          if (triggerMsg) {
            await sendWhatsAppMessage(senderPhone, triggerMsg)
            return NextResponse.json({ ok: true }, { status: 200 })
          }
        }

        const tplTrigger = await prisma.whatsAppTemplate.findFirst({
          where: { triggerText: { equals: lowerText, mode: 'insensitive' } },
        })

        if (tplTrigger?.payload) {
          const tplMsg = typeof tplTrigger.payload === 'object' && (tplTrigger.payload as any).text
            ? (tplTrigger.payload as any).text
            : String(tplTrigger.payload)
          if (tplMsg) {
            await sendWhatsAppMessage(senderPhone, tplMsg)
            return NextResponse.json({ ok: true }, { status: 200 })
          }
        }

        // ----------------------------------------------------------------------
        // STEP 6: Action Keywords (Fast Reply - No AI Cost)
        // ----------------------------------------------------------------------
        if (lowerText.includes('list') || rawText.includes('లిస్ట్') || buttonId === 'btn_list') {
          await sendWhatsAppMessage(
            senderPhone,
            'నమస్తే! మీ షాప్ లేదా వ్యాపారాన్ని చౌటుప్పల్ యాప్ లో ఉచితంగా లిస్ట్ చేయడానికి క్రింది లింక్ పై క్లిక్ చేయండి:\n\nhttps://choutuppal.in/dashboard',
          )
          return NextResponse.json({ ok: true }, { status: 200 })
        }

        if (lowerText.includes('news') || rawText.includes('న్యూస్') || rawText.includes('వార్త')) {
          const latestNews = (await (async () => { try { return await prisma.news.findMany({
            where: { isPublished: true },
            orderBy: { createdAt: 'desc' },
            take: 3,
            select: { title: true, summary: true, slug: true },
          }); } catch(e) { return [] as any; } })())

          if (latestNews.length > 0) {
            let newsMsg = '📰 చౌటుప్పల్ తాజా వార్తలు:\n\n'
            latestNews.forEach((n, i) => {
              newsMsg += `${i + 1}. ${n.title}\n`
              if (n.summary) newsMsg += `${n.summary.slice(0, 100)}…\n`
              newsMsg += '\n'
            })
            newsMsg += 'మరిన్ని వార్తల కోసం: https://choutuppal.in/news'
            await sendWhatsAppMessage(senderPhone, newsMsg)
          } else {
            await sendWhatsAppMessage(
              senderPhone,
              'చౌటుప్పల్ తాజా వార్తల కోసం మన వెబ్సైట్ https://choutuppal.in/news ని చూడగలరు.',
            )
          }
          return NextResponse.json({ ok: true }, { status: 200 })
        }

        // ----------------------------------------------------------------------
        // INTENT C: General Queries (Gemini AI Agent with Personalization)
        // ----------------------------------------------------------------------
        const aiReply = await getAIResponse(senderPhone, rawText, dbContact.name || undefined)
        await sendWhatsAppMessage(senderPhone, aiReply)
      }
    }

    // Always return HTTP 200 OK to Meta
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (err) {
    console.error('[WhatsApp Webhook] POST error:', err)
    return NextResponse.json({ ok: true, error: 'Internal processing error' }, { status: 200 })
  }
}
