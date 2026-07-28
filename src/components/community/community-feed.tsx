'use client'

import { useState, useCallback, useEffect } from 'react'
import Link from 'next/link'
import {
  Send,
  Heart,
  MessageCircle,
  Trash2,
  Users,
  ChevronLeft,
  Search,
  Loader2,
  Crown,
  BadgeCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'


interface FeedAuthor {
  id: string
  name: string | null
  username: string | null
  image: string | null
  bio: string | null
  planTier?: string | null
}
interface FeedPost {
  id: string
  content: string
  likes: number
  commentCount: number
  likedByMe: boolean
  createdAt: string
  author: FeedAuthor
}
interface Person {
  id: string
  name: string | null
  username: string | null
  image: string | null
  bio: string | null
  village: { name: string } | null
  planTier?: string | null
}
interface Comment {
  id: string
  content: string
  createdAt: string
  author: FeedAuthor
}

interface CommunityFeedProps {
  initialPosts: FeedPost[]
  initialPeople: Person[]
  isLoggedIn: boolean
  viewerUsername: string | null
}

export function CommunityFeed({
  initialPosts,
  initialPeople,
  isLoggedIn,
  viewerUsername,
}: CommunityFeedProps) {
  const [posts, setPosts] = useState<FeedPost[]>(initialPosts)
  const [people] = useState<Person[]>(initialPeople)

  const onCreated = useCallback((post: FeedPost) => {
    setPosts((prev) => [post, ...prev])
  }, [])

  const onDeleted = useCallback((id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const onLiked = useCallback((id: string, liked: boolean, likes: number) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, likedByMe: liked, likes } : p)))
  }, [])

  const onCommented = useCallback((id: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, commentCount: p.commentCount + 1 } : p)),
    )
  }, [])

  const visible =
    posts

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-3 px-3 sm:px-4">
          <Link href="/" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-base font-black text-white">
            C
          </span>
          <div className="leading-none">
            <h1 className="text-sm font-extrabold text-slate-900">Community</h1>
            <p className="text-[10px] uppercase tracking-[0.18em] text-blue-600">
              Choutuppal Feed
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-3 py-6 sm:px-4">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          {/* Feed column */}
          <div className="min-w-0 space-y-4">
            {/* Composer */}
            <PostComposer isLoggedIn={isLoggedIn} onCreated={onCreated} />

            {/* Mobile People rail — horizontal scroll, below composer, above feed */}
            {people.length > 0 ? (
              <section className="flex md:hidden">
                <div className="w-full">
                  <h3 className="mb-2 flex items-center gap-2 px-1 text-xs font-bold uppercase tracking-wide text-slate-500">
                    <Users className="h-3.5 w-3.5 text-blue-500" /> People you may know
                  </h3>
                  <div className="no-scrollbar flex gap-3 overflow-x-auto pb-2">
                    {people.map((p) => {
                                            return (
                        <div
                          key={p.id}
                          className="flex w-40 shrink-0 flex-col items-center rounded-xl border border-white/30 bg-white/20 p-4 text-center backdrop-blur-lg"
                        >
                          {p.image ? (
                            <img src={p.image} alt={p.name ?? ''} className="h-16 w-16 rounded-full object-cover" />
                          ) : (
                            <span className="grid h-16 w-16 place-items-center rounded-full gradient-brand text-xl font-bold text-white">
                              {(p.name ?? 'U').charAt(0).toUpperCase()}
                            </span>
                          )}
                          <p className="mt-2 text-sm font-bold text-slate-900 flex items-center justify-center gap-1">
                            <span className="truncate">{p.name ?? p.username}</span>
                            {p.planTier === 'PREMIUM' ? (
                              <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-400 shrink-0" />
                            ) : p.planTier === 'PRO' ? (
                              <BadgeCheck className="h-3.5 w-3.5 text-blue-500 fill-blue-100 shrink-0" />
                            ) : null}
                          </p>
                          <p className="w-full truncate text-xs text-slate-500">{p.bio ?? p.village?.name ?? `@${p.username}`}</p>
                          
                          <Link
                            href={p.username ? `/profile/${p.username}` : '#'}
                            className="mt-2 rounded-lg gradient-brand px-3 py-1 text-[10px] font-semibold text-white"
                          >
                            View
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </section>
            ) : null}

            {/* Posts */}{/* Posts */}
            {visible.length === 0 ? (
              <div className="rounded-3xl glass p-10 text-center">
                <MessageCircle className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-2 font-bold text-slate-900">No posts yet</h3>
                <p className="text-sm text-slate-500">
                  {isLoggedIn ? 'Be the first to share something!' : 'Login to start posting.'}
                </p>
              </div>
            ) : (
              visible.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  isLoggedIn={isLoggedIn}
                  viewerUsername={viewerUsername}
                  onDeleted={onDeleted}
                  onLiked={onLiked}
                  onCommented={onCommented}
                />
              ))
            )}
          </div>

          {/* People directory sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-3">
              <PeopleDirectory people={people} />
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Post Composer                                                               */
/* -------------------------------------------------------------------------- */

function PostComposer({
  isLoggedIn,
  onCreated,
}: {
  isLoggedIn: boolean
  onCreated: (post: FeedPost) => void
}) {
  const [content, setContent] = useState('')
  const [posting, setPosting] = useState(false)

  async function submit() {
    if (!content.trim()) return
    setPosting(true)
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed to post')
      onCreated(j.post)
      setContent('')
      toast.success('Posted!')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to post')
    } finally {
      setPosting(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <div className="rounded-3xl glass p-5 text-center">
        <p className="text-sm text-slate-600">
          <Link href="/login" className="font-semibold text-blue-600 hover:underline">
            Login
          </Link>{' '}
          to share posts in the community.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-3xl glass p-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share something with the community… (text only)"
        rows={3}
        maxLength={2000}
        className="resize-none border-0 bg-transparent focus-visible:ring-0"
      />
      <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
        <span className="ml-auto text-[11px] text-slate-400">{content.length}/2000</span>
        <Button
          onClick={submit}
          disabled={!content.trim() || posting}
          size="sm"
          className="gap-1.5 gradient-brand text-white"
        >
          {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Post
        </Button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Post Card                                                                   */
/* -------------------------------------------------------------------------- */

function PostCard({
  post,
  isLoggedIn,
  viewerUsername,
  onDeleted,
  onLiked,
  onCommented,
}: {
  post: FeedPost
  isLoggedIn: boolean
  viewerUsername: string | null
  onDeleted: (id: string) => void
  onLiked: (id: string, liked: boolean, likes: number) => void
  onCommented: (id: string) => void
}) {
  const [showComments, setShowComments] = useState(false)
  const [likeBusy, setLikeBusy] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState(false)
    const isOwnPost = viewerUsername && post.author.username === viewerUsername

  async function toggleLike() {
    if (!isLoggedIn) {
      toast.info('Login to like posts')
      return
    }
    setLikeBusy(true)
    try {
      const res = await fetch(`/api/community/posts/${post.id}/like`, { method: 'POST' })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed')
      onLiked(post.id, j.liked, j.likes)
    } catch {
      toast.error('Failed to like')
    } finally {
      setLikeBusy(false)
    }
  }

  async function deletePost() {
    if (!confirm('Delete this post?')) return
    setDeleteBusy(true)
    try {
      const res = await fetch(`/api/community/posts/${post.id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      onDeleted(post.id)
      toast.success('Post deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleteBusy(false)
    }
  }

  const isPremium = post.author.planTier === 'PREMIUM'
  const isPro = post.author.planTier === 'PRO'

  return (
    <article
      className={cn(
        "rounded-3xl border p-4 shadow-sm transition-all duration-300",
        isPremium
          ? "bg-amber-500/5 border-amber-200/40 shadow-[0_4px_15px_rgba(245,158,11,0.1)]"
          : "glass"
      )}
    >
      {/* Author header */}
      <div className="flex items-start gap-3">
        <Link href={post.author.username ? `/profile/${post.author.username}` : '#'}>
          <Avatar className={cn("h-11 w-11 border-2 shadow", isPremium ? "border-amber-300" : "border-white")}>
            <AvatarImage src={post.author.image ?? undefined} />
            <AvatarFallback className="gradient-brand text-white">
              {(post.author.name ?? post.author.username ?? 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link
              href={post.author.username ? `/profile/${post.author.username}` : '#'}
              className="truncate font-bold text-slate-900 hover:text-blue-600"
            >
              {post.author.name ?? post.author.username ?? 'Anonymous'}
            </Link>
            {isPremium ? (
              <Crown className="h-4 w-4 text-amber-500 fill-amber-400 shrink-0" />
            ) : isPro ? (
              <BadgeCheck className="h-4 w-4 text-blue-500 fill-blue-100 shrink-0" />
            ) : null}
            
          </div>
          <p className="text-[11px] text-slate-400">
            @{post.author.username ?? 'user'} · {timeAgo(post.createdAt)}
          </p>
        </div>
        {isOwnPost ? (
          <button
            onClick={deletePost}
            disabled={deleteBusy}
            aria-label="Delete post"
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            {deleteBusy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </button>
        ) : null}
      </div>

      {/* Content */}
      <p className="font-telugu mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
        {post.content}
      </p>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-1 border-t border-slate-100 pt-3">
        <button
          onClick={toggleLike}
          disabled={likeBusy}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
            post.likedByMe
              ? 'text-rose-600 hover:bg-rose-50'
              : 'text-slate-500 hover:bg-slate-50',
          )}
        >
          {likeBusy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Heart className={cn('h-3.5 w-3.5', post.likedByMe && 'fill-rose-500')} />
          )}
          {post.likes}
        </button>
        <button
          onClick={() => setShowComments((s) => !s)}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-50"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          {post.commentCount}
        </button>
      </div>

      {/* Comments */}
      {showComments ? (
        <CommentSection
          postId={post.id}
          isLoggedIn={isLoggedIn}
          onCommented={() => onCommented(post.id)}
        />
      ) : null}
    </article>
  )
}

/* -------------------------------------------------------------------------- */
/* Comments                                                                    */
/* -------------------------------------------------------------------------- */

function CommentSection({
  postId,
  isLoggedIn,
  onCommented,
}: {
  postId: string
  isLoggedIn: boolean
  onCommented: () => void
}) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)

  // Load comments when the section opens.
  useEffect(() => {
    let active = true
    fetch(`/api/community/posts/${postId}/comments`)
      .then((r) => r.json())
      .then((j) => { if (active && j.ok) setComments(j.comments) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [postId])

  async function addComment() {
    if (!text.trim()) return
    setPosting(true)
    try {
      const res = await fetch(`/api/community/posts/${postId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed')
      setComments((prev) => [...prev, j.comment])
      setText('')
      onCommented()
    } catch {
      toast.error('Failed to comment')
    } finally {
      setPosting(false)
    }
  }

  return (
    <div className="mt-3 space-y-3 rounded-2xl bg-slate-50/60 p-3">
      {loading ? (
        <p className="text-center text-xs text-slate-400">Loading comments…</p>
      ) : comments.length === 0 ? (
        <p className="text-center text-xs text-slate-400">No comments yet.</p>
      ) : (
        <div className="space-y-2">
          {comments.map((c) => {
                        return (
              <div key={c.id} className="flex items-start gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={c.author.image ?? undefined} />
                  <AvatarFallback className="text-[10px] gradient-brand text-white">
                    {(c.author.name ?? 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <span>{c.author.name ?? c.author.username}</span>
                      {c.author.planTier === 'PREMIUM' ? (
                        <Crown className="h-3 w-3 text-amber-500 fill-amber-400 shrink-0" />
                      ) : c.author.planTier === 'PRO' ? (
                        <BadgeCheck className="h-3 w-3 text-blue-500 fill-blue-100 shrink-0" />
                      ) : null}
                    </span>
                    
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-400">{timeAgo(c.createdAt)}</span>
                  </div>
                  <p className="mt-0.5 whitespace-pre-wrap text-slate-700">{c.content}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {isLoggedIn ? (
        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addComment()}
            placeholder="Write a comment…"
            className="h-9 flex-1 rounded-full border border-slate-200 bg-white px-3 text-xs outline-none focus:border-blue-400"
          />
          <Button
            onClick={addComment}
            disabled={!text.trim() || posting}
            size="icon"
            className="h-9 w-9 shrink-0 rounded-full gradient-brand text-white"
          >
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* People Directory                                                            */
/* -------------------------------------------------------------------------- */

function PeopleDirectory({ people }: { people: Person[] }) {
  return (
    <div className="rounded-3xl glass p-4">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
        <Users className="h-4 w-4 text-blue-500" /> People you might know
      </h3>
      {people.length === 0 ? (
        <p className="py-4 text-center text-xs text-slate-400">No public profiles yet.</p>
      ) : (
        <div className="space-y-2">
          {people.map((p) => {
                        return (
              <Link
                key={p.id}
                href={p.username ? `/profile/${p.username}` : '#'}
                className="hover-glow flex items-center gap-3 rounded-xl bg-white/60 p-2.5"
              >
                <Avatar className="h-9 w-9 border border-white">
                  <AvatarImage src={p.image ?? undefined} />
                  <AvatarFallback className="text-xs gradient-brand text-white">
                    {(p.name ?? 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900 flex items-center gap-1">
                    <span className="truncate">{p.name ?? p.username}</span>
                    {p.planTier === 'PREMIUM' ? (
                      <Crown className="h-3.5 w-3.5 text-amber-500 fill-amber-400 shrink-0" />
                    ) : p.planTier === 'PRO' ? (
                      <BadgeCheck className="h-3.5 w-3.5 text-blue-500 fill-blue-100 shrink-0" />
                    ) : null}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">
                    {p.bio ?? p.village?.name ?? `@${p.username}`}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

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
