import { safeDbQuery } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

/**
 * GET /api/community/people
 * Public users directory ("People you might know"). Only isPublic === true,
 * non-banned users. Excludes the current viewer. Optional ?q= search.
 */
export async function GET(request: NextRequest) {
  const viewer = await getCurrentUser()
  const q = request.nextUrl.searchParams.get('q')?.trim()

  const people = (await (async () => { try { return await prisma.user.findMany({
    where: {
      isPublic: true,
      isBanned: false,
      ...(viewer ? { id: { not: viewer.id } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { username: { contains: q } },
              { bio: { contains: q } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 24,
    select: {
      id: true,
      name: true,
      username: true,
      image: true,
      bio: true,
      
      village: { select: { name: true } },
    },
  }); } catch(e) { return [] as any; } })())
  return NextResponse.json({ ok: true, people })
}
