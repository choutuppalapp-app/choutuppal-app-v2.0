'use client'

import Link from 'next/link'
import {
  ChevronLeft,
  Lock,
  Heart,
  MessageCircle,
  MapPin,
  Store,
  Home,
  Eye,
  IndianRupee,
  BedDouble,
  Maximize,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

interface ProfilePost {
  id: string
  content: string
  likes: number
  commentCount: number
  likedByMe: boolean
  createdAt: string
}
interface ProfileListing {
  id: string
  slug: string
  title: string
  description: string
  coverImage: string | null
  logo: string | null
  views: number
  isFeatured: boolean
  category: { name: string } | null
  village: { name: string } | null
}
interface ProfileRE {
  id: string
  slug: string
  title: string
  type: string
  listingType: string
  price: number
  areaSqft: number | null
  bedrooms: number | null
  coverImage: string | null
  village: { name: string } | null
}
interface Profile {
  id: string
  name: string | null
  username: string | null
  bio: string | null
  image: string | null
  coverImage: string | null
  isPublic: boolean
  facebookUrl?: string | null
  instagramUrl?: string | null
  youtubeUrl?: string | null
  twitterUrl?: string | null
  villageId: string | null
  village: { name: string } | null
  createdAt: Date
  posts: ProfilePost[]
  listings: ProfileListing[]
  realEstates: ProfileRE[]
  isOwner: boolean
  isAdmin: boolean
}

export function ProfileView({
  profile,
  username,
}: {
  profile: Profile | null
  username: string
}) {
  // Private profile state
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50">
        <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-4xl items-center gap-3 px-3 sm:px-4">
            <Link href="/community" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200">
              <ChevronLeft className="h-4 w-4" />
            </Link>
            <span className="font-bold text-slate-900">@{username}</span>
          </div>
        </header>
        <main className="mx-auto max-w-md px-4 py-20 text-center">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-brand-soft text-blue-600">
            <Lock className="h-8 w-8" />
          </span>
          <h1 className="mt-4 text-xl font-black text-slate-900">This profile is private</h1>
          <p className="mt-1 text-sm text-slate-500">
            @{username} has set their profile to private. Only they and admins can view it.
          </p>
          <Link
            href="/community"
            className="mt-6 inline-block rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-white"
          >
            Back to Community
          </Link>
        </main>
      </div>
    )
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-12">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-4xl items-center gap-3 px-3 sm:px-4">
          <Link href="/community" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-base font-black text-white">
            C
          </span>
          <span className="truncate text-sm font-bold text-slate-900">
            {profile.name ?? profile.username}
          </span>
          {profile.isOwner ? (
            <Badge className="ml-auto bg-blue-100 text-blue-700 hover:bg-blue-100">Your Profile</Badge>
          ) : null}
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-3 py-6 sm:px-4">
        {/* Cover + Avatar (portfolio style) */}
        <div className="overflow-hidden rounded-3xl glass">
          <div className="relative h-40 w-full sm:h-52">
            {profile.coverImage ? (
               
              <img loading="lazy" decoding="async" src={profile.coverImage} alt="cover" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full gradient-brand" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          </div>
          <div className="px-5 pb-5">
            <div className="-mt-12 flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4 sm:-mt-16">
              <Avatar className="h-24 w-24 shrink-0 border-4 border-white shadow-lg sm:h-32 sm:w-32">
                <AvatarImage src={profile.image ?? undefined} />
                <AvatarFallback className="gradient-brand text-3xl font-black text-white sm:text-4xl">
                  {(profile.name ?? profile.username ?? 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                    {profile.name ?? profile.username}
                  </h1>
                </div>
                <p className="text-sm text-slate-500">@{profile.username}</p>
                {profile.village ? (
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                    <MapPin className="h-3 w-3" /> {profile.village.name}
                  </p>
                ) : null}
              </div>
            </div>
            {profile.bio ? (
              <p className="font-telugu mt-3 text-sm leading-relaxed text-slate-700">
                {profile.bio}
              </p>
            ) : null}

            {/* Social Media Links */}
            {profile.facebookUrl || profile.instagramUrl || profile.youtubeUrl || profile.twitterUrl ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {profile.facebookUrl ? (
                  <a href={profile.facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-100">
                    Facebook
                  </a>
                ) : null}
                {profile.instagramUrl ? (
                  <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border border-pink-200 bg-pink-50 px-3 py-1 text-xs font-semibold text-pink-600 transition hover:bg-pink-100">
                    Instagram
                  </a>
                ) : null}
                {profile.youtubeUrl ? (
                  <a href={profile.youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-100">
                    YouTube
                  </a>
                ) : null}
                {profile.twitterUrl ? (
                  <a href={profile.twitterUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">
                    X / Twitter
                  </a>
                ) : null}
              </div>
            ) : null}

            <div className="mt-3 flex gap-4 text-xs text-slate-500">
              <span><strong className="text-slate-900">{profile.posts.length}</strong> Posts</span>
              <span><strong className="text-slate-900">{profile.listings.length}</strong> Listings</span>
              <span><strong className="text-slate-900">{profile.realEstates.length}</strong> Properties</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="mt-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="posts" className="gap-1.5 text-xs sm:text-sm">
              <MessageCircle className="h-3.5 w-3.5" /> Posts
            </TabsTrigger>
            <TabsTrigger value="listings" className="gap-1.5 text-xs sm:text-sm">
              <Store className="h-3.5 w-3.5" /> Listings
            </TabsTrigger>
            <TabsTrigger value="realestate" className="gap-1.5 text-xs sm:text-sm">
              <Home className="h-3.5 w-3.5" /> Real Estate
            </TabsTrigger>
          </TabsList>

          {/* Posts tab */}
          <TabsContent value="posts" className="space-y-3">
            {profile.posts.length === 0 ? (
              <EmptyState icon={MessageCircle} text="No posts yet" />
            ) : (
              profile.posts.map((p) => {
                return (
                  <div key={p.id} className="rounded-2xl glass p-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400">{timeAgo(p.createdAt)}</span>
                    </div>
                    <p className="font-telugu mt-2 whitespace-pre-wrap text-sm text-slate-800">{p.content}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {p.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> {p.commentCount}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </TabsContent>

          {/* Listings tab */}
          <TabsContent value="listings" className="space-y-3">
            {profile.listings.length === 0 ? (
              <EmptyState icon={Store} text="No listings yet" />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.listings.map((l) => (
                  <Link
                    key={l.id}
                    href={`/business/${l.slug}`}
                    className="hover-lift flex gap-3 overflow-hidden rounded-2xl glass p-3"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                      {l.coverImage || l.logo ? (
                         
                        <img loading="lazy" decoding="async" src={(l.coverImage || l.logo)!} alt={l.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center gradient-brand text-xl font-black text-white">
                          {l.title.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-bold text-slate-900">{l.title}</h3>
                      <p className="line-clamp-1 text-xs text-slate-500">{l.description}</p>
                      <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="flex items-center gap-0.5"><Eye className="h-3 w-3" /> {l.views}</span>
                        <span>{l.category?.name}</span>
                      </div>
                    </div>
                    <ExternalLink className="h-4 w-4 shrink-0 self-center text-slate-300" />
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Real Estate tab */}
          <TabsContent value="realestate" className="space-y-3">
            {profile.realEstates.length === 0 ? (
              <EmptyState icon={Home} text="No properties yet" />
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {profile.realEstates.map((r) => (
                  <Link
                    key={r.id}
                    href={`/business/${r.slug}`}
                    className="hover-lift overflow-hidden rounded-2xl glass"
                  >
                    <div className="relative aspect-[16/10]">
                      {r.coverImage ? (
                         
                        <img loading="lazy" decoding="async" src={r.coverImage} alt={r.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-gradient-to-br from-blue-500 to-amber-400" />
                      )}
                      <Badge className={`absolute left-2 top-2 ${r.listingType === 'SALE' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                        For {r.listingType === 'SALE' ? 'Sale' : 'Rent'}
                      </Badge>
                    </div>
                    <div className="p-3">
                      <h3 className="truncate font-bold text-slate-900">{r.title}</h3>
                      <div className="mt-1 flex items-baseline gap-1 text-blue-700">
                        <IndianRupee className="h-3.5 w-3.5" />
                        <span className="text-base font-black">
                          {new Intl.NumberFormat('en-IN').format(r.price).replace('₹', '')}
                          {r.listingType === 'RENT' ? '/mo' : ''}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-slate-500">
                        {r.bedrooms ? <span className="flex items-center gap-0.5"><BedDouble className="h-3 w-3" /> {r.bedrooms} BHK</span> : null}
                        {r.areaSqft ? <span className="flex items-center gap-0.5"><Maximize className="h-3 w-3" /> {r.areaSqft}</span> : null}
                        <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {r.village?.name ?? '—'}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

function EmptyState({ icon: Icon, text }: { icon: typeof Home; text: string }) {
  return (
    <div className="rounded-3xl glass p-10 text-center">
      <Icon className="mx-auto h-10 w-10 text-slate-300" />
      <p className="mt-2 text-sm text-slate-500">{text}</p>
    </div>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const s = Math.floor(diff / 1000)
  if (s < 60) return 'just now'
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}
