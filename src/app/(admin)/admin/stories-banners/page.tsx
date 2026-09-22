'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import NextImage from 'next/image'
import {
  Image as ImageIcon,
  PlusCircle,
  Eye,
  Calendar,
  ExternalLink,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
  Clock,
  Layers,
  ArrowUpRight,
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

export default function AdminStoriesBannersPage() {
  const [activeTab, setActiveTab] = useState<'banners' | 'stories'>('banners')
  const [banners, setBanners] = useState<any[]>([])
  const [stories, setStories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modal states
  const [bannerModalOpen, setBannerModalOpen] = useState(false)
  const [storyModalOpen, setStoryModalOpen] = useState(false)

  const [bannerForm, setBannerForm] = useState({
    title: '',
    imageUrl: '',
    link: '/categories',
    position: 'HOME_TOP',
    durationDays: 30,
  })

  const [storyForm, setStoryForm] = useState({
    mediaUrl: '',
    caption: '',
    link: '',
    durationHours: 24,
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [bRes, sRes] = await Promise.all([
        fetch('/api/admin/banners'),
        fetch('/api/admin/stories'),
      ])
      const bData = await bRes.json()
      const sData = await sRes.json()

      if (bData.ok) setBanners(bData.banners || [])
      if (sData.ok) setStories(sData.stories || [])
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch stories & banners', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleToggleBanner = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentVal }),
      })
      const data = await res.json()
      if (data.ok) {
        setBanners((prev) => prev.map((b) => (b.id === id ? { ...b, isActive: !currentVal } : b)))
        toast({ title: 'Banner Updated', description: `Banner is now ${!currentVal ? 'Active' : 'Inactive'}` })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update banner', variant: 'destructive' })
    }
  }

  const handleDeleteBanner = async (id: string) => {
    if (!confirm('Are you sure you want to delete this banner ad?')) return
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.ok) {
        setBanners((prev) => prev.filter((b) => b.id !== id))
        toast({ title: 'Deleted', description: 'Banner ad removed' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete banner', variant: 'destructive' })
    }
  }

  const handleCreateBanner = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bannerForm),
      })
      const data = await res.json()
      if (data.ok) {
        toast({ title: 'Success', description: 'New banner ad activated' })
        setBannerModalOpen(false)
        fetchData()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to create banner', variant: 'destructive' })
    }
  }

  const handleToggleStory = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch('/api/admin/stories', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentVal }),
      })
      const data = await res.json()
      if (data.ok) {
        setStories((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !currentVal } : s)))
        toast({ title: 'Story Updated', description: `Story is now ${!currentVal ? 'Active' : 'Hidden'}` })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update story', variant: 'destructive' })
    }
  }

  const handleDeleteStory = async (id: string) => {
    if (!confirm('Delete this story reel?')) return
    try {
      const res = await fetch(`/api/admin/stories?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.ok) {
        setStories((prev) => prev.filter((s) => s.id !== id))
        toast({ title: 'Deleted', description: 'Story reel removed' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete story', variant: 'destructive' })
    }
  }

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyForm),
      })
      const data = await res.json()
      if (data.ok) {
        toast({ title: 'Success', description: 'New 24h story reel published' })
        setStoryModalOpen(false)
        fetchData()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to create story', variant: 'destructive' })
    }
  }

  return (
    <div>
      <AdminHeader
        title="Stories & Banner Ads"
        teluguTitle="స్టోరీలు & బ్యానర్ ప్రకటనలు"
        description="Manage ₹99/day Hero homepage banner ads, promotional campaign carousels, and 24-hour visual story reels."
        actionButton={{
          label: activeTab === 'banners' ? 'New Banner Ad' : 'New Story Reel',
          onClick: () => {
            if (activeTab === 'banners') setBannerModalOpen(true)
            else setStoryModalOpen(true)
          },
          icon: PlusCircle,
        }}
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
        {/* Tab Selector */}
        <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1 border border-slate-200 w-full sm:w-auto self-start">
          <button
            onClick={() => setActiveTab('banners')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'banners'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hero & Promo Banners ({banners.length})
          </button>
          <button
            onClick={() => setActiveTab('stories')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'stories'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            24h Story Reels ({stories.length})
          </button>
        </div>

        {/* Tab 1: Banners List */}
        {activeTab === 'banners' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {banners.length === 0 ? (
              <div className="col-span-full rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                No active banner campaigns found. Click "New Banner Ad" to launch a promotion.
              </div>
            ) : (
              banners.map((banner) => (
                <div
                  key={banner.id}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative aspect-16/9 bg-slate-100 border-b border-slate-200">
                      <NextImage
                        src={banner.imageUrl || 'https://68eqkurg5him9yb0.public.blob.vercel-storage.com/choutuppal-uploads/migrated-1790058158931-hero-banner.webp'}
                        alt={banner.title || 'Banner Ad'}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <span
                        className={`absolute top-2.5 right-2.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-xs ${
                          banner.isActive !== false
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-700 text-white'
                        }`}
                      >
                        {banner.isActive !== false ? 'Active Live' : 'Paused'}
                      </span>
                    </div>

                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-900 text-sm">{banner.title || 'Special Promotion'}</h3>
                        <span className="rounded bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                          ₹99 / Day
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 flex items-center justify-between">
                        <span>Position: {banner.position || 'HOME_TOP'}</span>
                        <span>{banner.clicks || 0} Clicks</span>
                      </div>

                      {banner.link && (
                        <p className="text-xs text-blue-700 font-medium truncate flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />
                          <span>{banner.link}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-slate-100 p-3 bg-slate-50/50 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleBanner(banner.id, banner.isActive !== false)}
                      className={`rounded-lg px-3 py-1 text-xs font-semibold border transition ${
                        banner.isActive !== false
                          ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                          : 'bg-emerald-600 text-white border-transparent hover:bg-emerald-700'
                      }`}
                    >
                      {banner.isActive !== false ? 'Pause Ad' : 'Activate Ad'}
                    </button>

                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-md hover:bg-rose-50 transition"
                      title="Delete Banner"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Story Reels List */}
        {activeTab === 'stories' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {stories.length === 0 ? (
              <div className="col-span-full rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
                No active stories. Add a story reel for local merchants or town updates.
              </div>
            ) : (
              stories.map((story) => (
                <div
                  key={story.id}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col justify-between"
                >
                  <div className="relative aspect-9/16 bg-slate-100">
                    <NextImage
                      src={story.mediaUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&auto=format&fit=crop&q=80'}
                      alt={story.caption || 'Story'}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-cover"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 p-2.5 flex flex-col justify-between">
                      <div className="flex justify-between items-center">
                        <span className="rounded bg-black/50 backdrop-blur-xs px-1.5 py-0.5 text-[9px] font-bold text-white flex items-center gap-1">
                          <Eye className="h-2.5 w-2.5" /> {story.views || 0}
                        </span>
                        <button
                          onClick={() => handleDeleteStory(story.id)}
                          className="text-white/80 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {story.caption && (
                        <p className="text-[11px] text-white font-medium line-clamp-2">
                          {story.caption}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 truncate">{story.owner?.name || 'Admin'}</span>
                    <button
                      onClick={() => handleToggleStory(story.id, Boolean(story.isActive))}
                      className={`font-bold ${story.isActive ? 'text-emerald-600' : 'text-slate-400'}`}
                    >
                      {story.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* New Banner Modal */}
      <Dialog open={bannerModalOpen} onOpenChange={setBannerModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Launch New Banner Campaign
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Display banner ads across Choutuppal homepage or category feeds.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBanner} className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Banner Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Grand Opening 50% Off - Balaji Silks"
                value={bannerForm.title}
                onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Image URL (Banner Graphic) *</label>
              <input
                type="url"
                required
                placeholder="https://..."
                value={bannerForm.imageUrl}
                onChange={(e) => setBannerForm({ ...bannerForm, imageUrl: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Target Link URL</label>
              <input
                type="text"
                placeholder="/business/balaji-silks or /categories"
                value={bannerForm.link}
                onChange={(e) => setBannerForm({ ...bannerForm, link: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Placement</label>
                <select
                  value={bannerForm.position}
                  onChange={(e) => setBannerForm({ ...bannerForm, position: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                >
                  <option value="HOME_TOP">Home Top Hero (₹99/day)</option>
                  <option value="CATEGORY_FEED">Category Feed</option>
                  <option value="NEWS_FEED">News Feed</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Duration (Days)</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={bannerForm.durationDays}
                  onChange={(e) => setBannerForm({ ...bannerForm, durationDays: Number(e.target.value) })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBannerModalOpen(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
              >
                Launch Banner
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Story Modal */}
      <Dialog open={storyModalOpen} onOpenChange={setStoryModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Publish 24h Story Reel
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Upload story images or reels for daily local business deals.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateStory} className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Story Image / Media URL *</label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={storyForm.mediaUrl}
                onChange={(e) => setStoryForm({ ...storyForm, mediaUrl: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Caption / Offer Text</label>
              <input
                type="text"
                placeholder="e.g. Special weekend festival discounts on silk sarees!"
                value={storyForm.caption}
                onChange={(e) => setStoryForm({ ...storyForm, caption: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Action Link (Optional)</label>
              <input
                type="text"
                placeholder="/business/my-shop"
                value={storyForm.link}
                onChange={(e) => setStoryForm({ ...storyForm, link: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <DialogFooter className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setStoryModalOpen(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
              >
                Publish Story
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
