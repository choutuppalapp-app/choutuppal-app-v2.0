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
  Filter,
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
import { POLITICAL_TAGS, tagStyle } from './tag-styles'

interface FeedAuthor {
  id: string
  name: string | null
  username: string | null
  image: string | null
  politicalTag: string
  bio: string | null
}
interface FeedPost {
  id: string
  content: string
  politicalTag: string
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
  politicalTag: string
  village: { name: string } | null
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
  const [tagFilter, setTagFilter] = useState<string>('ALL')

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
    tagFilter === 'ALL' ? posts : posts.filter((p) => p.politicalTag === tagFilter)

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

            {/* Tag filter */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-slate-500">
                <Filter className="h-3.5 w-3.5" /> Filter:
              </span>
              <FilterChip active={tagFilter === 'ALL'} onClick={() => setTagFilter('ALL')}>
                All
              </FilterChip>
              {POLITICAL_TAGS.map((t) => {
                const s = tagStyle(t)
                return (
                  <FilterChip key={t} active={tagFilter === t} onClick={() => setTagFilter(t)}>
                    <span className={cn('mr-1 h-2 w-2 rounded-full', s.dot)} />
                    {s.label}
                  </FilterChip>
                )
              })}
            </div>

            {/* Posts */}
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
  const [tag, setTag] = useState<string>('NONE')
  const [posting, setPosting] = useState(false)

  async function submit() {
    if (!content.trim()) return
    setPosting(true)
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, politicalTag: tag }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed to post')
      onCreated(j.post)
      setContent('')
      setTag('NONE')
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
        <span className="text-xs text-slate-400">Political tag (optional):</span>
        <Select value={tag} onValueChange={setTag}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">None</SelectItem>
            {POLITICAL_TAGS.map((t) => {
              const s = tagStyle(t)
              return (
                <SelectItem key={t} value={t}>
                  <span className="flex items-center gap-1.5">
                    <span className={cn('h-2 w-2 rounded-full', s.dot)} />
                    {s.label}
                  </span>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
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
  const tag = tagStyle(post.politicalTag)
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

  return (
    <article className="rounded-3xl glass p-4">
      {/* Author header */}
      <div className="flex items-start gap-3">
        <Link href={post.author.username ? `/profile/${post.author.username}` : '#'}>
          <Avatar className="h-11 w-11 border-2 border-white shadow">
            <AvatarImage src={post.author.image ?? undefined} />
            <AvatarFallback className="gradient-brand text-white">
              {(post.author.name ?? post.author.username ?? 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link
              href={post.author.username ? `/profile/${post.author.username}` : '#'}
              className="truncate font-bold text-slate-900 hover:text-blue-600"
            >
              {post.author.name ?? post.author.username ?? 'Anonymous'}
            </Link>
            {tag.label ? (
              <span className={cn('rounded-full border px-2 py-0.5 text-[10px] font-bold', tag.cls)}>
                {tag.label}
              </span>
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
            const ctag = tagStyle(c.author.politicalTag)
            return (
              <div key={c.id} className="flex items-start gap-2">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={c.author.image ?? undefined} />
                  <AvatarFallback className="text-[10px] gradient-brand text-white">
                    {(c.author.name ?? 'U').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">
                      {c.author.name ?? c.author.username}
                    </span>
                    {ctag.label ? (
                      <span className={cn('rounded-full border px-1.5 text-[8px] font-bold', ctag.cls)}>
                        {ctag.label}
                      </span>
                    ) : null}
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
            const tag = tagStyle(p.politicalTag)
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
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {p.name ?? p.username}
                    </p>
                    {tag.label ? (
                      <span className={cn('h-2 w-2 shrink-0 rounded-full', tag.dot)} />
                    ) : null}
                  </div>
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

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex shrink-0 items-center rounded-full border px-3 py-1 text-xs font-semibold transition',
        active
          ? 'border-blue-300 bg-blue-50 text-blue-700'
          : 'border-slate-200 bg-white/60 text-slate-500 hover:bg-slate-50',
      )}
    >
      {children}
    </button>
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
