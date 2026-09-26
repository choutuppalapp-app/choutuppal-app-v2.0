import { prisma, safeDbQuery } from '@/lib/prisma'
import { sendWhatsAppMessage, getWhatsAppCredentials } from '@/lib/whatsapp'
import {
  getOfflineNews,
  getOfflineListings,
  getOfflineRealEstates,
  STANDARD_CATEGORIES,
} from '@/lib/offline-data'

export interface WhatsAppInboundEvent {
  phone: string
  text: string
  interactiveId?: string
  interactiveType?: 'button_reply' | 'list_reply'
  senderName?: string
  rawMessage?: any
}

export type WhatsAppChatState =
  | 'NEW_USER'
  | 'MAIN_MENU'
  | 'NEWS'
  | 'SERVICES'
  | 'REAL_ESTATE'
  | 'ADD_LISTING'
  | 'AWAITING_INPUT'

/**
 * Send an Interactive List Message directly via Meta WhatsApp Cloud API fetch request
 */
export async function sendWhatsAppInteractiveList(
  to: string,
  params: {
    header?: string
    body: string
    footer?: string
    buttonText: string
    sections: Array<{
      title: string
      rows: Array<{ id: string; title: string; description?: string }>
    }>
  },
): Promise<{ ok: boolean; data?: any; error?: string }> {
  const cleanPhone = to.replace(/\D/g, '')
  console.log(`[WhatsApp Router] Attempting to send Interactive List to ${cleanPhone}...`)

  try {
    const creds = await getWhatsAppCredentials()
    const { token, phoneNumberId } = creds

    console.log('[WhatsApp Router] Credentials Status:', {
      hasToken: Boolean(token),
      tokenPrefix: token ? `${token.substring(0, 10)}...` : 'NONE',
      phoneNumberId: phoneNumberId || 'NONE',
      verifyToken: creds.verifyToken || 'NONE',
    })

    if (!token || !phoneNumberId) {
      const errMsg = `[WhatsApp Cloud API] Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID credentials! (Token: ${Boolean(token)}, PhoneNumberId: ${Boolean(phoneNumberId)})`
      console.error(errMsg)
      return { ok: false, error: errMsg }
    }

    const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`

    const payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'interactive',
      interactive: {
        type: 'list',
        header: params.header ? { type: 'text', text: params.header.slice(0, 60) } : undefined,
        body: { text: params.body },
        footer: params.footer ? { text: params.footer.slice(0, 60) } : undefined,
        action: {
          button: params.buttonText.slice(0, 20),
          sections: params.sections.map((sec) => ({
            title: sec.title.slice(0, 24),
            rows: sec.rows.slice(0, 10).map((r) => ({
              id: r.id.slice(0, 200),
              title: r.title.slice(0, 24),
              description: r.description ? r.description.slice(0, 72) : undefined,
            })),
          })),
        },
      },
    }

    console.log(`[WhatsApp Router] Dispatching fetch to ${url}`)
    console.log(`[WhatsApp Router] Payload preview:`, JSON.stringify(payload, null, 2).slice(0, 400))

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    console.log(`[WhatsApp Router] Meta API Response Status: HTTP ${res.status}`)
    console.log(`[WhatsApp Router] Meta API Response Body:`, JSON.stringify(data, null, 2))

    if (!res.ok) {
      console.error('[WhatsApp Cloud API] Meta API Error Details:', {
        httpStatus: res.status,
        metaError: data?.error,
        message: data?.error?.message,
        code: data?.error?.code,
        fbtrace_id: data?.error?.fbtrace_id,
      })

      // Fallback to plain text if list is rejected
      console.log('[WhatsApp Router] Falling back to plain text reply due to List API rejection...')
      let fallbackText = `${params.header ? `*${params.header}*\n\n` : ''}${params.body}\n\n`
      params.sections.forEach((sec) => {
        sec.rows.forEach((r, idx) => {
          fallbackText += `${idx + 1}. ${r.title}${r.description ? ` - ${r.description}` : ''}\n`
        })
      })
      if (params.footer) fallbackText += `\n_${params.footer}_`

      return await sendWhatsAppTextMessage(cleanPhone, fallbackText)
    }

    // Log outbound message safely
    try {
      await prisma.whatsAppLog.create({
        data: {
          phone: cleanPhone,
          direction: 'outbound',
          message: `[Interactive List] ${params.body.slice(0, 150)}`,
          status: 'sent',
        },
      })
    } catch (logErr: any) {
      console.warn('[WhatsApp Router] Outbound log warning (table may not exist, continuing):', logErr?.message || logErr)
    }

    return { ok: true, data }
  } catch (err: any) {
    console.error('[WhatsApp Cloud API] Exception in sendWhatsAppInteractiveList:', err)
    return { ok: false, error: err?.message || 'Failed to send list message' }
  }
}

/**
 * Send Quick Reply Buttons via WhatsApp Cloud API
 */
export async function sendWhatsAppQuickReplyButtons(
  to: string,
  params: {
    header?: string
    body: string
    footer?: string
    buttons: Array<{ id: string; title: string }>
  },
): Promise<{ ok: boolean; data?: any; error?: string }> {
  return sendWhatsAppMessage(to, params.body, {
    messageType: 'interactive_button',
    buttonType: 'quick_reply',
    headerText: params.header,
    footerText: params.footer,
    buttons: params.buttons,
  })
}

/**
 * Send Plain Text WhatsApp message
 */
export async function sendWhatsAppTextMessage(
  to: string,
  text: string,
): Promise<{ ok: boolean; data?: any; error?: string }> {
  return sendWhatsAppMessage(to, text)
}

/**
 * Retrieve or Initialize WhatsApp User & Session
 */
async function getOrCreateSession(phone: string, senderName?: string) {
  const cleanPhone = phone.replace(/\D/g, '')
  console.log(`[WhatsApp Router] Resolving session for phone: ${cleanPhone}...`)

  let session: any = null
  let user: any = null

  try {
    session = await safeDbQuery(
      () => prisma.whatsAppSession.findUnique({ where: { phone: cleanPhone } }),
      null,
    )
  } catch (err: any) {
    console.error('[WhatsApp Router] Error querying whatsAppSession:', err?.message || err)
  }

  try {
    user = await safeDbQuery(
      () => prisma.whatsAppUser.findUnique({ where: { phone: cleanPhone } }),
      null,
    )
  } catch (err: any) {
    console.error('[WhatsApp Router] Error querying whatsAppUser:', err?.message || err)
  }

  const isNew = !session || !user

  if (!user) {
    console.log(`[WhatsApp Router] Creating new WhatsAppUser for ${cleanPhone}`)
    user = await safeDbQuery(
      () =>
        prisma.whatsAppUser.create({
          data: {
            phone: cleanPhone,
            name: senderName || null,
            language: 'te',
            role: 'USER',
          },
        }),
      { id: `wa-user-${cleanPhone}`, phone: cleanPhone, name: senderName || null, language: 'te', role: 'USER' } as any,
    )
  }

  if (!session) {
    console.log(`[WhatsApp Router] Creating new WhatsAppSession (State: NEW_USER) for ${cleanPhone}`)
    session = await safeDbQuery(
      () =>
        prisma.whatsAppSession.create({
          data: {
            phone: cleanPhone,
            state: 'NEW_USER',
            context: {},
            lastActiveAt: new Date(),
          },
        }),
      { id: `wa-sess-${cleanPhone}`, phone: cleanPhone, state: 'NEW_USER', context: {}, lastActiveAt: new Date() } as any,
    )
  } else {
    try {
      await prisma.whatsAppSession.update({
        where: { phone: cleanPhone },
        data: { lastActiveAt: new Date() },
      })
    } catch (updateErr: any) {
      console.warn('[WhatsApp Router] Non-fatal session update warning:', updateErr?.message || updateErr)
    }
  }

  console.log(`[WhatsApp Router] Session resolved: Phone=${cleanPhone}, State=${session?.state}, isNew=${isNew}`)
  return { session, user, isNew }
}

/**
 * Update Session State & Context
 */
async function updateSessionState(phone: string, state: WhatsAppChatState, context: Record<string, any> = {}) {
  const cleanPhone = phone.replace(/\D/g, '')
  console.log(`[WhatsApp Router] Updating session state for ${cleanPhone} -> ${state}`)
  try {
    await prisma.whatsAppSession.upsert({
      where: { phone: cleanPhone },
      update: { state, context, lastActiveAt: new Date() },
      create: { phone: cleanPhone, state, context, lastActiveAt: new Date() },
    })
  } catch (err: any) {
    console.warn('[WhatsApp Router] Non-fatal session state upsert warning:', err?.message || err)
  }
}

/**
 * Main State Machine Router (Phases 1 & 2)
 */
export async function routeWhatsAppMessage(event: WhatsAppInboundEvent): Promise<void> {
  const { phone, text, interactiveId, senderName } = event
  const cleanPhone = phone.replace(/\D/g, '')
  const rawInput = (text || '').trim()
  const lowerInput = rawInput.toLowerCase()
  const actionId = interactiveId || ''

  console.log(`[WhatsApp Router] === Routing Inbound Message ===`)
  console.log(`[WhatsApp Router] Phone: ${cleanPhone} | Input: "${rawInput}" | ActionID: "${actionId}" | SenderName: "${senderName || ''}"`)

  const { session, user } = await getOrCreateSession(cleanPhone, senderName)
  const currentState = (session?.state || 'NEW_USER') as WhatsAppChatState
  console.log(`[WhatsApp Router] Active State: "${currentState}"`)

  // --------------------------------------------------------------------------
  // Global Intercepts (Keywords that can break out from any state)
  // --------------------------------------------------------------------------
  const isGreetingOrReset =
    lowerInput === 'hi' ||
    lowerInput === 'hello' ||
    lowerInput === 'start' ||
    lowerInput === 'menu' ||
    lowerInput === 'home' ||
    lowerInput === 'నమస్కారం' ||
    lowerInput === 'హలో' ||
    lowerInput === '0' ||
    actionId === 'menu_home' ||
    actionId === 'btn_menu'

  if (isGreetingOrReset) {
    console.log(`[WhatsApp Router] Triggered Greeting / Reset handler for ${cleanPhone}`)
    await handleMainMenu(cleanPhone, user?.name || senderName)
    await updateSessionState(cleanPhone, 'MAIN_MENU')
    return
  }

  if (lowerInput === 'news' || lowerInput === 'వార్తలు' || actionId === 'menu_news') {
    console.log(`[WhatsApp Router] Triggered News handler for ${cleanPhone}`)
    await handleNews(cleanPhone)
    await updateSessionState(cleanPhone, 'NEWS')
    return
  }

  if (
    lowerInput === 'services' ||
    lowerInput === 'shops' ||
    lowerInput === 'వ్యాపారాలు' ||
    lowerInput === 'సేవలు' ||
    actionId === 'menu_services'
  ) {
    console.log(`[WhatsApp Router] Triggered Services handler for ${cleanPhone}`)
    await handleServicesMenu(cleanPhone)
    await updateSessionState(cleanPhone, 'SERVICES')
    return
  }

  if (
    lowerInput === 'real estate' ||
    lowerInput === 'plots' ||
    lowerInput === 'ప్లాట్లు' ||
    actionId === 'menu_real_estate'
  ) {
    console.log(`[WhatsApp Router] Triggered Real Estate handler for ${cleanPhone}`)
    await handleRealEstate(cleanPhone)
    await updateSessionState(cleanPhone, 'REAL_ESTATE')
    return
  }

  if (
    lowerInput === 'list' ||
    lowerInput === 'add listing' ||
    lowerInput === 'add shop' ||
    actionId === 'menu_add_listing'
  ) {
    console.log(`[WhatsApp Router] Triggered Add Listing handler for ${cleanPhone}`)
    await handleAddListing(cleanPhone)
    await updateSessionState(cleanPhone, 'ADD_LISTING')
    return
  }

  if (
    lowerInput === 'help' ||
    lowerInput === 'support' ||
    lowerInput === 'admin' ||
    actionId === 'menu_support'
  ) {
    console.log(`[WhatsApp Router] Triggered Support handler for ${cleanPhone}`)
    await handleSupport(cleanPhone)
    return
  }

  // --------------------------------------------------------------------------
  // State Machine Switch-Case Dispatcher
  // --------------------------------------------------------------------------
  console.log(`[WhatsApp Router] Dispatching state switch: "${currentState}"`)
  switch (currentState) {
    case 'NEW_USER': {
      await handleNewUser(cleanPhone, senderName)
      await updateSessionState(cleanPhone, 'MAIN_MENU')
      break
    }

    case 'MAIN_MENU': {
      if (actionId === 'menu_news' || lowerInput === '1') {
        await handleNews(cleanPhone)
        await updateSessionState(cleanPhone, 'NEWS')
      } else if (actionId === 'menu_services' || lowerInput === '2') {
        await handleServicesMenu(cleanPhone)
        await updateSessionState(cleanPhone, 'SERVICES')
      } else if (actionId === 'menu_real_estate' || lowerInput === '3') {
        await handleRealEstate(cleanPhone)
        await updateSessionState(cleanPhone, 'REAL_ESTATE')
      } else if (actionId === 'menu_add_listing' || lowerInput === '4') {
        await handleAddListing(cleanPhone)
        await updateSessionState(cleanPhone, 'ADD_LISTING')
      } else if (actionId === 'menu_support' || lowerInput === '5') {
        await handleSupport(cleanPhone)
      } else {
        // Default to main menu
        await handleMainMenu(cleanPhone, user?.name || senderName)
      }
      break
    }

    case 'NEWS': {
      if (actionId.startsWith('news_') || lowerInput) {
        await handleNewsDetails(cleanPhone, actionId, rawInput)
      } else {
        await handleNews(cleanPhone)
      }
      break
    }

    case 'SERVICES': {
      if (actionId.startsWith('cat_')) {
        const categorySlug = actionId.replace('cat_', '')
        await handleCategoryListings(cleanPhone, categorySlug)
      } else if (rawInput.length > 2) {
        await handleSearchServices(cleanPhone, rawInput)
      } else {
        await handleServicesMenu(cleanPhone)
      }
      break
    }

    case 'REAL_ESTATE': {
      await handleRealEstate(cleanPhone)
      break
    }

    case 'ADD_LISTING': {
      await handleAddListing(cleanPhone)
      break
    }

    default: {
      await handleMainMenu(cleanPhone, user?.name || senderName)
      await updateSessionState(cleanPhone, 'MAIN_MENU')
      break
    }
  }
}

// ----------------------------------------------------------------------------
// Handlers for Specific States & Interactive Messages
// ----------------------------------------------------------------------------

/**
 * 1. NEW_USER: Welcome Flow
 */
async function handleNewUser(phone: string, senderName?: string) {
  const greeting = senderName ? `నమస్కారం ${senderName} గారు! 🙏` : 'నమస్కారం! 🙏'

  const welcomeText =
    `${greeting}\n\n` +
    `*చౌటుప్పల్ సూపర్ యాప్ (Choutuppal App)* WhatsApp సేవలకు స్వాగతం.\n\n` +
    `ఇక్కడ మీరు స్థానిక వార్తలు, వ్యాపారాలు, రియల్ ఎస్టేట్ వివరాలు మరియు అత్యవసర సేవల సమాచారాన్ని తక్షణమే పొందవచ్చు.\n\n` +
    `క్రింది మెనూ నుండి మీకు కావలసిన సేవను ఎంచుకోండి:`

  await sendWhatsAppInteractiveList(phone, {
    header: '🌟 Choutuppal Super App',
    body: welcomeText,
    footer: 'choutuppal.in • స్థానిక సమాచార వేదిక',
    buttonText: 'సేవలు ఎంచుకోండి 📋',
    sections: [
      {
        title: 'ముఖ్యమైన సేవలు',
        rows: [
          {
            id: 'menu_news',
            title: '📰 తాజా వార్తలు',
            description: 'చౌటుప్పల్ & పరిసర ప్రాంతాల తాజా సమాచారం',
          },
          {
            id: 'menu_services',
            title: '🏪 వ్యాపారాలు & సేవలు',
            description: 'స్థానిక షాపులు, సర్వీస్ నంబర్లు & వివరాలు',
          },
          {
            id: 'menu_real_estate',
            title: '🏡 రియల్ ఎస్టేట్ & ప్లాట్లు',
            description: 'ఓపెన్ ప్లాట్లు, ఇండ్లు & ల్యాండ్స్ సమాచారం',
          },
          {
            id: 'menu_add_listing',
            title: '➕ మీ షాప్ లిస్ట్ చేయండి',
            description: 'మీ వ్యాపారాన్ని ఉచితంగా రిజిస్టర్ చేసుకోండి',
          },
          {
            id: 'menu_support',
            title: '📞 హెల్ప్‌డెస్క్ & అత్యవసరం',
            description: 'పోలీస్, హాస్పిటల్ & అడ్మిన్ సపోర్ట్',
          },
        ],
      },
    ],
  })
}

/**
 * 2. MAIN_MENU: Interactive Main Menu
 */
async function handleMainMenu(phone: string, name?: string | null) {
  const userGreeting = name ? `నమస్తే ${name} గారు! 👋` : 'నమస్తే! 👋'

  const menuBody =
    `${userGreeting}\n\n` +
    `చౌటుప్పల్ సూపర్ యాప్ మెయిన్ మెనూ:\n` +
    `1. 📰 తాజా వార్తలు (Latest News)\n` +
    `2. 🏪 వ్యాపారాలు & సేవలు (Local Services)\n` +
    `3. 🏡 రియల్ ఎస్టేట్ & ప్లాట్లు (Real Estate)\n` +
    `4. ➕ మీ షాప్ లిస్ట్ చేయండి (Add Listing)\n` +
    `5. 📞 హెల్ప్‌డెస్క్ (Emergency & Helpdesk)\n\n` +
    `క్రింది లిస్ట్ బటన్ పై నొక్కండి లేదా నంబర్ (1-5) టైప్ చేయండి:`

  await sendWhatsAppInteractiveList(phone, {
    header: '🏛️ చౌటుప్పల్ సూపర్ యాప్',
    body: menuBody,
    footer: 'choutuppal.in',
    buttonText: 'మెనూ ఓపెన్ చేయండి',
    sections: [
      {
        title: 'మెనూ ఆప్షన్స్',
        rows: [
          {
            id: 'menu_news',
            title: '📰 తాజా వార్తలు',
            description: 'చౌటుప్పల్ స్థానిక వార్తల సమాచారం',
          },
          {
            id: 'menu_services',
            title: '🏪 వ్యాపారాలు & సేవలు',
            description: 'గ్యారేజ్, హోటళ్ళు, మీసేవ, ఎలక్ట్రికల్ మొదలైనవి',
          },
          {
            id: 'menu_real_estate',
            title: '🏡 రియల్ ఎస్టేట్ & ప్లాట్లు',
            description: 'కొత్త వెంచర్లు, ఓపెన్ ప్లాట్లు & అమ్మకాలు',
          },
          {
            id: 'menu_add_listing',
            title: '➕ బిజినెస్ లిస్టింగ్',
            description: 'మీ షాపును ఆన్‌లైన్‌లో చేర్చండి',
          },
          {
            id: 'menu_support',
            title: '📞 అడ్మిన్ & హెల్ప్‌డెస్క్',
            description: 'మా బృందంతో నేరుగా మాట్లాడండి',
          },
        ],
      },
    ],
  })
}

/**
 * 3. NEWS: Latest News Feed
 */
async function handleNews(phone: string) {
  const dbNews = await safeDbQuery(
    () =>
      prisma.news.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, title: true, summary: true, slug: true },
      }),
    [],
  )

  const finalNews =
    dbNews && dbNews.length > 0
      ? dbNews
      : getOfflineNews().filter((n) => n.isPublished !== false).slice(0, 5)

  if (!finalNews || finalNews.length === 0) {
    await sendWhatsAppTextMessage(
      phone,
      'ప్రస్తుతం కొత్త వార్తలు అప్‌డేట్ అవుతున్నాయి. మరిన్ని వివరాల కోసం మన వెబ్‌సైట్ చూడండి: https://choutuppal.in/news\n\nమెయిన్ మెనూ కోసం "MENU" అని టైప్ చేయండి.',
    )
    return
  }

  const newsRows = finalNews.slice(0, 5).map((item, idx) => ({
    id: `news_${item.slug || item.id}`,
    title: `${idx + 1}. ${(item.title || 'వార్త').slice(0, 20)}`,
    description: item.summary ? item.summary.slice(0, 70) : 'పూర్తి వివరాల కోసం క్లిక్ చేయండి',
  }))

  let newsText = '📰 *చౌటుప్పల్ తాజా ముఖ్యాంశాలు:*\n\n'
  finalNews.forEach((item, idx) => {
    newsText += `*${idx + 1}. ${item.title}*\n`
    if (item.summary) newsText += `${item.summary.slice(0, 90)}…\n`
    newsText += `🔗 https://choutuppal.in/news\n\n`
  })
  newsText += 'మరింత సమాచారం లేదా ఇతర సేవలకు క్రింది బటన్ నొక్కండి:'

  await sendWhatsAppInteractiveList(phone, {
    header: '📰 చౌటుప్పల్ తాజా వార్తలు',
    body: newsText,
    footer: 'choutuppal.in/news',
    buttonText: 'వార్తలు ఎంచుకోండి',
    sections: [
      {
        title: 'తాజా ముఖ్యాంశాలు',
        rows: [
          ...newsRows,
          { id: 'menu_home', title: '🔙 మెయిన్ మెనూ', description: 'ప్రధాన మెనూకు తిరిగి వెళ్లండి' },
        ],
      },
    ],
  })
}

