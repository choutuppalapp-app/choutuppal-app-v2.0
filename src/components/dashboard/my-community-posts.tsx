'use client'

import { useState } from 'react'
import { MessageCircle, Heart, Trash2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
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
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-900">My Community Posts</h2>
        <p className="text-sm text-slate-500">{items.length} text-only posts in the community feed</p>
      </div>

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
                    <Heart className="h-3 w-3" /> {p._count.likesRel}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" /> {p._count.comments}
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
