'use client'
import Image from 'next/image';

import { useEffect, useState } from 'react'
import { Image as ImageIcon, Megaphone, Plus, Clock, Video, Eye, MessageCircle, Heart, Sparkles, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { EmptyState } from './my-listings'
import { StoryViewer, type StoryItem } from '@/components/stories/story-viewer'
import { StoryCreator } from '@/components/stories/story-creator'
import { BannerCreator } from './banner-creator'
import type { Banner, Story } from '@prisma/client'

type StoryWithCounts = Story & {
  _count: { storyViews: number; storyReplies: number; storyLikes: number }
}

const WA_TELUGU_MESSAGE = "నమస్కారం చౌటుప్పల్ యాప్, నా బిజినెస్ కోసం బ్యానర్/స్టోరీ అడ్ ఇవ్వాలనుకుంటున్నాను (₹99/day). దయచేసి మార్గనిర్దేశనం చేయండి."
const WA_PROMOTIONAL_URL = `https://wa.me/919494348175?text=${encodeURIComponent(WA_TELUGU_MESSAGE)}`

/** Returns a live hh:mm:ss countdown string for a target date. */
function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const ms = Math.max(0, target.getTime() - now)
  const h = Math.floor(ms / 3_600_000)
  const m = Math.floor((ms % 3_600_000) / 60_000)
  const s = Math.floor((ms % 60_000) / 1000)
  return {
    ms,
    label: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`,
    expired: ms <= 0,
  }
}

function CountdownPill({ expiresAt }: { expiresAt: Date }) {
  const { label, expired } = useCountdown(new Date(expiresAt))
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
      expired ? 'bg-slate-200 text-slate-600' : 'bg-amber-100 text-amber-700'
    }`}>
      <Clock className="h-3 w-3" />
      {expired ? 'Expired' : label}
    </span>
  )
}