async function handleNewsDetails(phone: string, newsActionId: string, textQuery: string) {
  const slug = newsActionId.replace('news_', '')
  const dbItem = await safeDbQuery(
    () => prisma.news.findFirst({ where: { OR: [{ slug }, { id: slug }] } }),
    null,
  )

  if (dbItem) {
    const detailMsg =
      `📰 *${dbItem.title}*\n\n` +
      `${dbItem.summary ? `${dbItem.summary}\n\n` : ''}` +
      `${dbItem.content ? `${dbItem.content.slice(0, 350)}…\n\n` : ''}` +
      `🌐 పూర్తి వార్త చదవండి: https://choutuppal.in/news\n\n` +
      `మెయిన్ మెనూ కోసం "MENU" అని టైప్ చేయండి.`
    await sendWhatsAppTextMessage(phone, detailMsg)
  } else {
    await handleNews(phone)
  }
}

/**
 * 4. SERVICES: Interactive Category Browser
 */
async function handleServicesMenu(phone: string) {
  const categories = STANDARD_CATEGORIES.slice(0, 8).map((cat) => ({
    id: `cat_${cat.slug}`,
    title: cat.name.slice(0, 24),
    description: `చౌటుప్పల్ లో ${cat.name} సేవలు & నంబర్లు`,
  }))

  const bodyText =
    `🏪 *చౌటుప్పల్ స్థానిక వ్యాపారాలు & సేవలు*\n\n` +
    `మీకు కావలసిన కేటగిరీని ఎంచుకోండి లేదా నేరుగా షాప్ పేరు/సర్వీస్ పేరు టైప్ చేసి పంపండి (ఉదాహరణ: *Hotel, Mechanic, Hospital*):`

  await sendWhatsAppInteractiveList(phone, {
    header: '🏪 లోకల్ సర్వీసెస్ కేటలాగ్',
    body: bodyText,
    footer: 'choutuppal.in/listings',
    buttonText: 'కేటగిరీ ఎంచుకోండి',
    sections: [
      {
        title: 'ప్రముఖ విభాగాలు',
        rows: [
          ...categories,
          { id: 'menu_home', title: '🔙 మెయిన్ మెనూ', description: 'ప్రధాన మెనూకు వెళ్లండి' },
        ],
      },
    ],
  })
}

