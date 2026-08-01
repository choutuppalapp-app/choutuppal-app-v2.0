'use client'

import { useState, useEffect, useCallback } from 'react'
import { ImageIcon, Plus, Trash2, ExternalLink, RefreshCw, Loader2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ImageUpload } from '@/components/dashboard/image-upload'
import { toast } from 'sonner'

interface BannerItem {
  id: string
  imageUrl: string
  title: string | null
  link: string | null
  position: string
  status: string
  clicks: number
  expiresAt: string
  createdAt: string
  owner: { name: string | null; email: string } | null
}

export function AdminBannersTab() {
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Form states
  const [imageUrl, setImageUrl] = useState('')
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/banners')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setBanners(j.banners ?? [])
      })
      .catch(() => toast.error('Failed to load banners'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!imageUrl) {
      toast.error('Please upload a banner image')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          title: title.trim() || 'Banner Ad',
          link: link.trim() || undefined,
        }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed to create banner')

      toast.success('Banner created with 24-hour expiry!')
      setAddOpen(false)
      setImageUrl('')
      setTitle('')
      setLink('')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create banner')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this banner ad?')) return
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error()
      toast.success('Banner deleted')
      load()
    } catch {
      toast.error('Failed to delete banner')
    }
  }

  if (loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Banners Management</h2>
          <p className="text-sm text-slate-500">Create & manage homepage 16:9 banner ads (24-hour auto-expiry)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setAddOpen(true)} className="gap-1.5 gradient-brand text-white shadow">
            <Plus className="h-4 w-4" /> Add Banner
          </Button>
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {banners.length === 0 ? (
          <div className="col-span-full rounded-2xl glass p-8 text-center text-slate-400">
            No active or past banner ads found. Click "+ Add Banner" above to create one.
          </div>
        ) : (
          banners.map((b) => {
            const isExpired = new Date(b.expiresAt).getTime() < Date.now()
            return (
              <div key={b.id} className="hover-lift overflow-hidden rounded-2xl glass border border-slate-100 flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
                    <img src={b.imageUrl} alt={b.title ?? 'Banner'} className="h-full w-full object-cover" />
                    <Badge
                      className={`absolute top-2 right-2 text-[10px] ${
                        isExpired ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isExpired ? 'Expired' : 'Active (24h)'}
                    </Badge>
                  </div>
                  <div className="p-3.5 space-y-1.5">
                    <h3 className="font-bold text-slate-900 truncate">{b.title ?? 'Banner Ad'}</h3>
                    {b.link ? (
                      <a
                        href={b.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 truncate"
                      >
                        {b.link} <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    ) : (
                      <p className="text-xs text-slate-400">No link attached</p>
                    )}
                  </div>
                </div>

                <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>{b.clicks} clicks</span>
                  </div>
                  <button
                    onClick={() => handleDelete(b.id)}
                    className="grid h-7 w-7 place-items-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                    title="Delete Banner"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Banner Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <ImageIcon className="h-5 w-5 text-blue-600" /> Add New Banner Ad
            </DialogTitle>
            <DialogDescription>
              Upload a 16:9 banner image. Banner will auto-expire in 24 hours.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">16:9 Banner Image *</Label>
              <ImageUpload
                value={imageUrl}
                onChange={(val) => setImageUrl(val ?? '')}
                label="Upload Banner (16:9)"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Banner Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Grand Opening Sale 50% Off"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Target Link URL</Label>
              <Input
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="https://choutuppal.in/business/my-shop or /dashboard"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !imageUrl} className="gradient-brand text-white font-bold">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Banner (24h)'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
