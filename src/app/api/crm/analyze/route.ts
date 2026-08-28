import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messages } = body

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No conversation history provided' }, { status: 400 })
    }

    const conversationText = messages
      .map((m: any) => `${m.direction === 'inbound' ? 'User' : 'Bot'}: ${m.message}`)
      .join('\n')

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        suggestion: 'Rule: If user asks for local services, provide contact details of verified partners in Choutuppal.',
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Analyze this WhatsApp customer support conversation for Choutuppal App bot.
The bot might have lacked information or given an incomplete answer.
Suggest a new rule or instruction (1 to 3 clear, direct sentences) to add to the AI Assistant's system prompt so it can answer this query accurately in the future.

Conversation History:
${conversationText}

Provide ONLY the suggested rule/instruction to add to the AI Brain. Do not add intro/outro.`

    const result = await model.generateContent(prompt)
    const suggestion = result.response.text().trim()

    return NextResponse.json({ suggestion })
  } catch (err) {
    console.error('[CRM Analyze API] Error:', err)
    return NextResponse.json({ error: 'Failed to analyze conversation' }, { status: 500 })
  }
}
