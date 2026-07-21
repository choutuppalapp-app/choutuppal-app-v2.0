'use client'

import { useEffect, useState } from 'react'
import { Image as ImageIcon, Megaphone, Plus, Clock, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { EmptyState } from './my-listings'
import type { Banner, Story } from '@prisma/client'

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
  stories: Story[]
}) {
  const activeBanners = banners.filter((b) => new Date(b.expiresAt) > new Date())
  const activeStories = stories.filter((s) => new Date(s.expiresAt) > new Date())

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">My Banners & Stories</h2>
        <p className="text-sm text-slate-500">Auto-delete after 24 hours. Countdown shown live.</p>
      </div>

      {/* Banners */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
            <Megaphone className="h-4 w-4 text-blue-500" /> Banner Ads
            <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">₹99/day</Badge>
          </h3>
          <Button size="sm" className="gap-1.5 gradient-brand text-white" onClick={() => toast.info('Use the Add Listing button → Banner to create one.')}>
            <Plus className="h-4 w-4" /> New Banner
          </Button>
        </div>

        {activeBanners.length === 0 ? (
          <EmptyState icon={Megaphone} title="No active banners" desc="Promote your business with a homepage banner — visible for 24 hours." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {banners.map((b) => (
              <div key={b.id} className="overflow-hidden rounded-2xl glass">
                <div className="relative aspect-[16/9]">
                  {b.imageUrl ? (
                     
                    <img src={b.imageUrl} alt={b.title ?? 'banner'} className="h-full w-full object-cover" />
                  ) : (
                    <div className="grid h-full w-full place-items-center gradient-brand p-4 text-center text-white">
                      <span className="text-sm font-bold">{b.title ?? 'Banner Ad'}</span>
                    </div>
                  )}
                  <span className="absolute right-3 top-3">
                    <CountdownPill expiresAt={b.expiresAt} />
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
          <Button size="sm" className="gap-1.5 gradient-brand text-white" onClick={() => toast.info('Upload a photo/video from the Add Listing → Story flow.')}>
            <Plus className="h-4 w-4" /> New Story
          </Button>
        </div>

        {activeStories.length === 0 ? (
          <EmptyState icon={ImageIcon} title="No active stories" desc="Share a 24-hour story — photos or short videos that auto-expire." />
        ) : (
          <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
            {stories.map((s) => (
              <div key={s.id} className="w-40 shrink-0 overflow-hidden rounded-2xl glass">
                <div className="relative aspect-[9/16]">
                  {s.mediaUrl ? (
                    s.mediaType === 'VIDEO' ? (
                      <video src={s.mediaUrl} className="h-full w-full object-cover" muted />
                    ) : (
                       
                      <img src={s.mediaUrl} alt={s.caption ?? 'story'} className="h-full w-full object-cover" />
                    )
                  ) : (
                    <div className="grid h-full w-full place-items-center gradient-brand p-3 text-center">
                      <span className="text-[11px] font-medium leading-tight text-white">{s.caption ?? 'Story'}</span>
                    </div>
                  )}
                  <span className="absolute left-2 top-2">
                    <CountdownPill expiresAt={s.expiresAt} />
                  </span>
                  {s.mediaType === 'VIDEO' ? (
                    <span className="absolute bottom-2 right-2 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white">
                      <Video className="h-3 w-3" />
                    </span>
                  ) : null}
                </div>
                <div className="p-2">
                  <p className="line-clamp-2 text-[11px] text-slate-600">{s.caption ?? 'Story'}</p>
                  <p className="mt-1 text-[10px] text-slate-400">{s.views} views</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