async function handleCategoryListings(phone: string, categorySlug: string) {
  const dbListings = await safeDbQuery(
    () =>
      prisma.listing.findMany({
        where: {
          status: 'APPROVED',
          OR: [{ category: { slug: categorySlug } }, { categoryId: categorySlug }],
        },
        orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        take: 5,
        select: { title: true, phone: true, whatsapp: true, address: true, slug: true },
      }),
    [],
  )

  const offlineListings = getOfflineListings().filter(
    (l) =>
      (l.status === 'APPROVED' || !l.status) &&
      (l.categoryId === categorySlug || l.category?.slug === categorySlug),
  )

  const results =
    dbListings && dbListings.length > 0
      ? dbListings
      : offlineListings.length > 0
      ? offlineListings.slice(0, 5)
      : []

  if (results.length === 0) {
    await sendWhatsAppTextMessage(
      phone,
      `ఈ కేటగిరీలో మరిన్ని వివరాలు త్వరలో రానున్నాయి.\n\nఅన్ని వ్యాపారాల కోసం చూడండి: https://choutuppal.in/listings\n\nమెయిన్ మెనూ: "MENU"`,
    )
    return
  }

  let text = `🏪 *చౌటుప్పల్ లో టాప్ వెరిఫైడ్ లిస్టింగ్స్:*\n\n`
  results.forEach((item: any, idx: number) => {
    text += `*${idx + 1}. ${item.title}*\n`
    if (item.phone) text += `📞 కాల్: ${item.phone}\n`
    if (item.whatsapp) text += `💬 వాట్సాప్: https://wa.me/91${item.whatsapp.replace(/\D/g, '')}\n`
    if (item.address) text += `📍 అడ్రస్: ${item.address}\n`
    text += `🔗 వివరాలు: https://choutuppal.in/business/${item.slug}\n\n`
  })
  text += `మరిన్ని షాపుల కోసం: https://choutuppal.in/listings\nమెయిన్ మెనూ కోసం "MENU" టైప్ చేయండి.`

  await sendWhatsAppTextMessage(phone, text)
}

