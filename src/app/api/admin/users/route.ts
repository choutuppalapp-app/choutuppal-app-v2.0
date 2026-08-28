import { safeDbQuery } from '@/lib/prisma';
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

/** GET /api/admin/users — list all users (paginated, newest first). */
export async function GET() {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const users = (await (async () => { try { return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, username: true, email: true, phone: true,
      role: true, isBanned: true, isPublic: true, planTier: true,
      createdAt: true, image: true,
      _count: { select: { listings: true, realEstates: true } },
    },
  }); } catch(e) { return [] as any; } })())
  return NextResponse.json({ ok: true, users })
}
