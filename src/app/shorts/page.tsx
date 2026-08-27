import { prisma, safeDbQuery } from '@/lib/prisma'
import { ShortsFeed } from '@/components/shorts/shorts-feed'

export const revalidate = 3600

export default async function ShortsPage() {
  const shorts = await safeDbQuery(
    () =>
      prisma.short.findMany({
        orderBy: { createdAt: 'desc' },
        take: 30,
        select: {
          id: true,
          videoUrl: true,
          platform: true,
          thumbnail: true,
          title: true,
          views: true,
          likes: true,
          youtubeId: true,
          createdAt: true,
          owner: { select: { name: true, username: true, image: true } },
        },
      }),
    [],
  )

  return <ShortsFeed shorts={shorts} />
}