async function handleSearchServices(phone: string, query: string) {
  const q = query.trim()
  const dbResults = await safeDbQuery(
    () =>
      prisma.listing.findMany({
        where: {
          status: 'APPROVED',
          OR: [
            { title: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q } },
          ],
        },
        take: 5,
        select: { title: true, phone: true, address: true, slug: true },
      }),
    [],
  )

  if (dbResults && dbResults.length > 0) {
    let text = `🔍 *"${q}" కోసం దొరికిన ఫలితాలు:*\n\n`
    dbResults.forEach((item, idx) => {
      text += `*${idx + 1}. ${item.title}*\n`
      if (item.phone) text += `📞 Phone: ${item.phone}\n`
      if (item.address) text += `📍 Address: ${item.address}\n`
      text += `🔗 https://choutuppal.in/business/${item.slug}\n\n`
    })
    text += `మరిన్ని ఫలితాలకు: https://choutuppal.in/listings?q=${encodeURIComponent(q)}\nమెయిన్ మెనూ: "MENU"`
    await sendWhatsAppTextMessage(phone, text)
  } else {
    await sendWhatsAppTextMessage(
      phone,
      `క్షమించండి, "${q}" పేరుతో నేరుగా ఫలితాలు దొరకలేదు.\n\nమన డైరెక్టరీలో చూడండి: https://choutuppal.in/listings\nలేదా మెయిన్ మెనూ కోసం "MENU" టైప్ చేయండి.`,
    )
  }
}

