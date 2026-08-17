import { prisma } from '@/lib/prisma'

export interface WhatsAppMessagePayloadOptions {
  messageType?: 'text' | 'template' | 'interactive_button' | 'interactive_list'
  // Text & General
  text?: string
  headerText?: string
  footerText?: string

  // Template options
  templateName?: string
  templateLanguage?: string
  templateComponents?: any[]

  // Interactive Buttons options
  buttonType?: 'quick_reply' | 'cta_url'
  buttons?: { id?: string; title: string }[]
  ctaTitle?: string
  ctaUrl?: string

  // List Message options
  listButtonTitle?: string
  listSectionTitle?: string
  listOptions?: { id?: string; title: string; description?: string }[]
}

/**
 * Get active Meta WhatsApp API credentials (Database priority -> process.env fallback)
 */
export async function getWhatsAppCredentials(): Promise<{
  token: string | null
  phoneNumberId: string | null
  verifyToken: string | null
  businessId?: string | null
}> {
  let token = process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_API_KEY || null
  let phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID || null
  let verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'choutuppal_verify_token'
  let businessId = process.env.WHATSAPP_BUSINESS_ID || null

  try {
    const dbSetting = await prisma.whatsAppSetting.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    })

    if (dbSetting?.waToken && dbSetting?.waPhoneNumberId) {
      token = dbSetting.waToken
      phoneNumberId = dbSetting.waPhoneNumberId
      if (dbSetting.waVerifyToken) {
        verifyToken = dbSetting.waVerifyToken
      }
    }
  } catch (error) {
    console.log('Falling back to env vars for WhatsApp credentials:', error)
  }

  return {
    token,
    phoneNumberId,
    verifyToken,
    businessId,
  }
}

/**
 * Send Meta WhatsApp Cloud API Message (Text, Template, Interactive Buttons, or List)
 */
export async function sendWhatsAppMessage(
  toPhoneNumber: string,
  messageText: string,
  options: WhatsAppMessagePayloadOptions = {},
): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const { token, phoneNumberId } = await getWhatsAppCredentials()

    if (!token || !phoneNumberId) {
      console.warn('[WhatsApp API] Missing WhatsApp Token or Phone Number ID credentials.')
      return { ok: false, error: 'WhatsApp API credentials not configured.' }
    }

    const cleanPhone = toPhoneNumber.replace(/\D/g, '')
    if (!cleanPhone) {
      return { ok: false, error: 'Invalid recipient phone number.' }
    }

    const url = `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`
    let payload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanPhone,
    }

    const type = options.messageType || 'text'

    if (type === 'template' && options.templateName) {
      payload.type = 'template'
      payload.template = {
        name: options.templateName,
        language: { code: options.templateLanguage || 'en' },
        components: options.templateComponents || [],
      }
    } else if (type === 'interactive_button') {
      payload.type = 'interactive'

      if (options.buttonType === 'cta_url' && options.ctaUrl) {
        payload.interactive = {
          type: 'cta_url',
          body: { text: messageText },
          action: {
            name: 'cta_url',
            parameters: {
              display_text: options.ctaTitle || 'Visit Link',
              url: options.ctaUrl,
            },
          },
        }
      } else {
        // Quick Reply Buttons (Max 3 buttons)
        const formattedButtons = (options.buttons || [
          { id: 'btn_1', title: 'Yes' },
          { id: 'btn_2', title: 'More Info' },
        ]).slice(0, 3).map((b, idx) => ({
          type: 'reply',
          reply: {
            id: b.id || `btn_${idx + 1}`,
            title: b.title.slice(0, 20),
          },
        }))

        payload.interactive = {
          type: 'button',
          body: { text: messageText },
          action: {
            buttons: formattedButtons,
          },
        }
        if (options.headerText) payload.interactive.header = { type: 'text', text: options.headerText }
        if (options.footerText) payload.interactive.footer = { text: options.footerText }
      }
    } else if (type === 'interactive_list') {
      payload.type = 'interactive'
      const rows = (options.listOptions || [
        { id: 'opt_1', title: 'Option 1', description: 'Select option 1' },
      ]).slice(0, 10).map((opt, idx) => ({
        id: opt.id || `opt_${idx + 1}`,
        title: opt.title.slice(0, 24),
        description: opt.description ? opt.description.slice(0, 72) : undefined,
      }))

      payload.interactive = {
        type: 'list',
        body: { text: messageText },
        action: {
          button: (options.listButtonTitle || 'Select Option').slice(0, 20),
          sections: [
            {
              title: (options.listSectionTitle || 'Menu Options').slice(0, 24),
              rows,
            },
          ],
        },
      }
      if (options.headerText) payload.interactive.header = { type: 'text', text: options.headerText }
      if (options.footerText) payload.interactive.footer = { text: options.footerText }
    } else {
      // Default: Plain Text Message
      payload.type = 'text'
      payload.text = { body: messageText }
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

    try {
      await prisma.whatsAppLog.create({
        data: {
          phone: cleanPhone,
          direction: 'outbound',
          message: messageText,
          status: 'sent',
        },
      })
    } catch (logErr) {
      console.warn('[WhatsApp API] Log error:', logErr)
    }

    return { ok: true, data }
  } catch (err) {
    console.error('[WhatsApp API] Exception:', err)
    return { ok: false, error: err instanceof Error ? err.message : 'WhatsApp API exception' }
  }
}
