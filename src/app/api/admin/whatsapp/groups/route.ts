import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/whatsapp/groups — Fetch all contact groups with member counts
 */
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const groups = await prisma.contactGroup.findMany({
      include: {
        _count: {
          select: { contacts: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ ok: true, groups })
  } catch (err) {
    console.error('[Admin WhatsApp Groups GET] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch contact groups' }, { status: 500 })
  }
}

/**
 * POST /api/admin/whatsapp/groups — Create a new contact group
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Group name is required.' }, { status: 400 })
    }

    const group = await prisma.contactGroup.upsert({
      where: { name: name.trim() },
      update: {},
      create: { name: name.trim() },
      include: {
        _count: {
          select: { contacts: true },
        },
      },
    })

    return NextResponse.json({ ok: true, group })
  } catch (err) {
    console.error('[Admin WhatsApp Groups POST] Error:', err)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}

/**
 * DELETE /api/admin/whatsapp/groups — Delete a contact group
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Group ID is required.' }, { status: 400 })
    }

    await prisma.contactGroup.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Admin WhatsApp Groups DELETE] Error:', err)
    return NextResponse.json({ error: 'Failed to delete group' }, { status: 500 })
  }
}
