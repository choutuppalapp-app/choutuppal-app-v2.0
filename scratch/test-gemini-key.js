require('dotenv').config()
const { GoogleGenerativeAI } = require('@google/generative-ai')

async function testKey() {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.YOUTUBE_API_KEY
  console.log('Testing Key:', key ? `${key.slice(0, 10)}...` : 'NONE')

  const genAI = new GoogleGenerativeAI(key)
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  try {
    const res = await model.generateContent('Say hello in 3 words')
    console.log('Gemini Response:', res.response.text())
  } catch (err) {
    console.error('Error with key:', err.message)
  }
}

testKey()
