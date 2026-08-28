import { safeDbQuery } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rules = (await (async () => { try { return await prisma.triggerRule.findMany({
      orderBy: { createdAt: 'desc' },
    }); } catch(e) { return [] as any; } })())

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

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    let id = searchParams.get('id')

    if (!id) {
      try {
        const body = await request.json()
        id = body.id
      } catch {
        // ignore body parse error
      }
    }

    if (!id) {
      return NextResponse.json({ error: 'Trigger rule ID is required' }, { status: 400 })
    }

    await prisma.triggerRule.delete({
      where: { id },
    })

    return NextResponse.json({ ok: true, message: 'Trigger rule deleted' })
  } catch (err) {
    console.error('[CRM Triggers DELETE API] Error:', err)
    return NextResponse.json({ error: 'Failed to delete trigger rule' }, { status: 500 })
  }
}