/**
 * 5. REAL ESTATE Handler
 */
async function handleRealEstate(phone: string) {
  const dbRE = await safeDbQuery(
    () =>
      prisma.realEstate.findMany({
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { title: true, price: true, type: true, areaSqft: true, contactPhone: true, slug: true },
      }),
    [],
  )

  const properties =
    dbRE && dbRE.length > 0 ? dbRE : getOfflineRealEstates().filter((r) => r.status === 'APPROVED').slice(0, 3)

  let text = `🏡 *చౌటుప్పల్ రియల్ ఎస్టేట్ & ఓపెన్ ప్లాట్లు:*\n\n`
  properties.forEach((item: any, idx: number) => {
    const formattedPrice = item.price ? `₹${Number(item.price).toLocaleString('en-IN')}` : 'ధర విచారించండి'
    text += `*${idx + 1}. ${item.title}*\n`
    text += `💰 ధర: ${formattedPrice} | రకం: ${item.type || 'Plot'}\n`
    if (item.areaSqft) text += `📐 విస్తీర్ణం: ${item.areaSqft} sq.ft\n`
    if (item.contactPhone) text += `📞 కాల్: ${item.contactPhone}\n`
    text += `\n`
  })

  text +=
    `🌐 అన్ని ప్రాపర్టీలు & వెంచర్ల కోసం చూడండి: https://choutuppal.in/real-estate\n\n` +
    `మెయిన్ మెనూ కోసం "MENU" టైప్ చేయండి.`

  await sendWhatsAppTextMessage(phone, text)
}

