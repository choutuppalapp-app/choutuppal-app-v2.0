'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Plus, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Story } from '@prisma/client'
import { StoryCreator } from '@/components/stories/story-creator'

interface StoriesRailProps {
  stories: {
    id: string
    mediaUrl: string
    mediaType: string
    caption: string | null
    views: number
    expiresAt: Date
    createdAt: Date
    owner: { username: string | null; name: string | null; image: string | null }
  }[]
  viewer: {
    isLoggedIn: boolean
    isPremium: boolean
  }
}

export function StoriesRail({ stories, viewer }: StoriesRailProps) {
  const router = useRouter()
  const [creatorOpen, setCreatorOpen] = useState(false)
  const [viewerIndex, setViewerIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (viewerIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [viewerIndex])

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
                    <img loading="lazy" decoding="async" sizes="(max-width: 768px) 100vw, 33vw"
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
      {mounted && viewerIndex !== null && storyItems[viewerIndex] && createPortal(
        <div className="fixed inset-0 z-[9999] h-screen w-screen bg-black flex items-center justify-center overflow-hidden">
          <div className="w-full h-full flex items-center justify-center md:relative md:max-w-md md:h-[85vh] md:rounded-2xl md:z-50 md:overflow-hidden md:border md:border-white/10 bg-black">
            {/* Close Button */}
            <button
              onClick={() => setViewerIndex(null)}
              className="absolute top-4 right-4 z-[10001] text-white text-3xl cursor-pointer bg-black/40 rounded-full p-2 h-12 w-12 flex items-center justify-center"
            >
              &times;
            </button>

            {/* Left Tap Zone (Previous) */}
            <div
              className="absolute left-0 top-0 h-full w-1/2 z-[10000] cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                if (viewerIndex > 0) setViewerIndex(viewerIndex - 1)
              }}
            />

            {/* Right Tap Zone (Next) */}
            <div
              className="absolute right-0 top-0 h-full w-1/2 z-[10000] cursor-pointer"
              onClick={(e) => {
                e.stopPropagation()
                if (viewerIndex < storyItems.length - 1) {
                  setViewerIndex(viewerIndex + 1)
                } else {
                  setViewerIndex(null)
                }
              }}
            />

            {/* Media Container */}
            <div className="relative w-full h-full flex items-center justify-center pointer-events-none z-[9999]">
              {storyItems[viewerIndex].mediaType === 'VIDEO' ? (
                <video
                  src={storyItems[viewerIndex].mediaUrl}
                  autoPlay
                  controls
                  playsInline
                  className="max-h-full max-w-full object-contain pointer-events-auto"
                />
              ) : (
                <img
                  src={storyItems[viewerIndex].mediaUrl}
                  alt={storyItems[viewerIndex].caption || 'Story'}
                  className="max-h-full max-w-full object-contain pointer-events-auto"
                />
              )}
              
              {/* Caption Overlay */}
              {storyItems[viewerIndex].caption && (
                <div className="absolute bottom-8 left-4 right-4 text-white text-base bg-black/60 p-4 rounded-xl backdrop-blur-md z-[10001] pointer-events-auto text-center">
                  {storyItems[viewerIndex].caption}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
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
