import { GoogleGenerativeAI } from '@google/generative-ai'
import { prisma } from '@/lib/prisma'

const SYSTEM_PROMPT = `You are the Choutuppal App AI Assistant. Answer user queries about local businesses, real estate, and news in Choutuppal town based on the provided database context. Be polite and answer in Telugu or English based on the user's language. Keep answers short.`

/**
 * Fetch database context (RAG) based on user message keywords
 */
async function fetchDbContext(userMessage: string): Promise<string> {
  try {
    const rawQuery = userMessage.trim().toLowerCase()
    const words = rawQuery
      .replace(/[^\w\s\u0C00-\u0C7F]/gi, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 2)

    // Build keyword search conditions
    const keywordFilters = words.map((word) => ({
      OR: [
        { title: { contains: word, mode: 'insensitive' as const } },
        { description: { contains: word, mode: 'insensitive' as const } },
      ],
    }))

    // 1. Fetch Listings
    const listings = await prisma.listing.findMany({
      where: {
        status: 'APPROVED',
        AND: keywordFilters.length > 0 ? [{ OR: keywordFilters }] : undefined,
      },
      take: 5,
      select: {
        title: true,
        description: true,
        phone: true,
        whatsapp: true,
        address: true,
        category: { select: { name: true } },
      },
      orderBy: { views: 'desc' },
    })

    // 2. Fetch Real Estate
    const realEstate = await prisma.realEstate.findMany({
      where: {
        status: 'APPROVED',
        AND: keywordFilters.length > 0 ? [{ OR: keywordFilters }] : undefined,
      },
      take: 5,
      select: {
        title: true,
        type: true,
        listingType: true,
        price: true,
        address: true,
        contactPhone: true,
        contactWhatsapp: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // 3. Fetch News
    const news = await prisma.news.findMany({
      where: {
        isPublished: true,
        AND: keywordFilters.length > 0 ? [{ OR: keywordFilters }] : undefined,
      },
      take: 3,
      select: {
        title: true,
        summary: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    // Format DB context
    let contextStr = ''

    if (listings.length > 0) {
      contextStr += '\n--- LOCAL BUSINESSES & SERVICES ---\n'
      listings.forEach((l, idx) => {
        contextStr += `${idx + 1}. ${l.title} (${l.category?.name || 'General'})\n`
        if (l.description) contextStr += `   Info: ${l.description.slice(0, 150)}\n`
        if (l.phone || l.whatsapp) contextStr += `   Contact: ${l.phone || l.whatsapp}\n`
        if (l.address) contextStr += `   Address: ${l.address}\n`
      })
    }

    if (realEstate.length > 0) {
      contextStr += '\n--- REAL ESTATE & PROPERTIES ---\n'
      realEstate.forEach((r, idx) => {
        contextStr += `${idx + 1}. ${r.title} (${r.type} for ${r.listingType}) - ₹${r.price}\n`
        if (r.address) contextStr += `   Location: ${r.address}\n`
        if (r.contactPhone || r.contactWhatsapp)
          contextStr += `   Contact: ${r.contactPhone || r.contactWhatsapp}\n`
      })
    }

    if (news.length > 0) {
      contextStr += '\n--- LATEST LOCAL NEWS ---\n'
      news.forEach((n, idx) => {
        contextStr += `${idx + 1}. ${n.title}\n`
        if (n.summary) contextStr += `   Summary: ${n.summary}\n`
      })
    }

    return contextStr.trim()
  } catch (err) {
    console.error('[AIAgent] DB fetch error:', err)
    return ''
  }
}

/**
 * Generate smart AI response using Google Gemini API + Database RAG Context
 */
export async function getAIResponse(
  userPhone: string,
  userMessage: string,
  userName?: string,
): Promise<string> {
  const dbContext = await fetchDbContext(userMessage)
  const apiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.GOOGLE_API_KEY

  const displayName = userName || 'మిత్రమా'
  let customBrainInstructions = ''
  try {
    const dbPrompt = await prisma.systemPrompt.findUnique({
      where: { key: 'whatsapp_ai_brain' },
    })
    if (dbPrompt?.content) {
      customBrainInstructions = `\n\nCustom Admin AI Brain Rules & Directives:\n${dbPrompt.content}`
    }
  } catch (err) {
    console.warn('[AIAgent] Could not fetch SystemPrompt:', err)
  }

  const systemInstruction = `You are a friendly, human-like local assistant for Choutuppal town. The user's name is ${displayName}. Be polite, realistic, and answer in Telugu unless the user uses English. Do not sound like a robot. Use the provided database context to answer queries about local businesses, real estate, and news. Keep answers concise, direct, and helpful.${customBrainInstructions}`

  if (!apiKey) {
    console.warn('[AIAgent] GEMINI_API_KEY missing. Returning DB context directly.')
    if (dbContext) {
      return `నమస్తే ${displayName} గారు! చౌటుప్పల్ యాప్ నుండి లభించిన వివరాలు:\n\n${dbContext}\n\nమరిన్ని వివరాల కోసం choutuppal.in విజిట్ చేయండి.`
    }
    return `నమస్కారం ${displayName} గారు! వ్యాపారాలు, రియల్ ఎస్టేట్ మరియు వార్తల సమాచారం కోసం choutuppal.in విజిట్ చేయగలరు.`
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction,
    })

    const prompt = `Database Context:\n${
      dbContext || 'No specific database records found for this query.'
    }\n\nUser Query: ${userMessage}`

    const result = await model.generateContent(prompt)
    const replyText = result.response.text()

    return replyText.trim() || 'నమస్తే! వివరాల కోసం చౌటుప్పల్ యాప్ choutuppal.in విజిట్ చేయండి.'
  } catch (err) {
    console.error('[AIAgent] Gemini API error:', err)
    if (dbContext) {
      return `నమస్తే! చౌటుప్పల్ యాప్ నుండి లభించిన వివరాలు:\n\n${dbContext}`
    }
    return 'నమస్తే! ప్రస్థుతం AI అందుబాటులో లేదు. వివరాల కోసం choutuppal.in చూడగలరు.'
  }
}
