'use client'
import Image from 'next/image'

import { useEffect, useState } from 'react'
import { Image as ImageIcon, Megaphone, Plus, Clock, Video, Eye, MessageCircle, Heart, Sparkles, Send, ExternalLink } from 'lucide-react'
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

const WA_TELUGU_MESSAGE = "నమస్కారం చౌటుప్పల్ యాప్, నా బిజినెస్ కోసం బ్యానర్/స్టోరీ అడ్ ఇవ్వాలనుకుంటున్నాను. దయచేసి మార్గనిర్దేశనం చేయండి."
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
  const activeBanners = banners.filter((b) => !b.expiresAt || new Date(b.expiresAt) > new Date())
  const activeStories = stories.filter((s) => !s.expiresAt || new Date(s.expiresAt) > new Date())
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [bannerOpen, setBannerOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [bannerList, setBannerList] = useState(banners)
  const [storyList, setStoryList] = useState(stories)

  useEffect(() => {
    setBannerList(banners)
  }, [banners])

  useEffect(() => {
    setStoryList(stories)
  }, [stories])

  const storyItems: StoryItem[] = storyList.map((s) => ({
    id: s.id,
    mediaUrl: s.mediaUrl,
    mediaType: s.mediaType,
    caption: s.caption,
    views: s.views,
    expiresAt: s.expiresAt ? new Date(s.expiresAt).toISOString() : new Date().toISOString(),
    createdAt: new Date(s.createdAt).toISOString(),
    owner: { id: '', name: null, username: null, image: null },
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Banners &amp; Stories (బ్యానర్లు &amp; స్టోరీలు)</h2>
          <p className="text-sm text-slate-500">లింక్ (URL) ద్వారా డైరెక్ట్‌గా పోస్ట్ చేయండి. 24 గంటలు లైవ్ లో ఉంటాయి.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="gap-1.5 gradient-brand text-white shadow-sm" onClick={() => setBannerOpen(true)}>
            <Plus className="h-4 w-4" /> Add Banner Link
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50" onClick={() => setCreatorOpen(true)}>
            <Plus className="h-4 w-4" /> Add Story Link
          </Button>
        </div>
      </div>

      {/* Promotional WhatsApp Banner Box */}
      <div className="relative overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-amber-500/5 p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1 max-w-xl">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
              <MessageCircle className="h-3.5 w-3.5" /> Direct WhatsApp Support &amp; Promotion
            </div>
            <h3 className="text-base font-black tracking-tight text-slate-900 sm:text-lg">
              బ్యానర్ లేదా స్టోరీ యాడ్ ప్రమోషన్ కోసం WhatsApp లో సంప్రదించండి
            </h3>
            <p className="text-xs text-slate-600">
              చౌటుప్పల్ అంతటా 10,000+ కస్టమర్లను చేరుకోవడానికి మా అధికారిక WhatsApp నంబర్‌కి మెసేజ్ చేయండి.
            </p>
          </div>
          <a
            href={WA_PROMOTIONAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition"
          >
            <MessageCircle className="h-4 w-4 fill-white text-emerald-600" />
            WhatsApp లో అడ్ బుక్ చేయండి
          </a>
        </div>
      </div>

      {/* Banners Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
            <Megaphone className="h-4 w-4 text-blue-500" /> My Active Banner Ads
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100">Live 24h</Badge>
          </h3>
          <Button size="sm" variant="ghost" className="text-xs font-semibold text-blue-600" onClick={() => setBannerOpen(true)}>
            + Add New Banner
          </Button>
        </div>

        {bannerList.length === 0 ? (
          <EmptyState
            icon={Megaphone}
            title="No active banners"
            desc="Promote your business with a homepage banner — visible for 24 hours across Choutuppal."
            action={
              <Button onClick={() => setBannerOpen(true)} className="gap-1.5 gradient-brand text-white shadow-sm">
                <Plus className="h-4 w-4" /> Add Banner (Link Based)
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {bannerList.map((b) => {
              const bannerWaUrl = `https://wa.me/919494348175?text=${encodeURIComponent(
                `నమస్కారం చౌటుప్పల్ యాప్, నా బ్యానర్ గురించి విచారణ: ${b.title || 'హోమ్‌పేజ్ బ్యానర్'}`
              )}`

              return (
                <div key={b.id} className="overflow-hidden rounded-2xl glass border border-slate-200/80 flex flex-col justify-between">
                  <div>
                    <div className="relative aspect-[16/9]">
                      {b.imageUrl ? (
                        <Image
                          width={800}
                          height={450}
                          loading="lazy"
                          decoding="async"
                          src={b.imageUrl}
                          alt={b.title ?? 'banner'}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center gradient-brand p-4 text-center text-white">
                          <span className="text-sm font-bold">{b.title ?? 'Banner Ad'}</span>
                        </div>
                      )}
                      <span className="absolute right-3 top-3">
                        <CountdownPill expiresAt={b.expiresAt ? new Date(b.expiresAt) : new Date()} />
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-bold text-slate-900">{b.title ?? 'Special Banner Offer'}</p>
                      <p className="text-[11px] text-slate-500">Position: {b.position} · {b.clicks || 0} clicks</p>
                    </div>
                  </div>

                  {/* Banner Card Footer Actions */}
                  <div className="p-3 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 mt-2">
                    <Badge variant="outline" className="text-[10px]">{b.position}</Badge>
                    <a
                      href={bannerWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
                    >
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-600" />
                      WhatsApp Inquiry
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Stories Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
            <ImageIcon className="h-4 w-4 text-amber-500" /> My Active Stories
            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">24hr Auto-Expire</Badge>
          </h3>
          <Button size="sm" variant="ghost" className="text-xs font-semibold text-amber-600" onClick={() => setCreatorOpen(true)}>
            + Add New Story
          </Button>
        </div>

        {storyList.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No active stories"
            desc="Share a 24-hour story with photos or short videos — auto-deletes after 24 hours."
            action={
              <Button onClick={() => setCreatorOpen(true)} className="gap-1.5 gradient-brand text-white shadow-sm">
                <Plus className="h-4 w-4" /> Add Story (Link Based)
              </Button>
            }
          />
        ) : (
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {storyList.map((s, i) => {
              const storyWaUrl = `https://wa.me/919494348175?text=${encodeURIComponent(
                `నమస్కారం చౌటుప్పల్ యాప్, నా స్టోరీ గురించి సంప్రదించాలనుకుంటున్నాను: ${s.caption || '24 గంటల స్టోరీ'}`
              )}`

              return (
                <div key={s.id} className="w-48 shrink-0 overflow-hidden rounded-2xl glass border border-slate-200/80 flex flex-col justify-between">
                  <button
                    onClick={() => setViewerIndex(i)}
                    className="w-full text-left"
                  >
                    <div className="relative aspect-[9/16]">
                      {s.mediaUrl ? (
                        s.mediaType === 'VIDEO' ? (
                          <video src={s.mediaUrl} className="h-full w-full object-cover" muted />
                        ) : (
                          <Image
                            width={400}
                            height={700}
                            loading="lazy"
                            decoding="async"
                            src={s.mediaUrl}
                            alt={s.caption ?? 'story'}
                            className="h-full w-full object-cover"
                          />
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
                        <CountdownPill expiresAt={s.expiresAt ? new Date(s.expiresAt) : new Date()} />
                      </span>
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 text-white">
                        {s.caption ? <p className="line-clamp-2 text-xs font-medium">{s.caption}</p> : null}
                        <div className="mt-1 flex items-center justify-between text-[10px] text-slate-300">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {s.views || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="h-3 w-3" /> {s._count?.storyLikes ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>

                  <div className="p-2 border-t border-slate-100 bg-white/70">
                    <a
                      href={storyWaUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-600 px-2 py-1.5 text-[11px] font-bold text-white hover:bg-emerald-700 transition shadow-xs"
                    >
                      <MessageCircle className="h-3 w-3" />
                      WhatsApp Inquiry
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

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
          fetch('/api/banners')
            .then((r) => r.json())
            .then((j) => {
              if (j.banners && Array.isArray(j.banners)) {
                setBannerList(j.banners)
              }
            })
            .catch(() => {})
        }}
      />

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
