'use client'

import { useState } from 'react'
import { MessageCircle, Heart, Trash2, Loader2, Send } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { EmptyState } from './my-listings'

interface CommunityPostItem {
  id: string
  content: string
  likes: number
  createdAt: string
  _count: { comments: number; likesRel: number }
}

export function MyCommunityPosts({ posts }: { posts: CommunityPostItem[] }) {
  const [items, setItems] = useState(posts)
  const [busy, setBusy] = useState<string | null>(null)
  const [newContent, setNewContent] = useState('')
  const [posting, setPosting] = useState(false)

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault()
    if (!newContent.trim()) {
      toast.error('దయచేసి పోస్ట్ కంటెంట్ రాయండి')
      return
    }

    setPosting(true)
    try {
      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newContent.trim() }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed to publish post')

      const created: CommunityPostItem = {
        id: j.post?.id || `post_${Date.now()}`,
        content: j.post?.content || newContent.trim(),
        likes: 0,
        createdAt: j.post?.createdAt || new Date().toISOString(),
        _count: { comments: 0, likesRel: 0 },
      }
      setItems((prev) => [created, ...prev])
      setNewContent('')
      toast.success('పోస్ట్ విజయవంతంగా పబ్లిష్ అయింది!')
    } catch (err: any) {
      toast.error(err?.message || 'Failed to publish post')
    } finally {
      setPosting(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Delete this community post?')) return
    setBusy(id)
    try {
      const res = await fetch(`/api/community/posts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setItems((p) => p.filter((x) => x.id !== id))
      toast.success('Post deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Community Posts</h2>
          <p className="text-sm text-slate-500">{items.length} community posts</p>
        </div>
      </div>

      {/* Quick Create Post Box */}
      <form onSubmit={handleCreatePost} className="rounded-3xl glass p-5 space-y-3">
        <label className="block text-xs font-bold text-slate-700">
          కమ్యూనిటీలో కొత్త పోస్ట్ రాయండి (Create Community Post):
        </label>
        <Textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          placeholder="చౌటుప్పల్ ప్రజలతో ఏదైనా ముఖ్యమైన సమాచారం, న్యూస్ లేదా ఆలోచనలు పంచుకోండి..."
          rows={3}
          maxLength={600}
          className="rounded-2xl text-sm"
        />
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">{newContent.length}/600</span>
          <Button
            type="submit"
            disabled={posting || !newContent.trim()}
            size="sm"
            className="gap-2 rounded-xl gradient-brand text-white shadow-md text-xs font-bold"
          >
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {posting ? 'పోస్ట్ అవుతోంది...' : 'Publish Post'}
          </Button>
        </div>
      </form>

      {items.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No community posts yet"
          desc="Share your thoughts, local news, and updates in the community feed."
        />
      ) : (
        <div className="space-y-3">
          {items.map((p) => {
            return (
              <div key={p.id} className="rounded-2xl glass p-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">{timeAgo(p.createdAt)}</span>
                  <button
                    onClick={() => remove(p.id)}
                    disabled={busy === p.id}
                    aria-label="Delete post"
                    className="ml-auto grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                  >
                    {busy === p.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  </button>
                </div>
                <p className="font-telugu mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-800">
                  {p.content}
                </p>
                <div className="mt-3 flex items-center gap-4 border-t border-slate-100 pt-2 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3 w-3" /> {p._count?.likesRel ?? 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" /> {p._count?.comments ?? 0}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
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

