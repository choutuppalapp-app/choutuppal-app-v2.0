require('dotenv').config()
const { GoogleGenerativeAI } = require('@google/generative-ai')
const fs = require('fs')

async function testGeminiOCR() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GOOGLE_API_KEY
  console.log('Using API key:', apiKey ? `${apiKey.slice(0, 8)}...` : 'NONE')
  if (!apiKey) return

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const filePath = 'C:\\Users\\Citizen2\\Desktop\\ChoutuppalPDFs\\CPL_Dir_2026-1.pdf'
  const pdfBuffer = fs.readFileSync(filePath)
  const base64Data = pdfBuffer.toString('base64')

  const prompt = `Extract all emergency contacts, government officials, police numbers, hospital numbers, political leaders, and bank details from this Telugu directory PDF.
Output ONLY structured CSV rows with headers: phone_number,name,designation`

  try {
    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: 'application/pdf',
        },
      },
    ])

    console.log('--- GEMINI EXTRACTION RESULT ---')
    console.log(result.response.text())
  } catch (err) {
    console.error('Gemini OCR Error:', err)
  }
}

testGeminiOCR()