/**
 * 6. ADD LISTING Handler
 */
async function handleAddListing(phone: string) {
  const text =
    `➕ *చౌటుప్పల్ యాప్ లో మీ షాప్ / బిజినెస్ ను లిస్ట్ చేసుకోండి!*\n\n` +
    `మీ వ్యాపారాన్ని వేలాది స్థానిక కస్టమర్లకు చేరువ చేయడానికి మా ప్లాట్‌ఫారమ్‌లో ఉచితంగా నమోదు చేసుకోండి.\n\n` +
    `🔗 *లిస్టింగ్ పోస్ట్ చేయడానికి లింక్:*\n` +
    `https://choutuppal.in/dashboard?tab=add-listing\n\n` +
    `మా సపోర్ట్ టీమ్ సహాయం కోసం నేరుగా వాట్సాప్ చేయండి: 9494348175\n\n` +
    `మెయిన్ మెనూ కోసం "MENU" టైప్ చేయండి.`

  await sendWhatsAppTextMessage(phone, text)
}

/**
 * 7. SUPPORT & EMERGENCY Handler
 */
async function handleSupport(phone: string) {
  const text =
    `📞 *చౌటుప్పల్ హెల్ప్‌డెస్క్ & అత్యవసర సమాచారం:*\n\n` +
    `🚨 *పోలీస్ స్టేషన్*: 100 / 08694-272233\n` +
    `🚑 *హాస్పిటల్ & అంబులెన్స్*: 108 / 102\n` +
    `🚒 *ఫైర్ స్టేషన్*: 101\n` +
    `⚡ *విద్యుత్ శాఖ (Electricity)*: 1912\n\n` +
    `💬 *చౌటుప్పల్ యాప్ అడ్మిన్ వాట్సాప్*: 9494348175\n` +
    `🌐 *వెబ్‌సైట్*: https://choutuppal.in\n\n` +
    `మెయిన్ మెనూ కోసం "MENU" టైప్ చేయండి.`

  await sendWhatsAppTextMessage(phone, text)
}
