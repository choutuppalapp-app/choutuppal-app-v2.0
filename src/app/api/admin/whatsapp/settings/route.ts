import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const revalidate = 3600

/**
 * GET /api/admin/whatsapp/settings — Fetch active WhatsApp API configuration
 */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: Admin access required' }, { status: 401 })
    }

    const setting = await prisma.whatsAppSetting.findFirst({
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({
      ok: true,
      setting: setting || {
        waToken: process.env.WHATSAPP_TOKEN || process.env.WHATSAPP_API_KEY || '',
        waPhoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
        waVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || 'choutuppal_verify_token',
        isActive: true,
      },
    })
  } catch (err: any) {
    console.error('[Admin WhatsApp Settings GET] Error:', err)
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) || 'Failed to fetch WhatsApp settings' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/whatsapp/settings — Save or Update WhatsApp API credentials in database
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ ok: false, error: 'Unauthorized: Admin access required' }, { status: 401 })
    }

    const body = await request.json()
    const { waToken, waPhoneNumberId, waVerifyToken, isActive } = body

    if (!waToken || !waPhoneNumberId) {
      return NextResponse.json(
        { ok: false, error: 'WhatsApp Access Token and Phone Number ID are required.' },
        { status: 400 },
      )
    }

    const existing = await prisma.whatsAppSetting.findFirst({
      orderBy: { updatedAt: 'desc' },
    })

    let setting
    if (existing) {
      setting = await prisma.whatsAppSetting.update({
        where: { id: existing.id },
        data: {
          waToken: waToken.trim(),
          waPhoneNumberId: waPhoneNumberId.trim(),
          waVerifyToken: (waVerifyToken || 'choutuppal_verify_token').trim(),
          isActive: isActive !== false,
        },
      })
    } else {
      setting = await prisma.whatsAppSetting.create({
        data: {
          waToken: waToken.trim(),
          waPhoneNumberId: waPhoneNumberId.trim(),
          waVerifyToken: (waVerifyToken || 'choutuppal_verify_token').trim(),
          isActive: isActive !== false,
        },
      })
    }

    return NextResponse.json({ ok: true, setting })
  } catch (err: any) {
    console.error('[Admin WhatsApp Settings POST] Error:', err)
    return NextResponse.json(
      { ok: false, error: err?.message || String(err) || 'Failed to save WhatsApp settings' },
      { status: 500 },
    )
  }
}
