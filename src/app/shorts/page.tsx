import { prisma } from '@/lib/prisma'
import { ShortsFeed } from '@/components/shorts/shorts-feed'

export const dynamic = 'force-dynamic'

export default async function ShortsPage() {
  const shorts = await prisma.short.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      owner: { select: { name: true, username: true } },
    },
  })

  return <ShortsFeed shorts={shorts} />
}
