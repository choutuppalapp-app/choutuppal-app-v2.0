import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * DELETE /api/admin/whatsapp/templates/[id] — Delete a template by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json({ error: 'Template ID is required' }, { status: 400 })
    }

    await prisma.whatsAppTemplate.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[WhatsApp Templates DELETE error]:', err)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 500 })
  }
}
