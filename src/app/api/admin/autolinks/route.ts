import { safeDbQuery } from '@/lib/prisma';
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const autoLinks = (await (async () => { try { return await prisma.autoLink.findMany({
      orderBy: { createdAt: 'desc' },
    }); } catch(e) { return [] as any; } })())

    return NextResponse.json({ ok: true, autoLinks })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch auto links' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any)?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { keyword, url, type } = body

    if (!keyword?.trim() || !url?.trim()) {
      return NextResponse.json({ error: 'Keyword and URL are required' }, { status: 400 })
    }

    const autoLink = await prisma.autoLink.create({
      data: {
        keyword: keyword.trim(),
        url: url.trim(),
        type: type === 'internal' ? 'internal' : 'affiliate',
      },
    })

    return NextResponse.json({ ok: true, autoLink })
  } catch (error: any) {
    if (error?.code === 'P2002') {
      return NextResponse.json({ error: 'Keyword already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create auto link' }, { status: 500 })
  }
}
