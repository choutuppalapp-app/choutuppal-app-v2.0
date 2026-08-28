import { safeDbQuery } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const revalidate = 3600

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const groups = (await (async () => { try { return await prisma.contactGroup.findMany({
      include: {
        contacts: {
          select: { phone: true, name: true, userType: true },
        },
        _count: {
          select: { contacts: true },
        },
      },
      orderBy: { name: 'asc' },
    }); } catch(e) { return [] as any; } })())

    return NextResponse.json({ ok: true, groups })
  } catch (err) {
    console.error('[Admin WhatsApp Groups GET] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch contact groups' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, phoneNumbers } = body

    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Group name is required.' }, { status: 400 })
    }

    const cleanPhones = Array.isArray(phoneNumbers)
      ? phoneNumbers.map((p: string) => p.replace(/\D/g, '')).filter(Boolean)
      : []

    const group = await prisma.contactGroup.upsert({
      where: { name: name.trim() },
      update: {
        contacts: {
          connect: cleanPhones.map((phone) => ({ phone })),
        },
      },
      create: {
        name: name.trim(),
        contacts: {
          connect: cleanPhones.map((phone) => ({ phone })),
        },
      },
      include: {
        contacts: { select: { phone: true } },
        _count: { select: { contacts: true } },
      },
    })

    return NextResponse.json({ ok: true, group })
  } catch (err) {
    console.error('[Admin WhatsApp Groups POST] Error:', err)
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
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
