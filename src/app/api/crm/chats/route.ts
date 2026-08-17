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

    // Fetch all contacts
    const contacts = await prisma.whatsAppContact.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    // Fetch latest logs for each contact
    const chatList = await Promise.all(
      contacts.map(async (c) => {
        const lastLog = await prisma.whatsAppLog.findFirst({
          where: { phone: c.phone },
          orderBy: { createdAt: 'desc' },
        })

        return {
          id: c.id,
          phone: c.phone,
          name: c.name || 'WhatsApp Lead',
          userType: c.userType || 'customer',
          tag: c.tag || 'General',
          dateOfBirth: c.dateOfBirth,
          lastMessage: lastLog?.message || 'Started conversation',
          lastMessageAt: lastLog?.createdAt || c.createdAt,
          lastDirection: lastLog?.direction || 'inbound',
          chatState: c.chatState || 'none',
        }
      }),
    )

    // Sort by last message timestamp descending
    chatList.sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    )

    return NextResponse.json({ chats: chatList })
  } catch (err) {
    console.error('[CRM Chats API] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 })
  }
}
