'use client'

import { useState, useEffect, useCallback } from 'react'
import { ImageIcon, Plus, Trash2, ExternalLink, RefreshCw, Loader2, Clock, Upload, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

function parseBannersCsv(text: string) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const items: Array<{ title: string; imageUrl: string; link?: string }> = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (i === 0 && (line.toLowerCase().includes('image') || line.toLowerCase().includes('title'))) continue
    const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''))
    if (parts.length >= 2) {
      const title = parts[0] || 'Banner Ad'
      const imageUrl = parts[1]
      const link = parts[2] || undefined
      if (imageUrl && imageUrl.startsWith('http')) {
        items.push({ title, imageUrl, link })
      }
    }
  }
  return items
}

export function AdminBannersTab() {
  const [banners, setBanners] = useState<BannerItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [bulkText, setBulkText] = useState('')

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

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const formData = new FormData()
    formData.append('file', file)
    
    toast.loading('Uploading banner image...', { id: 'upload' })
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const data = await res.json()
      if (res.ok && data.url) {
        setImageUrl(data.url)
        toast.success('Banner image uploaded successfully', { id: 'upload' })
      } else {
        throw new Error(data.error || 'Upload failed')
      }
    } catch (err: any) {
      toast.error(err.message, { id: 'upload' })
    }
  }

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
      console.log('[AdminBanners] POST Payload:', { imageUrl, title, link })
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

  async function handleBulkSubmit(e: React.FormEvent) {
    e.preventDefault()
    const items = parseBannersCsv(bulkText)
    if (items.length === 0) {
      toast.error('No valid rows found. Format: Title, Image URL, Link')
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed bulk upload')

      toast.success(`Successfully uploaded ${j.count ?? items.length} banners!`)
      setBulkOpen(false)
      setBulkText('')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed bulk upload')
    } finally {
      setSaving(false)
    }
  }

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      if (text) setBulkText(text)
    }
    reader.readAsText(file)
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
          <Button onClick={() => setBulkOpen(true)} variant="outline" className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50">
            <FileSpreadsheet className="h-4 w-4" /> Bulk CSV Upload
          </Button>
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
                    <img loading="lazy" decoding="async" src={b.imageUrl} alt={b.title ?? 'Banner'} className="h-full w-full object-cover" />
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
                    ) : null}
                  </div>
                </div>

                <div className="p-3.5 pt-0 flex items-center justify-between border-t border-slate-100 text-xs text-slate-500">
                  <span>Clicks: {b.clicks}</span>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(b.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Add Single Banner Modal */}
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
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
              {imageUrl && (
                <p className="mt-1 text-[10px] text-green-600 truncate">
                  Uploaded: {imageUrl}
                </p>
              )}
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

      {/* Bulk CSV Upload Modal */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" /> Bulk CSV Upload Banners
            </DialogTitle>
            <DialogDescription>
              Upload a .csv file or paste raw CSV text with columns: <strong>Title, Image URL, Link</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBulkSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Select CSV File</Label>
              <Input type="file" accept=".csv,text/csv" onChange={handleCsvUpload} className="cursor-pointer" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Or Paste CSV Data</Label>
              <Textarea
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Title, Image URL, Link\nGrand Opening Sale, https://example.com/banner1.jpg, https://choutuppal.in\nFestival Offer, https://example.com/banner2.jpg, https://choutuppal.in/listings`}
                className="font-mono text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setBulkOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving || !bulkText.trim()} className="gradient-brand text-white font-bold">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Import Banners (24h)'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
