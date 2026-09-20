'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Video,
  PlusCircle,
  Play,
  Trash2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Search,
  Eye,
  Film,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

export default function AdminShortsPage() {
  const [shorts, setShorts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    videoUrl: '',
    title: '',
    description: '',
    platform: 'YOUTUBE',
    customThumbnail: '',
  })

  const fetchShorts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/shorts')
      const data = await res.json()
      if (data.ok) {
        setShorts(data.shorts || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch shorts', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchShorts()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this short video?')) return
    try {
      const res = await fetch(`/api/admin/shorts?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.ok) {
        setShorts((prev) => prev.filter((s) => s.id !== id))
        toast({ title: 'Deleted', description: 'Short video removed' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete short', variant: 'destructive' })
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/shorts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.ok) {
        toast({ title: 'Success', description: 'Short video added to Choutuppal feed' })
        setModalOpen(false)
        fetchShorts()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to add short', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to add short', variant: 'destructive' })
    }
  }

  return (
    <div>
      <AdminHeader
        title="Shorts & Video Management"
        teluguTitle="షార్ట్స్ & వీడియోల నిర్వహణ"
        description="Curate YouTube Shorts, Instagram Reels, and local video stories for the Choutuppal Community Feed."
        actionButton={{
          label: 'Add Short Video',
          onClick: () => {
            setFormData({
              videoUrl: '',
              title: '',
              description: '',
              platform: 'YOUTUBE',
              customThumbnail: '',
            })
            setModalOpen(true)
          },
          icon: PlusCircle,
        }}
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {loading ? (
            <div className="col-span-full rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              Loading shorts catalog...
            </div>
          ) : shorts.length === 0 ? (
            <div className="col-span-full rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              No shorts in the feed yet. Click "Add Short Video" to paste YouTube or Reel links.
            </div>
          ) : (
            shorts.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="relative aspect-9/16 bg-slate-900 group">
                  <img
                    src={item.thumbnail || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80'}
                    alt={item.title}
                    className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 p-3 flex flex-col justify-between">
                    <div className="flex justify-between items-center">
                      <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                        {item.platform || 'YouTube'}
                      </span>
                      <a
                        href={item.videoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full bg-black/60 backdrop-blur-xs p-1.5 text-white hover:bg-black/80 transition"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>

                    <div>
                      <h4 className="text-white font-bold text-sm line-clamp-2 leading-snug">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-slate-300 text-xs line-clamp-1 mt-1">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {item.owner?.name || 'Admin'}
                  </span>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded hover:bg-rose-50 transition"
                    title="Delete Short"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Short Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Add Short Video to Feed
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Paste a YouTube Shorts or video URL. Thumbnails are automatically generated!
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Video URL (YouTube or Reel) *</label>
              <input
                type="url"
                required
                placeholder="https://www.youtube.com/shorts/..."
                value={formData.videoUrl}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Title / Headline</label>
              <input
                type="text"
                placeholder="e.g. చౌటుప్పల్ ప్రసిద్ధ వంటకాలు & హోటల్ రివ్యూ"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Description / Highlights</label>
              <textarea
                rows={2}
                placeholder="Brief highlights or shop location..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                >
                  <option value="YOUTUBE">YouTube Shorts</option>
                  <option value="INSTAGRAM">Instagram Reels</option>
                  <option value="LOCAL">Local Video</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Custom Thumbnail (Optional)</label>
                <input
                  type="url"
                  placeholder="Auto-extracted if blank"
                  value={formData.customThumbnail}
                  onChange={(e) => setFormData({ ...formData, customThumbnail: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
              >
                Add Short
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
