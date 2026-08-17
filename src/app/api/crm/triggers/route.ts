import { NextRequest, NextResponse } from 'next/server'
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

    const rules = await prisma.triggerRule.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ ok: true, rules })
  } catch (err) {
    console.error('[CRM Triggers GET API] Error:', err)
    return NextResponse.json({ error: 'Failed to fetch trigger rules' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { keyword, templateId, replyText } = body

    if (!keyword) {
      return NextResponse.json({ error: 'Keyword is required' }, { status: 400 })
    }

    const cleanKeyword = keyword.trim().toLowerCase()

    const rule = await prisma.triggerRule.upsert({
      where: { keyword: cleanKeyword },
      update: { templateId, replyText },
      create: { keyword: cleanKeyword, templateId, replyText },
    })

    return NextResponse.json({ ok: true, rule })
  } catch (err) {
    console.error('[CRM Triggers POST API] Error:', err)
    return NextResponse.json({ error: 'Failed to save trigger rule' }, { status: 500 })
  }
}
