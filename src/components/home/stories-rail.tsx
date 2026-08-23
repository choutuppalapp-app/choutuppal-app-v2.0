'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Story } from '@prisma/client'
import { StoryCreator } from '@/components/stories/story-creator'

interface StoriesRailProps {
  stories: (Story & {
    owner: { username: string | null; name: string | null; image: string | null }
  })[]
  viewer: {
    isLoggedIn: boolean
    isPremium: boolean
  }
}

export function StoriesRail({ stories, viewer }: StoriesRailProps) {
  const router = useRouter()
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)

  const storyItems = stories.map((s) => ({
    id: s.id,
    mediaUrl: s.mediaUrl,
    mediaType: s.mediaType,
    caption: s.caption,
    views: s.views,
    expiresAt: s.expiresAt.toISOString(),
    createdAt: s.createdAt.toISOString(),
    owner: {
      id: '',
      name: s.owner.name,
      username: s.owner.username,
      image: s.owner.image,
    },
  }))

  function handleAddClick() {
    if (!viewer.isLoggedIn) {
      toast.info('స్టోరీ పోస్ట్ చేయడానికి దయచేసి లాగిన్ అవ్వండి')
      router.push('/login')
      return
    }
    if (!viewer.isPremium) {
      toast.error('స్టోరీలు పోస్ట్ చేయడం కేవలం ప్రీమియం యూజర్లకే. ఇప్పుడే అప్‌గ్రేడ్ చేయండి!', {
        duration: 5000,
        action: { label: 'Upgrade', onClick: () => router.push('/dashboard') },
      })
      return
    }
    setCreatorOpen(true)
  }

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
          Stories
        </h2>
        <span className="text-[11px] font-semibold text-amber-600">Premium</span>
      </div>

      {/* Container: left-aligned, horizontal scroll, no wrap */}
      <div
        className="no-scrollbar mt-3 flex w-full max-w-full justify-start gap-4 overflow-x-auto px-4 pb-3 flex-nowrap touch-pan-x"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {/* Add story button */}
        <button
          onClick={handleAddClick}
          className="mr-4 flex shrink-0 flex-col items-center"
          aria-label="Add your story"
        >
          <span className="relative grid h-16 w-16 place-items-center rounded-full border-2 border-dashed border-slate-300 bg-white/70 text-slate-400 transition hover:border-blue-400 hover:text-blue-600">
            <Plus className="h-6 w-6" />
          </span>
          <span className="mt-1 w-16 truncate text-center text-xs text-slate-500">
            Your Story
          </span>
        </button>

        {/* Story cards */}
        {storyItems.map((s, i) => {
          const name = s.owner.username ?? s.owner.name ?? `Story ${i + 1}`
          const initial = name.charAt(0).toUpperCase()
          return (
            <button
              key={s.id}
              onClick={() => setViewerIndex(i)}
              className="mr-4 flex shrink-0 flex-col items-center"
              title={s.caption ?? name}
            >
              {/* Premium gradient ring */}
              <span className="rounded-full bg-gradient-to-r from-blue-600 to-yellow-500 p-1">
                <span className="relative grid h-16 w-16 place-items-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-amber-400 text-lg font-bold text-white">
                  {s.owner.image ? (
                    <img loading="lazy" decoding="async"
                      src={s.owner.image}
                      alt={name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initial
                  )}
                  <Star className="absolute right-0 top-0 h-4 w-4 fill-amber-400 text-amber-500" />
                </span>
              </span>
              {/* Text below */}
              <span className="mt-1 w-16 truncate text-center text-xs text-slate-600">
                {name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Full-screen viewer Modal */}
      {viewerIndex !== null && storyItems[viewerIndex] && (
        <div className="fixed inset-0 z-50 h-screen w-screen bg-black flex flex-col items-center justify-center">
          <div className="fixed inset-0 z-50 h-screen w-screen bg-black flex flex-col items-center justify-center md:relative md:max-w-md md:h-[80vh] md:rounded-2xl overflow-hidden">
            
            {/* Close Button */}
            <button
              onClick={() => setViewerIndex(null)}
              className="absolute top-4 right-4 z-[100] text-white text-4xl bg-black/50 rounded-full p-2 cursor-pointer"
            >
              &times;
            </button>

            {/* Left Nav */}
            {viewerIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setViewerIndex(viewerIndex - 1)
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-[100] text-white text-4xl cursor-pointer"
              >
                &#8249;
              </button>
            )}

            {/* Right Nav */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                if (viewerIndex < storyItems.length - 1) {
                  setViewerIndex(viewerIndex + 1)
                } else {
                  setViewerIndex(null) // Close if it's the last story
                }
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-[100] text-white text-4xl cursor-pointer"
            >
              &#8250;
            </button>

            {/* Media Image */}
            {storyItems[viewerIndex].mediaType === 'VIDEO' ? (
              <video
                src={storyItems[viewerIndex].mediaUrl}
                autoPlay
                controls
                playsInline
                className="aspect-[9/16] w-full h-full object-cover"
              />
            ) : (
              <img
                src={storyItems[viewerIndex].mediaUrl}
                alt={storyItems[viewerIndex].caption || 'Story'}
                className="aspect-[9/16] w-full h-full object-cover"
              />
            )}
            
            {/* Caption Overlay */}
            {storyItems[viewerIndex].caption && (
              <div className="absolute bottom-4 left-4 right-4 text-white text-sm bg-black/50 p-2 rounded-lg backdrop-blur-sm z-40">
                {storyItems[viewerIndex].caption}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Creator modal */}
      <StoryCreator
        open={creatorOpen}
        onOpenChange={setCreatorOpen}
        onCreated={() => {
          // Refresh the page to show the new story (simple, reliable).
          window.location.reload()
        }}
      />
    </section>
  )
}
