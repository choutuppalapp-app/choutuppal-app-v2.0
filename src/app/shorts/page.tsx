import { prisma } from '@/lib/prisma'
import { ShortsFeed } from '@/components/shorts/shorts-feed'

export const dynamic = 'force-dynamic'

export default async function ShortsPage() {
  let shorts: any[] = []
  try {
    shorts = await prisma.short.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { name: true, username: true } },
      },
    })
  } catch (err) {
    console.error('[ShortsPage] DB query error:', err)
  }

  return <ShortsFeed shorts={shorts} />
}
