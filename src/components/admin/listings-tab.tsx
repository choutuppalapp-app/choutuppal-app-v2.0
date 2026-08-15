'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Store,
  Search,
  Star,
  Trash2,
  Check,
  X,
  Shield,
  RefreshCw,
  Loader2,
  ExternalLink,
  Crown,
  Plus,
  Edit3,
  Image as ImageIcon,
  CheckSquare,
  Square,
  Wand2,
  Sparkles,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import Link from 'next/link'
import { AddListingModal } from '@/components/dashboard/add-listing-modal'
import { ImageUploader } from '@/components/ui/image-uploader'

interface ListingItem {
  id: string
  title: string
  slug: string
  status: string
  isFeatured: boolean
  isPremium: boolean
  phone: string | null
  expiresAt?: string | null
  createdAt: string
  category: { id?: string; name: string } | null
  village: { id?: string; name: string } | null
  owner: { id: string; name: string | null; email: string; phone: string | null }
}

const CATEGORY_STOCK_IMAGES: Record<string, { logo: string; cover: string }> = {
  hospital: {
    logo: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=1200&q=80',
  },
  restaurant: {
    logo: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80',
  },
  education: {
    logo: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1200&q=80',
  },
  shopping: {
    logo: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
  },
  default: {
    logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80',
    cover: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
  },
}

