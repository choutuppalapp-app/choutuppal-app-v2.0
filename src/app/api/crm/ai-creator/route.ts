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
    const { prompt, type } = body // type: 'template' | 'flow' | 'interactive'

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
    }

    const apiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
      process.env.GOOGLE_API_KEY

    if (!apiKey) {
      return NextResponse.json({
        textMessage: '🎉 చౌటుప్పల్ ప్రత్యేక ఆఫర్! ఈరోజు మీ షాప్ ని choutuppal.in లో లిస్ట్ చేయండి.',
        options: {
          messageType: 'interactive_button',
          buttons: [{ id: 'btn_1', title: 'లిస్ట్ చేయండి' }],
        },
      })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const systemPrompt = `You are an expert WhatsApp Marketing Content Assistant for Choutuppal App.
Generate professional, engaging Telugu/English WhatsApp marketing messages based on the user's prompt.

If type is 'interactive':
Return JSON with format:
{
  "textMessage": "Main message body text in Telugu/English",
  "options": {
    "messageType": "interactive_button",
    "headerText": "Header",
    "footerText": "Footer",
    "buttons": [
      { "id": "btn_1", "title": "Button 1 text" },
      { "id": "btn_2", "title": "Button 2 text" }
    ]
  }
}

If type is 'list':
Return JSON with format:
{
  "textMessage": "Main message body text",
  "options": {
    "messageType": "interactive_list",
    "listButtonTitle": "Options Menu",
    "listSectionTitle": "Services",
    "listOptions": [
      { "id": "opt_1", "title": "Option 1", "description": "Short description" }
    ]
  }
}

Otherwise (type is 'template' or 'flow'):
Return JSON with format:
{
  "textMessage": "Formatted WhatsApp text with emojis and clear call to actions",
  "options": {
    "messageType": "text"
  }
}

Return ONLY valid JSON. No markdown backticks.`

    const result = await model.generateContent(`${systemPrompt}\n\nType: ${type}\nUser Prompt: ${prompt}`)
    let rawText = result.response.text().trim()

    // Clean JSON markdown codeblocks if returned
    rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim()

    try {
      const parsed = JSON.parse(rawText)
      return NextResponse.json(parsed)
    } catch {
      return NextResponse.json({
        textMessage: rawText,
        options: { messageType: 'text' },
      })
    }
  } catch (err) {
    console.error('[CRM AI Creator API] Error:', err)
    return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
  }
}
