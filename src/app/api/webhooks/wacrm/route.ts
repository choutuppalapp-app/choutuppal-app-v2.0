import { NextRequest, NextResponse } from 'next/server'
import { listings, type ListingItem } from '@/data/listings'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface WACRMPayload {
  user_phone?: string
  user_message?: string
  phone?: string
  message?: string
  from?: string
  body?: string
}

function cleanPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) {
    return `91${digits}`
  }
  return digits
}

function formatListingResult(item: ListingItem, index: number): string {
  const numberEmoji = index === 0 ? '1️⃣' : index === 1 ? '2️⃣' : `${index + 1}️⃣`
  const waPhone = cleanPhoneForWhatsApp(item.phone)
  const waLink = `https://wa.me/${waPhone}?text=Hi%20I%20found%20your%20business%20on%20Choutuppal%20App`

  return `${numberEmoji} ${item.name}
📍 ${item.address}
📞 ${item.phone}
💬 WhatsApp: ${waLink}`
}

export async function POST(req: NextRequest) {
  try {
    let payload: WACRMPayload = {}
    try {
      payload = (await req.json()) as WACRMPayload
    } catch {
      // Body may be empty or not valid JSON
    }

    const rawMessage = payload.user_message || payload.message || payload.body || ''
    const userMessage = rawMessage.trim()
    const lowerMessage = userMessage.toLowerCase()

    let replyText = ''

    // 1. Welcome / Greeting response
    if (
      lowerMessage === 'hi' ||
      lowerMessage === 'hello' ||
      lowerMessage === 'hey' ||
      lowerMessage === 'namaste' ||
      lowerMessage === 'start' ||
      lowerMessage === ''
    ) {
      replyText = `Welcome to Choutuppal App! 🏙️

Search for any shops, services, or emergency contacts in Choutuppal (e.g., "electrician", "plumber", "medical", "kirana").

To add your shop or business to the directory, reply with "add shop".`
    }
    // 2. Add shop request
    else if (lowerMessage.includes('add shop') || lowerMessage.includes('add business')) {
      replyText = `To add your shop on Choutuppal App, please send your details in this format:

1. Shop Name
2. Category / Services
3. Contact Phone Number
4. Address / Landmark

Or register online directly at https://choutuppal.in`
    }
    // 3. Search listings by category or name
    else {
      const searchTerms = lowerMessage.split(/\s+/).filter(Boolean)

      const matchedListings = listings.filter((item) => {
        const nameLower = (item.name || '').toLowerCase()
        const categoryLower = (item.category || '').toLowerCase()
        const addressLower = (item.address || '').toLowerCase()

        // Match if any search term is included in name, category, or address
        return searchTerms.some(
          (term) =>
            nameLower.includes(term) ||
            categoryLower.includes(term) ||
            addressLower.includes(term)
        )
      })

      // Take top 2 results
      const topResults = matchedListings.slice(0, 2)

      if (topResults.length > 0) {
        replyText = topResults
          .map((item, idx) => formatListingResult(item, idx))
          .join('\n\n')
      } else {
        replyText = 'మీరు అడిగిన సమాచారం మా డేటాబేస్లో లేదు.'
      }
    }

    return NextResponse.json(
      { replyText },
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    console.error('[WACRM Webhook Error]:', error)
    // Always return HTTP 200 to prevent webhook retries/timeouts
    return NextResponse.json(
      {
        replyText: 'మీరు అడిగిన సమాచారం మా డేటాబేస్లో లేదు.',
      },
      { status: 200 }
    )
  }
}

// Optional GET handler for webhook verification if required by providers
export async function GET() {
  return NextResponse.json({ status: 'active', service: 'wacrm-webhook' }, { status: 200 })
}
