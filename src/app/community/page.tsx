import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { CommunityFeed } from '@/components/community/community-feed'

export const dynamic = 'force-dynamic'

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Community | Choutuppal App',
  description:
    'Connect with people across Choutuppal. Share posts, local news and updates in the community feed.',
  alternates: { canonical: `${SITE_URL}/community` },
  openGraph: {
    title: 'Choutuppal Community',
    description: 'Share posts, local news and updates in the Choutuppal community feed.',
    url: `${SITE_URL}/community`,
    siteName: 'Choutuppal App',
    type: 'website',
  },
}

export default async function CommunityPage() {
  const viewer = await getCurrentUser()

  // Fetch initial posts (public authors only) + people directory in parallel.
  const [posts, people] = await Promise.all([
    prisma.communityPost.findMany({
      where: { author: { isPublic: true, isBanned: false } },
      orderBy: { createdAt: 'desc' },
      take: 30,
      include: {
        author: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
            bio: true,
            planTier: true,
          },
        },
        _count: { select: { comments: true } },
        likesRel: viewer ? { where: { userId: viewer.id }, select: { id: true } } : false,
      },
    }),
    prisma.user.findMany({
      where: {
        isPublic: true,
        isBanned: false,
        ...(viewer ? { id: { not: viewer.id } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        bio: true,
        planTier: true,
        village: { select: { name: true } },
      },
    }),
  ])

  const serialisedPosts = posts.map((p) => ({
    id: p.id,
    content: p.content,
    likes: p.likes,
    commentCount: p._count.comments,
    likedByMe: viewer ? p.likesRel.length > 0 : false,
    createdAt: p.createdAt.toISOString(),
    author: p.author,
  }))

  return (
    <CommunityFeed
      initialPosts={serialisedPosts}
      initialPeople={people}
      isLoggedIn={!!viewer}
      viewerUsername={viewer?.username ?? null}
    />
  )
}
