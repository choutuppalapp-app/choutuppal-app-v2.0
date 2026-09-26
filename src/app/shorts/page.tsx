import { prisma, safeDbQuery } from '@/lib/prisma'
import { ShortsFeed } from '@/components/shorts/shorts-feed'
import { getOfflineShorts } from '@/lib/offline-data'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export default async function ShortsPage() {
  const dbShorts = await safeDbQuery(
    () =>
      prisma.short.findMany({
        orderBy: { createdAt: 'desc' },
        take: 200,
        select: {
          id: true,
          videoUrl: true,
          platform: true,
          thumbnail: true,
          title: true,
          description: true,
          views: true,
          likes: true,
          youtubeId: true,
          createdAt: true,
          owner: { select: { name: true, username: true, image: true } },
        },
      }),
    [],
  )

  const map = new Map<string, any>()
  if (Array.isArray(dbShorts)) {
    dbShorts.forEach((s) => s?.id && map.set(s.id, s))
  }
  const offline = getOfflineShorts()
  if (Array.isArray(offline)) {
    offline.forEach((s) => s?.id && map.set(s.id, s))
  }

  const shorts = Array.from(map.values())

  return <ShortsFeed shorts={shorts} />
}
