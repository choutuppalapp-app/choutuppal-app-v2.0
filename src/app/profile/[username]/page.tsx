import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isAdminRole } from '@/lib/session'
import { ProfileView } from '@/components/community/profile-view'

export const dynamic = 'force-dynamic'

const SITE_URL = (process.env.NEXTAUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')

/** Fetch a user by username, with viewer-based visibility checks. */
async function getProfile(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    select: {
      id: true, name: true, username: true, bio: true, image: true,
      coverImage: true, isPublic: true, 
      villageId: true, village: { select: { name: true } },
      facebookUrl: true, instagramUrl: true, youtubeUrl: true, twitterUrl: true,
      createdAt: true,
    },
  })
  if (!user) return null

  const viewer = await getCurrentUser()
  const isOwner = viewer?.id === user.id
  const isAdmin = viewer ? isAdminRole(viewer.role) : false

  // Private profile: only owner or admin can see it.
  const isPrivate = !user.isPublic
  const canView = !isPrivate || isOwner || isAdmin

  return { user, isOwner, isAdmin, isPrivate, canView, viewerId: viewer?.id ?? null }
}

/** SEO / WhatsApp rich preview metadata. Absolute URLs. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>
}): Promise<Metadata> {
  const { username } = await params
  const data = await getProfile(username)
  if (!data || !data.canView) {
    return {
      title: 'Profile not found',
      robots: { index: false, follow: false },
    }
  }
  const { user } = data
  const url = `${SITE_URL}/profile/${user.username}`
  const image = user.image
    ? user.image.startsWith('http')
      ? user.image
      : `${SITE_URL}${user.image}`
    : undefined
  const title = `${user.name ?? user.username} | Choutuppal App`
  const description = user.bio ?? `Profile of ${user.name ?? user.username} on Choutuppal App.`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'Choutuppal App',
      type: 'profile',
      images: image ? [{ url: image, alt: user.name ?? user.username ?? 'Profile' }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const data = await getProfile(username)
  if (!data) notFound()

  // If private and viewer can't see it, show the private state (not 404).
  if (!data.canView) {
    return <ProfileView profile={null} username={username} />
  }

  // Fetch the profile owner's content (posts, listings, real estate).
  const [posts, listings, realEstates] = await Promise.all([
    prisma.communityPost.findMany({
      where: { authorId: data.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        _count: { select: { comments: true } },
        likesRel: data.viewerId
          ? { where: { userId: data.viewerId }, select: { id: true } }
          : false,
      },
    }),
    prisma.listing.findMany({
      where: { ownerId: data.user.id, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, slug: true, title: true, description: true,
        coverImage: true, logo: true, views: true, isFeatured: true,
        category: { select: { name: true } }, village: { select: { name: true } },
      },
    }),
    prisma.realEstate.findMany({
      where: { ownerId: data.user.id, status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, slug: true, title: true, type: true, listingType: true,
        price: true, areaSqft: true, bedrooms: true, coverImage: true,
        village: { select: { name: true } },
      },
    }),
  ])

  const serialisedPosts = posts.map((p) => ({
    id: p.id,
    content: p.content,
    likes: p.likes,
    commentCount: p._count.comments,
    likedByMe: data.viewerId ? p.likesRel.length > 0 : false,
    createdAt: p.createdAt.toISOString(),
  }))

  return (
    <ProfileView
      profile={{
        ...data.user,
        posts: serialisedPosts,
        listings,
        realEstates,
        isOwner: data.isOwner,
        isAdmin: data.isAdmin,
      }}
      username={username}
    />
  )
}
