/**
 * WhatsApp Cloud API Utility (Graph API v18.0)
 * Sends automated WhatsApp text messages using Meta credentials.
 */

export async function sendWhatsAppMessage(
  toPhoneNumber: string,
  messageText: string,
): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const token = process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_API_KEY
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

    if (!token || !phoneNumberId) {
      console.warn(
        '[WhatsApp API] Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID in environment variables.',
      )
      return { ok: false, error: 'WhatsApp API credentials not configured.' }
    }

    const cleanPhone = toPhoneNumber.replace(/\D/g, '')
    if (!cleanPhone) {
      return { ok: false, error: 'Invalid recipient phone number.' }
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`
    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
      type: 'text',
      text: {
        body: messageText,
      },
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('[WhatsApp API] Error response:', data)
      return { ok: false, error: data?.error?.message || 'Failed to send WhatsApp message', data }
    }

    return { ok: true, data }
  } catch (err) {
    console.error('[WhatsApp API] Exception:', err)
    return { ok: false, error: err instanceof Error ? err.message : 'WhatsApp API exception' }
  }
}
