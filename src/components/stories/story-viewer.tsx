'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, Send, Eye, MessageCircle, Trash2, Loader2, Heart, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'

export interface StoryItem {
  id: string
  mediaUrl: string
  mediaType: string
  caption: string | null
  views: number
  expiresAt: string
  createdAt: string
  owner: {
    id: string
    name: string | null
    username: string | null
    image: string | null
  }
}

interface StoryViewerProps {
  stories: StoryItem[]
  startIndex?: number
  ownerMode?: boolean
  onClose: () => void
  onDeleted?: (id: string) => void
}

const STORY_DURATION_MS = 5000

export function StoryViewer({
  stories,
  startIndex = 0,
  ownerMode = false,
  onClose,
  onDeleted,
}: StoryViewerProps) {
  const [index, setIndex] = useState(startIndex)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)
  const [replyText, setReplyText] = useState('')
  const [replyBusy, setReplyBusy] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeBusy, setLikeBusy] = useState(false)

  // Analytics (owner mode only)
  const [analytics, setAnalytics] = useState<{
    viewers: Array<{ id: string; createdAt: string; user: { id: string; name: string | null; username: string | null; image: string | null } }>
    replyCount: number
    totalViews: number
    likeCount: number
    likers: Array<{ id: string; createdAt: string; user: { id: string; name: string | null; username: string | null; image: string | null } }>
  } | null>(null)
  const [replies, setReplies] = useState<Array<{ id: string; content: string; createdAt: string; user: { id: string; name: string | null; username: string | null; image: string | null } }>>([])

  const story = stories[index]

  // Progress bar animation
  useEffect(() => {
    if (paused || !story) return
    setProgress(0)
    const start = Date.now()
    const tick = setInterval(() => {
      const elapsed = Date.now() - start
      const pct = Math.min(100, (elapsed / STORY_DURATION_MS) * 100)
      setProgress(pct)
      if (pct >= 100) {
        clearInterval(tick)
        if (index < stories.length - 1) {
          setIndex((i) => i + 1)
        } else {
          onClose()
        }
      }
    }, 50)
    return () => clearInterval(tick)
  }, [index, paused, story, stories.length, onClose])

  // Record a view when the story changes (non-owner only)
  useEffect(() => {
    if (!story || ownerMode) return
    fetch(`/api/stories/${story.id}/view`, { method: 'POST' }).catch(() => {})
  }, [story, ownerMode])

  // Check if the viewer has liked this story (non-owner only)
  useEffect(() => {
    if (!story || ownerMode) return
    setLiked(false)
    fetch(`/api/stories/${story.id}/like`)
      .then((r) => r.json())
      .then((j) => j.ok && setLiked(j.liked))
      .catch(() => {})
  }, [story, ownerMode])

  // Load analytics in owner mode
  useEffect(() => {
    if (!story || !ownerMode) return
    setAnalytics(null)
    setReplies([])
    fetch(`/api/stories/${story.id}/analytics`)
      .then((r) => r.json())
      .then((j) => j.ok && setAnalytics(j.analytics))
      .catch(() => {})
    fetch(`/api/stories/${story.id}/replies`)
      .then((r) => r.json())
      .then((j) => j.ok && setReplies(j.replies))
      .catch(() => {})
  }, [story, ownerMode])

  // Toggle like (non-owner only)
  const toggleLike = useCallback(async () => {
    if (!story || ownerMode) return
    setLikeBusy(true)
    try {
      const res = await fetch(`/api/stories/${story.id}/like`, { method: 'POST' })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed')
      setLiked(j.liked)
    } catch {
      // silent — like toggle is non-critical
    } finally {
      setLikeBusy(false)
    }
  }, [story, ownerMode])

  const sendReply = useCallback(async () => {
    if (!story || !replyText.trim()) return
    setReplyBusy(true)
    try {
      const res = await fetch(`/api/stories/${story.id}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyText }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed')
      toast.success('Reply sent')
      setReplyText('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send reply')
    } finally {
      setReplyBusy(false)
    }
  }, [story, replyText])

  const deleteStory = useCallback(async () => {
    if (!story) return
    if (!confirm('Delete this story? The media will be removed from R2.')) return
    setDeleteBusy(true)
    try {
      const res = await fetch(`/api/stories/${story.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Story deleted')
      onDeleted?.(story.id)
      if (index < stories.length - 1) {
        setIndex((i) => i + 1)
      } else {
        onClose()
      }
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleteBusy(false)
    }
  }, [story, index, stories.length, onClose, onDeleted])

  if (!story) return null

  const ownerName = story.owner.name ?? story.owner.username ?? 'User'

  return (
    <div className="fixed inset-0 z-50 h-screen w-screen bg-black flex items-center justify-center">
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 text-white text-3xl z-50 cursor-pointer"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Delete (owner/admin) */}
      {ownerMode ? (
        <button
          onClick={deleteStory}
          disabled={deleteBusy}
          aria-label="Delete story"
          className="absolute left-4 top-4 z-50 grid h-10 w-10 place-items-center rounded-full bg-red-500/80 text-white transition hover:bg-red-600"
        >
          {deleteBusy ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
        </button>
      ) : null}

      {/* Progress bars */}
      <div className="absolute left-0 right-0 top-0 z-40 flex gap-1 p-3">
        {stories.map((_, i) => (
          <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full bg-white transition-[width] duration-75 ease-linear"
              style={{ width: i < index ? '100%' : i === index ? `${progress}%` : '0%' }}
            />
          </div>
        ))}
      </div>

      {/* Story media */}
      <div className="relative h-full w-full max-w-md overflow-hidden bg-black md:relative md:inset-auto md:h-[80vh] md:rounded-2xl"
        onPointerDown={() => setPaused(true)}
        onPointerUp={() => setPaused(false)}
        onPointerLeave={() => setPaused(false)}
      >
        {/* Owner header */}
        <div className="absolute left-0 right-0 top-8 z-30 flex items-center gap-2 px-4">
          <Avatar className="h-9 w-9 border-2 border-white">
            <AvatarImage src={story.owner.image ?? undefined} />
            <AvatarFallback className="gradient-brand text-xs text-white">
              {ownerName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{ownerName}</p>
            <p className="text-[10px] text-white/60">{timeAgo(story.createdAt)}</p>
          </div>
        </div>

        {/* Media */}
        {story.mediaUrl ? (
          story.mediaType === 'VIDEO' ? (
            <video
              src={story.mediaUrl}
              className="h-full w-full object-contain"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img loading="lazy" decoding="async"
              src={story.mediaUrl}
              alt={story.caption ?? 'Story'}
              className="h-full w-full object-contain"
            />
          )
        ) : (
          <div className="grid h-full w-full place-items-center gradient-brand p-8 text-center">
            <span className="font-telugu text-lg font-medium text-white">{story.caption ?? 'Story'}</span>
          </div>
        )}

        {/* Caption overlay (dark gradient for readability) */}
        {story.caption && story.mediaUrl ? (
          <div className="absolute inset-x-0 bottom-0 z-30 bg-gradient-to-t from-black/80 to-transparent p-6 pb-24">
            <p className="font-telugu text-base font-medium leading-relaxed text-white">
              {story.caption}
            </p>
          </div>
        ) : null}

        {/* Owner analytics panel */}
        {ownerMode ? (
          <div className="absolute inset-x-0 bottom-0 z-40 max-h-[45vh] overflow-y-auto rounded-t-3xl bg-white/95 backdrop-blur-xl fancy-scroll">
            <Tabs defaultValue="views" className="p-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="views" className="gap-1 text-xs">
                  <Eye className="h-3.5 w-3.5" /> Views ({analytics?.totalViews ?? story.views})
                </TabsTrigger>
                <TabsTrigger value="likes" className="gap-1 text-xs">
                  <Heart className="h-3.5 w-3.5" /> Likes ({analytics?.likeCount ?? 0})
                </TabsTrigger>
                <TabsTrigger value="replies" className="gap-1 text-xs">
                  <MessageCircle className="h-3.5 w-3.5" /> Replies ({replies.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="views" className="mt-3">
                {analytics?.viewers.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">No viewers yet.</p>
                ) : (
                  <div className="space-y-2">
                    {analytics?.viewers.map((v) => (
                      <div key={v.id} className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={v.user.image ?? undefined} />
                          <AvatarFallback className="text-[10px] gradient-brand text-white">
                            {(v.user.name ?? 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-slate-700">
                          {v.user.name ?? v.user.username ?? 'User'}
                        </span>
                        <span className="ml-auto text-[10px] text-slate-400">{timeAgo(v.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="likes" className="mt-3">
                {analytics?.likers.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">No likes yet.</p>
                ) : (
                  <div className="space-y-2">
                    {analytics?.likers.map((l) => (
                      <div key={l.id} className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={l.user.image ?? undefined} />
                          <AvatarFallback className="text-[10px] gradient-brand text-white">
                            {(l.user.name ?? 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-slate-700">
                          {l.user.name ?? l.user.username ?? 'User'}
                        </span>
                        <Heart className="ml-auto h-3 w-3 fill-red-500 text-red-500" />
                        <span className="text-[10px] text-slate-400">{timeAgo(l.createdAt)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
              <TabsContent value="replies" className="mt-3">
                {replies.length === 0 ? (
                  <p className="py-4 text-center text-xs text-slate-400">No replies yet.</p>
                ) : (
                  <div className="space-y-2">
                    {replies.map((r) => (
                      <div key={r.id} className="flex items-start gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={r.user.image ?? undefined} />
                          <AvatarFallback className="text-[10px] gradient-brand text-white">
                            {(r.user.name ?? 'U').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1 rounded-xl bg-slate-100 px-3 py-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">
                              {r.user.name ?? r.user.username}
                            </span>
                            <span className="text-[9px] text-slate-400">{timeAgo(r.createdAt)}</span>
                          </div>
                          <p className="text-xs text-slate-700">{r.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          /* Non-owner reply + like box */
          <div className="absolute inset-x-0 bottom-0 z-40 p-4">
            <div className="flex items-center gap-2 rounded-full border border-white/30 bg-black/40 p-1.5 pl-4 backdrop-blur">
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                placeholder="Reply to story…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-white/50 outline-none"
              />
              {/* Like button — heart turns red when liked. Count NOT shown to non-owners. */}
              <button
                onClick={toggleLike}
                disabled={likeBusy}
                aria-label={liked ? 'Unlike' : 'Like'}
                aria-pressed={liked}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white transition disabled:opacity-50"
              >
                {likeBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className={cn('h-5 w-5 transition', liked && 'fill-red-500 text-red-500')} />
                )}
              </button>
              <button
                onClick={sendReply}
                disabled={!replyText.trim() || replyBusy}
                aria-label="Send reply"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-brand text-white disabled:opacity-50"
              >
                {replyBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation arrows (desktop) */}
      {index > 0 ? (
        <button
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          aria-label="Previous"
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white text-4xl cursor-pointer z-50">
          <ChevronLeft className="h-10 w-10" />
        </button>
      ) : null}
      {true ? (
        <button
          onClick={() => { if (index < stories.length - 1) setIndex(index + 1); else onClose(); }}
          aria-label="Next"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white text-4xl cursor-pointer z-50">
          <ChevronRight className="h-10 w-10" />
        </button>
      ) : null}
    </div>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