export function AdminListingsTab() {
  const [listings, setListings] = useState<ListingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [renewingId, setRenewingId] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [villages, setVillages] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([])

  // Bulk action dialog states
  const [bulkEditOpen, setBulkEditOpen] = useState(false)
  const [bulkImagesOpen, setBulkImagesOpen] = useState(false)
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false)
  const [bulkProcessing, setBulkProcessing] = useState(false)

  // Bulk edit form states
  const [editCategoryId, setEditCategoryId] = useState<string>('')
  const [editVillageId, setEditVillageId] = useState<string>('')
  const [editHours, setEditHours] = useState<string>('')

  // Bulk image form states
  const [customLogoUrl, setCustomLogoUrl] = useState<string>('')
  const [customCoverUrl, setCustomCoverUrl] = useState<string>('')

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/listings')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setListings(j.listings ?? [])
      })
      .catch(() => toast.error('Failed to load listings'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
    fetch('/api/villages')
      .then((r) => r.json())
      .then((j) => j.ok && setVillages(j.villages))
      .catch(() => {})
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((j) => j.ok && setCategories(j.categories))
      .catch(() => {})
  }, [load])

  async function renewListing(id: string) {
    setRenewingId(id)
    try {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'business', id, status: 'APPROVED', expiresAt }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error()
      toast.success('Listing renewed for 30 days!')
      load()
    } catch {
      toast.error('Failed to renew listing')
    } finally {
      setRenewingId(null)
    }
  }

  async function toggleFeatured(item: ListingItem) {
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'business', id: item.id, isFeatured: !item.isFeatured }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error()
      toast.success(item.isFeatured ? 'Removed from Featured' : 'Marked as Featured')
      load()
    } catch {
      toast.error('Failed to update featured status')
    }
  }

  async function changeTier(item: ListingItem, planTier: string) {
    try {
      const isPremium = planTier === 'PREMIUM' || planTier === 'PRO'
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'business', id: item.id, isPremium, planTier }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error()
      toast.success(`Listing tier updated to ${planTier}`)
      load()
    } catch {
      toast.error('Failed to update tier')
    }
  }

  async function deleteListing(id: string) {
    if (!confirm('Are you sure you want to delete this listing permanently?')) return
    try {
      const res = await fetch(`/api/admin/listings?type=business&id=${id}`, { method: 'DELETE' })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error()
      toast.success('Listing deleted')
      load()
    } catch {
      toast.error('Failed to delete listing')
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'business', id, status }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error()
      toast.success(`Status updated to ${status}`)
      load()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const filtered = listings.filter((l) => {
    const q = search.toLowerCase()
    return (
      l.title.toLowerCase().includes(q) ||
      (l.category?.name ?? '').toLowerCase().includes(q) ||
      (l.village?.name ?? '').toLowerCase().includes(q) ||
      (l.owner?.name ?? '').toLowerCase().includes(q) ||
      (l.phone ?? '').includes(q)
    )
  })

  // Select all / toggle row selections
  const allSelected = filtered.length > 0 && selectedIds.length === filtered.length
  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(filtered.map((l) => l.id))
    }
  }

  function toggleSelectRow(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  // Bulk Edit Handler
  async function handleBulkEdit() {
    if (selectedIds.length === 0) return
    setBulkProcessing(true)
    try {
      const payload: Record<string, any> = {}
      if (editCategoryId) payload.categoryId = editCategoryId
      if (editVillageId) payload.villageId = editVillageId
      if (editHours.trim()) payload.businessHours = { raw: editHours.trim() }

      if (Object.keys(payload).length === 0) {
        toast.error('Please specify at least one field to update.')
        setBulkProcessing(false)
        return
      }

      const res = await fetch('/api/admin/listings/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, data: payload }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed bulk update')

      toast.success(`Successfully updated ${j.count ?? selectedIds.length} listings!`)
      setSelectedIds([])
      setBulkEditOpen(false)
      setEditCategoryId('')
      setEditVillageId('')
      setEditHours('')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bulk edit failed')
    } finally {
      setBulkProcessing(false)
    }
  }

  // Bulk Images Handler
  async function handleApplyCustomImages() {
    if (selectedIds.length === 0) return
    setBulkProcessing(true)
    try {
      const payload: Record<string, any> = {}
      if (customLogoUrl.trim()) payload.logo = customLogoUrl.trim()
      if (customCoverUrl.trim()) payload.coverImage = customCoverUrl.trim()

      if (Object.keys(payload).length === 0) {
        toast.error('Please enter a Logo URL or Cover Image URL')
        setBulkProcessing(false)
        return
      }

      const res = await fetch('/api/admin/listings/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, data: payload }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed bulk image update')

      toast.success(`Successfully updated images for ${j.count ?? selectedIds.length} listings!`)
      setSelectedIds([])
      setBulkImagesOpen(false)
      setCustomLogoUrl('')
      setCustomCoverUrl('')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bulk image update failed')
    } finally {
      setBulkProcessing(false)
    }
  }

  async function handleAutoMatchImages() {
    if (selectedIds.length === 0) return
    setBulkProcessing(true)
    try {
      const stock = CATEGORY_STOCK_IMAGES.default
      const res = await fetch('/api/admin/listings/bulk', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          data: { logo: stock.logo, coverImage: stock.cover },
        }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed auto image matching')

      toast.success(`Auto-matched category images for ${j.count ?? selectedIds.length} listings!`)
      setSelectedIds([])
      setBulkImagesOpen(false)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Auto image match failed')
    } finally {
      setBulkProcessing(false)
    }
  }

  // Bulk Delete Handler
  async function handleBulkDelete() {
    if (selectedIds.length === 0) return
    setBulkProcessing(true)
    try {
      const res = await fetch('/api/admin/listings/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed bulk delete')

      toast.success(`Successfully deleted ${j.count ?? selectedIds.length} listings!`)
      setSelectedIds([])
      setBulkDeleteOpen(false)
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bulk delete failed')
    } finally {
      setBulkProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Listings Management</h2>
          <p className="text-sm text-slate-500">Manage all business and service listings ({listings.length} total)</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button onClick={() => setAddModalOpen(true)} className="gap-1.5 gradient-brand text-white shadow shrink-0">
            <Plus className="h-4 w-4" /> Add Listing
          </Button>
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search listings..."
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5 shrink-0">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <div className="rounded-2xl glass overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </th>
                <th className="p-3">Business</th>
                <th className="p-3">Category / Village</th>
                <th className="p-3">Owner / Contact</th>
                <th className="p-3">Status</th>
                <th className="p-3">Tier</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No business listings found matching search.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => {
                  const isSelected = selectedIds.includes(l.id)
                  return (
                    <tr key={l.id} className={`hover:bg-white/60 ${isSelected ? 'bg-blue-50/50' : ''}`}>
                      <td className="p-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(l.id)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <Link href={`/business/${l.slug}`} target="_blank" className="hover:underline flex items-center gap-1">
                            {l.title} <ExternalLink className="h-3 w-3 text-slate-400" />
                          </Link>
                          {l.isFeatured ? (
                            <Badge className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0">Featured</Badge>
                          ) : null}
                        </div>
                        <div className="text-[11px] text-slate-400">/{l.slug}</div>
                      </td>
                      <td className="p-3 text-slate-600">
                        <div>{l.category?.name ?? 'Uncategorized'}</div>
                        <div className="text-[11px] text-slate-400">{l.village?.name ?? 'Choutuppal'}</div>
                      </td>
                      <td className="p-3 text-slate-600">
                        <div>{l.owner?.name ?? 'Admin / Claimable'}</div>
                        <div className="text-[11px] text-slate-400">{l.phone ?? l.owner?.email}</div>
                      </td>
                      <td className="p-3">
                        <Badge
                          className={
                            l.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : l.status === 'EXPIRED'
                              ? 'bg-rose-100 text-rose-700'
                              : l.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }
                        >
                          {l.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Select
                          defaultValue={l.isPremium ? 'PREMIUM' : 'FREE'}
                          onValueChange={(val) => changeTier(l, val)}
                        >
                          <SelectTrigger className="h-7 text-[11px] w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FREE">Free</SelectItem>
                            <SelectItem value="PRO">Pro</SelectItem>
                            <SelectItem value="PREMIUM">Premium</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => renewListing(l.id)}
                            disabled={renewingId === l.id}
                            title="Renew for 30 Days"
                            className="h-7 px-2 bg-emerald-50 border-emerald-300 text-emerald-700 hover:bg-emerald-100 text-[11px]"
                          >
                            {renewingId === l.id ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Renew (30d)'}
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingItem(l)
                              setAddModalOpen(true)
                            }}
                            title="Edit Listing"
                            className="h-7 px-2"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleFeatured(l)}
                            title={l.isFeatured ? 'Remove Featured' : 'Make Featured'}
                            className={`h-7 px-2 ${l.isFeatured ? 'bg-amber-50 border-amber-300 text-amber-700' : ''}`}
                          >
                            <Star className={`h-3.5 w-3.5 ${l.isFeatured ? 'fill-amber-500' : ''}`} />
                          </Button>

                          {l.status !== 'APPROVED' ? (
                            <Button
                              size="sm"
                              onClick={() => updateStatus(l.id, 'APPROVED')}
                              className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                              title="Approve"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </Button>
                          ) : null}

                          <button
                            onClick={() => deleteListing(l.id)}
                            className="grid h-7 w-7 place-items-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                            title="Delete Listing"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STICKY FLOATING ACTION BAR FOR BULK ACTIONS */}
      {selectedIds.length > 0 ? (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-3xl bg-slate-900/90 text-white backdrop-blur-xl border border-slate-700/80 shadow-2xl rounded-2xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-600 text-white font-bold text-xs px-2.5 py-1">
              {selectedIds.length} Selected
            </Badge>
            <span className="text-xs text-slate-300 hidden sm:inline">Bulk Actions</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkEditOpen(true)}
              className="gap-1.5 bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700 text-xs"
            >
              <Edit3 className="h-3.5 w-3.5 text-blue-400" /> Bulk Edit
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkImagesOpen(true)}
              className="gap-1.5 bg-slate-800 text-slate-100 border-slate-700 hover:bg-slate-700 text-xs"
            >
              <ImageIcon className="h-3.5 w-3.5 text-emerald-400" /> Bulk Images
            </Button>

            <Button
              size="sm"
              variant="destructive"
              onClick={() => setBulkDeleteOpen(true)}
              className="gap-1.5 bg-red-600 hover:bg-red-700 text-white text-xs"
            >
              <Trash2 className="h-3.5 w-3.5" /> Bulk Delete
            </Button>

            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedIds([])}
              className="text-slate-400 hover:text-white hover:bg-slate-800 text-xs"
            >
              Clear
            </Button>
          </div>
        </div>
      ) : null}

      {/* BULK EDIT DIALOG */}
      <Dialog open={bulkEditOpen} onOpenChange={setBulkEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <Edit3 className="h-5 w-5 text-blue-600" /> Bulk Edit {selectedIds.length} Listings
            </DialogTitle>
            <DialogDescription>
              Select fields to update. Blank fields will remain unchanged across selected listings.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Category</label>
              <Select value={editCategoryId} onValueChange={setEditCategoryId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Keep current category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Village / Area</label>
              <Select value={editVillageId} onValueChange={setEditVillageId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Keep current village" />
                </SelectTrigger>
                <SelectContent>
                  {villages.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 mb-1 block">Business Hours</label>
              <Input
                value={editHours}
                onChange={(e) => setEditHours(e.target.value)}
                placeholder="e.g. 9:00 AM - 9:00 PM (Everyday)"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setBulkEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkEdit} disabled={bulkProcessing} className="gradient-brand text-white gap-1.5">
              {bulkProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Apply Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BULK IMAGES DIALOG */}
      <Dialog open={bulkImagesOpen} onOpenChange={setBulkImagesOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <ImageIcon className="h-5 w-5 text-emerald-600" /> Bulk Update Images ({selectedIds.length} Listings)
            </DialogTitle>
            <DialogDescription>
              Auto-match standard category images or set custom Logo and Cover Image URLs.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-900">
                <Sparkles className="h-4 w-4 text-emerald-600" /> Option 1: Auto-match Stock Category Images
              </div>
              <p className="text-xs text-emerald-700">
                Automatically applies curated high-resolution category logos and covers to selected listings.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAutoMatchImages}
                disabled={bulkProcessing}
                className="gap-1.5 bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100 text-xs w-full mt-1 font-semibold"
              >
                {bulkProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wand2 className="h-3.5 w-3.5 text-emerald-600" />}
                Auto-match Category Images
              </Button>
            </div>

            <div className="space-y-4">
              <div className="font-bold text-xs text-slate-800">Option 2: Custom Image URLs</div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Custom Logo Image</label>
                <ImageUploader value={customLogoUrl} onChange={setCustomLogoUrl} folder="listings" aspect="square" />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Custom Cover Image</label>
                <ImageUploader value={customCoverUrl} onChange={setCustomCoverUrl} folder="listings" aspect="video" />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setBulkImagesOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyCustomImages} disabled={bulkProcessing} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
              {bulkProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Apply Images
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* BULK DELETE DIALOG */}
      <Dialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" /> Bulk Delete Listings
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete <strong className="text-slate-900">{selectedIds.length}</strong> selected listings? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="outline" onClick={() => setBulkDeleteOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleBulkDelete} disabled={bulkProcessing} variant="destructive" className="gap-1.5">
              {bulkProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Delete {selectedIds.length} Listings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AddListingModal
        open={addModalOpen}
        onOpenChange={(open) => {
          setAddModalOpen(open)
          if (!open) setEditingItem(null)
        }}
        villages={villages}
        categories={categories}
        defaultType="business"
        editingItem={editingItem}
        onSuccess={load}
      />
    </div>
  )
}
