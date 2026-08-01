'use client'

import { useState, useEffect, useCallback } from 'react'
import { Store, Search, Star, Trash2, Check, X, Shield, RefreshCw, Loader2, ExternalLink, Crown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import Link from 'next/link'

interface ListingItem {
  id: string
  title: string
  slug: string
  status: string
  isFeatured: boolean
  isPremium: boolean
  phone: string | null
  createdAt: string
  category: { name: string } | null
  village: { name: string } | null
  owner: { id: string; name: string | null; email: string; phone: string | null }
}

export function AdminListingsTab() {
  const [listings, setListings] = useState<ListingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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
  }, [load])

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

  if (loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Listings Management</h2>
          <p className="text-sm text-slate-500">Manage all business and service listings ({listings.length} total)</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
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

      <div className="rounded-2xl glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
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
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No business listings found matching search.
                  </td>
                </tr>
              ) : (
                filtered.map((l) => (
                  <tr key={l.id} className="hover:bg-white/60">
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
                      <Badge className={
                        l.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        l.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
