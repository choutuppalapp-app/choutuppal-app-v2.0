'use client'
import Image from 'next/image';

import { useCallback, useEffect, useState } from 'react'
import { Video, Plus, Trash2, Loader2, RefreshCw, Link2, Youtube, Instagram } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface ShortItem {
  id: string
  title: string | null
  youtubeId: string | null
  platform?: 'YOUTUBE' | 'INSTAGRAM'
  thumbnail: string | null
  views: number
  likes: number
  createdAt: string
  owner: { name: string | null }
}

export function ShortsManager() {
  const [shorts, setShorts] = useState<ShortItem[]>([])
  const [loading, setLoading] = useState(true)
  const [platform, setPlatform] = useState<'YOUTUBE' | 'INSTAGRAM'>('YOUTUBE')
  const [mode, setMode] = useState<'single' | 'channel'>('single')
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [deleteBusy, setDeleteBusy] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((j) => { if (j.ok) setShorts(j.shorts) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let active = true
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((j) => { if (active && j.ok) setShorts(j.shorts) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function add() {
    if (!input.trim()) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/shorts/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, mode: platform === 'YOUTUBE' ? mode : 'single', input: input.trim() }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed')
      toast.success(
        mode === 'single'
          ? 'Video added to Shorts'
          : `${j.added} video(s) imported · ${j.skipped} already existed`,
      )
      setInput('')
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to add')
    } finally {
      setBusy(false)
    }
  }

  async function remove(id: string) {
    if (!confirm('Remove this Short from the Home page?')) return
    setDeleteBusy(id)
    try {
      const res = await fetch(`/api/admin/content/shorts/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setShorts((p) => p.filter((s) => s.id !== id))
      toast.success('Short removed')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setDeleteBusy(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Add section */}
      <div className="rounded-2xl glass p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
          <Video className="h-4 w-4 text-blue-500" /> Add Short / Reel
        </h3>

        {/* Platform Dropdown */}
        <div className="mb-4">
          <Label className="mb-1.5 block text-xs font-semibold text-slate-600">Platform</Label>
          <select
            value={platform}
            onChange={(e) => {
              const p = e.target.value as 'YOUTUBE' | 'INSTAGRAM'
              setPlatform(p)
              setInput('')
            }}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="YOUTUBE">YouTube Shorts</option>
            <option value="INSTAGRAM">Instagram Reels</option>
          </select>
        </div>

        {/* Mode toggle (Only for YouTube) */}
        {platform === 'YOUTUBE' && (
          <div className="mb-3 flex gap-2">
            <button
              onClick={() => setMode('single')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition',
                mode === 'single'
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
              )}
            >
              <Link2 className="h-3.5 w-3.5" /> Single Video
            </button>
            <button
              onClick={() => setMode('channel')}
              className={cn(
                'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition',
                mode === 'channel'
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50',
              )}
            >
              <Youtube className="h-3.5 w-3.5" /> Channel Fetch
            </button>
          </div>
        )}

        <Label className="mb-1.5 block text-xs font-semibold text-slate-600">
          {platform === 'INSTAGRAM'
            ? 'Instagram Reel / Post URL (e.g. https://www.instagram.com/reel/xyz/)'
            : mode === 'single'
            ? 'YouTube Video URL (e.g. https://youtu.be/xyz or watch?v=xyz)'
            : 'YouTube Channel URL or ID (e.g. https://youtube.com/@channel or UC...)'}
        </Label>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            placeholder={
              platform === 'INSTAGRAM'
                ? 'https://www.instagram.com/reel/Cxxxxxxxxx/'
                : mode === 'single'
                ? 'https://youtu.be/dQw4w9WgXcQ'
                : 'UCxxxxxxxxxxxxxxxxxxxxxx'
            }
            disabled={busy}
          />
          <Button onClick={add} disabled={busy || !input.trim()} className="gap-1.5 gradient-brand text-white">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {platform === 'INSTAGRAM' ? 'Add Reel' : mode === 'single' ? 'Add Video' : 'Fetch & Add'}
          </Button>
        </div>
        {platform === 'YOUTUBE' && mode === 'channel' ? (
          <p className="mt-2 text-[11px] text-slate-400">
            Fetches the latest 15 uploads from the channel using the YouTube Data API. Requires a
            YouTube API key in Admin → Settings → Integrations.
          </p>
        ) : null}
      </div>

      {/* List */}
      <div className="rounded-2xl glass">
        <div className="flex items-center justify-between border-b border-slate-100 p-4">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
            <Video className="h-4 w-4 text-blue-500" /> Saved Shorts ({shorts.length})
          </h3>
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
        <div className="max-h-[50vh] overflow-y-auto fancy-scroll">
          {loading ? (
            <div className="grid place-items-center py-10"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
          ) : shorts.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-400">No shorts yet. Add one above.</p>
          ) : (
            <div className="grid gap-3 p-3 sm:grid-cols-2 lg:grid-cols-3">
              {shorts.map((s) => (
                <div key={s.id} className="overflow-hidden rounded-xl border border-slate-100 bg-white/60">
                  <div className="relative aspect-video">
                    {s.thumbnail ? (
                      <Image width={800} height={800} loading="lazy" decoding="async" src={s.thumbnail} alt={s.title ?? 'Short'} className="h-full w-full object-cover" />
                    ) : s.platform === 'INSTAGRAM' ? (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-500 text-white">
                        <Instagram className="h-8 w-8" />
                      </div>
                    ) : (
                      <div className="grid h-full w-full place-items-center gradient-brand text-white">
                        <Video className="h-8 w-8" />
                      </div>
                    )}
                    {s.platform === 'INSTAGRAM' ? (
                      <Badge className="absolute left-2 top-2 bg-pink-100 text-pink-700 hover:bg-pink-100">
                        <Instagram className="mr-1 h-3 w-3" /> Reel
                      </Badge>
                    ) : (
                      <Badge className="absolute left-2 top-2 bg-red-100 text-red-700 hover:bg-red-100">
                        <Youtube className="mr-1 h-3 w-3" /> YT
                      </Badge>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="line-clamp-2 text-xs font-semibold text-slate-900">{s.title ?? 'Untitled'}</p>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400">
                        by {s.owner.name ?? 'Admin'} · {s.views} views
                      </span>
                      <button
                        onClick={() => remove(s.id)}
                        disabled={deleteBusy === s.id}
                        aria-label="Delete"
                        className="grid h-7 w-7 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                      >
                        {deleteBusy === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
