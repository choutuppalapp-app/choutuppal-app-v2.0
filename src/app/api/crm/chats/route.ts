import { safeDbQuery } from '@/lib/prisma';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 1. Fetch unique phones from WhatsAppLog
    const logPhones = (await (async () => { try { return await prisma.whatsAppLog.findMany({
      select: { phone: true },
      distinct: ['phone'],
    }); } catch(e) { return [] as any; } })())

    // 2. Fetch unique phones from WhatsAppContact
    const contactPhones = (await (async () => { try { return await prisma.whatsAppContact.findMany({
      select: { phone: true },
    }); } catch(e) { return [] as any; } })())

    // Combine & deduplicate phone numbers
    const allPhones = Array.from(
      new Set([
        ...logPhones.map((l) => l.phone),
        ...contactPhones.map((c) => c.phone),
      ]),
    )

    // 3. For each phone, fetch latest log & contact metadata
    const chats = await Promise.all(
      allPhones.map(async (phone) => {
        const lastLog = await prisma.whatsAppLog.findFirst({
          where: { phone },
          orderBy: { createdAt: 'desc' },
        })

        const contact = await prisma.whatsAppContact.findUnique({
          where: { phone },
        })

        const lastMessageAt = lastLog?.createdAt || contact?.createdAt || new Date()

        return {
          id: contact?.id || phone,
          phone,
          name: contact?.name || 'WhatsApp Lead',
          userType: contact?.userType || 'customer',
          tag: contact?.tag || 'General',
          dateOfBirth: contact?.dateOfBirth || null,
          lastMessage: lastLog?.message || 'Started conversation',
          lastMessageAt: lastMessageAt.toISOString(),
          timestamp: lastMessageAt.toISOString(),
          lastDirection: (lastLog?.direction || 'inbound') as 'inbound' | 'outbound',
          chatState: contact?.chatState || 'none',
          unread: lastLog?.direction === 'inbound' ? 1 : 0,
        }
      }),
    )

    // Sort by latest timestamp descending
    chats.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime())

    return NextResponse.json({ ok: true, chats, conversations: chats })
  } catch (err) {
    console.error('[CRM Chats API] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 })
  }
}