export function MyBannersStories({
  banners,
  stories,
}: {
  banners: Banner[]
  stories: StoryWithCounts[]
}) {
  const activeBanners = banners.filter((b) => b.expiresAt && new Date(b.expiresAt) > new Date())
  const activeStories = stories.filter((s) => s.expiresAt && new Date(s.expiresAt) > new Date())
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [bannerOpen, setBannerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [storyList, setStoryList] = useState(stories)
  const [adsPaid, setAdsPaid] = useState(false)

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok && data?.settings) {
          const isPaid = data.settings.ads_paid === 'true' || data.settings.banner_free === 'false'
          setAdsPaid(isPaid)
        }
      })
      .catch(() => {})
  }, [])

  const storyItems: StoryItem[] = storyList.map((s) => ({
    id: s.id,
    mediaUrl: s.mediaUrl,
    mediaType: s.mediaType,
    caption: s.caption,
    views: s.views,
    expiresAt: s.expiresAt ? s.expiresAt.toISOString() : new Date().toISOString(),
    createdAt: s.createdAt.toISOString(),
    owner: { id: '', name: null, username: null, image: null },
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">My Banners & Stories</h2>
        <p className="text-sm text-slate-500">Auto-delete after 24 hours. Countdown shown live.</p>
      </div>

      {/* Paid Ads Monetization WhatsApp CTA */}
      {adsPaid ? (
        <div className="relative overflow-hidden rounded-3xl border border-amber-200/80 bg-gradient-to-br from-amber-500/10 via-blue-500/10 to-amber-500/5 p-6 shadow-xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-black uppercase tracking-wider text-amber-800">
                <Sparkles className="h-3.5 w-3.5" /> Premium Ad Promotion Plan
              </div>
              <h3 className="text-lg font-black tracking-tight text-slate-900 sm:text-xl">
                Promote your business via Banner/Story for ₹99/day
              </h3>
              <p className="text-xs font-medium text-slate-600 sm:text-sm">
                Get massive visibility across Choutuppal with top homepage placement and 24-hour video/image story reach. Contact our official team to launch your campaign instantly.
              </p>
            </div>
            <a
              href={WA_PROMOTIONAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-95"
            >
              <MessageCircle className="h-5 w-5 fill-white text-emerald-600" />
              Book Ad on WhatsApp (₹99/day)
            </a>
          </div>
        </div>
      ) : null}

      {/* Banners */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
            <Megaphone className="h-4 w-4 text-blue-500" /> Banner Ads
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
              {adsPaid ? '₹99/day' : 'Free (Early Bird)'}
            </Badge>
          </h3>
          {!adsPaid ? (
            <Button size="sm" className="gap-1.5 gradient-brand text-white" onClick={() => setBannerOpen(true)}>
              <Plus className="h-4 w-4" /> Promote Your Business
            </Button>
          ) : null}
        </div>

        {activeBanners.length === 0 ? (
          <EmptyState icon={Megaphone} title="No active banners" desc="Promote your business with a homepage banner — visible for 24 hours." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {banners.map((b) => (
              <div key={b.id} className="overflow-hidden rounded-2xl glass">
                <div className="relative aspect-[16/9]">
                  {b.imageUrl ? (
                    <Image width={800} height={800} loading="lazy" decoding="async" src={b.imageUrl} alt={b.title ?? 'banner'} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center gradient-brand p-4 text-center text-white">
                      <span className="text-sm font-bold">{b.title ?? 'Banner Ad'}</span>
                    </div>
                  )}
                  <span className="absolute right-3 top-3">
                    <CountdownPill expiresAt={b.expiresAt ?? new Date()} />
                  </span>
                </div>
                <div className="flex items-center justify-between p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{b.title ?? 'Untitled banner'}</p>
                    <p className="text-[11px] text-slate-500">Position: {b.position} · {b.clicks} clicks</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{b.position}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Stories */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
            <ImageIcon className="h-4 w-4 text-amber-500" /> Stories
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">24hr</Badge>
          </h3>
          {!adsPaid ? (
            <Button size="sm" className="gap-1.5 gradient-brand text-white" onClick={() => setCreatorOpen(true)}>
              <Plus className="h-4 w-4" /> New Story
            </Button>
          ) : null}
        </div>

        {activeStories.length === 0 ? (
          <EmptyState icon={ImageIcon} title="No active stories" desc="Share a 24-hour story — photos or short videos that auto-expire." />
        ) : (
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {storyList.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setViewerIndex(i)}
                className="w-44 shrink-0 overflow-hidden rounded-2xl glass text-left"
              >
                <div className="relative aspect-[9/16]">
                  {s.mediaUrl ? (
                    s.mediaType === 'VIDEO' ? (
                      <video src={s.mediaUrl} className="h-full w-full object-cover" muted />
                    ) : (
                      <Image width={800} height={800} loading="lazy" decoding="async" src={s.mediaUrl} alt={s.caption ?? 'story'} className="h-full w-full object-cover" />
                    )
                  ) : (
                    <div className="grid h-full w-full place-items-center gradient-brand p-3 text-center text-white">
                      <span className="text-xs font-semibold">{s.caption ?? 'Story'}</span>
                    </div>
                  )}
                  {s.mediaType === 'VIDEO' ? (
                    <span className="absolute left-2.5 top-2.5 grid h-6 w-6 place-items-center rounded-full bg-black/50 text-white backdrop-blur">
                      <Video className="h-3.5 w-3.5" />
                    </span>
                  ) : null}
                  <span className="absolute right-2.5 top-2.5">
                    <CountdownPill expiresAt={s.expiresAt ?? new Date()} />
                  </span>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white">
                    {s.caption ? <p className="line-clamp-2 text-xs font-medium">{s.caption}</p> : null}
                    <div className="mt-1 flex items-center justify-between text-[10px] text-slate-300">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {s.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {s._count?.storyLikes ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" /> {s._count?.storyReplies ?? 0}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {!adsPaid ? (
        <>
          {/* Creator Modals */}
          <StoryCreator
            open={creatorOpen}
            onOpenChange={setCreatorOpen}
            onCreated={(newStory) => {
              const fullStory: StoryWithCounts = {
                id: newStory.id,
                mediaUrl: newStory.mediaUrl,
                mediaType: newStory.mediaType,
                caption: newStory.caption,
                link: (newStory as any).link ?? null,
                views: newStory.views ?? 0,
                createdAt: new Date(newStory.createdAt),
                expiresAt: new Date(newStory.expiresAt),
                ownerId: newStory.owner.id || '',
                isActive: true,
                paymentId: null,
                orderId: null,
                _count: { storyViews: 0, storyReplies: 0, storyLikes: 0 },
              }
              setStoryList((prev) => [fullStory, ...prev])
              setCreatorOpen(false)
            }}
          />

          <BannerCreator
            open={bannerOpen}
            onOpenChange={setBannerOpen}
            onCreated={() => {
              setBannerOpen(false)
              window.location.reload()
            }}
          />
        </>
      ) : null}

      {/* Viewer Modal */}
      {viewerIndex !== null ? (
        <StoryViewer
          stories={storyItems}
          startIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      ) : null}
    </div>
  )
}
