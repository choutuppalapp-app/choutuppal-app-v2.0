'use client'

import { useState, useEffect, useCallback } from 'react'
import { Store, Search, Plus, Trash2, Edit3, ExternalLink, RefreshCw, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'
import { AddListingModal } from '@/components/dashboard/add-listing-modal'

interface AgentListing {
  id: string
  title: string
  slug: string
  status: string
  views: number
  clicks: number
  whatsappClicks: number
  createdAt: string
  category: { name: string } | null
  village: { name: string } | null
}

export function AgentMyListingsTab() {
  const [listings, setListings] = useState<AgentListing[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [villages, setVillages] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([])

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/listings')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setListings(j.listings ?? [])
      })
      .catch(() => toast.error('Failed to load listings'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
    fetch('/api/villages').then((r) => r.json()).then((j) => j.ok && setVillages(j.villages)).catch(() => {})
    fetch('/api/categories').then((r) => r.json()).then((j) => j.ok && setCategories(j.categories)).catch(() => {})
  }, [load])

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this listing?')) return
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error()
      toast.success('Listing deleted')
      load()
    } catch {
      toast.error('Failed to delete listing')
    }
  }

  const filtered = listings.filter((l) => {
    const q = search.toLowerCase()
    return (
      l.title.toLowerCase().includes(q) ||
      (l.category?.name ?? '').toLowerCase().includes(q) ||
      (l.village?.name ?? '').toLowerCase().includes(q)
    )
  })

  if (loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">My Listings</h2>
          <p className="text-sm text-slate-500">Business and service listings created by you ({listings.length} total)</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button onClick={() => { setEditingItem(null); setAddModalOpen(true) }} className="gap-1.5 gradient-brand text-white shadow shrink-0">
            <Plus className="h-4 w-4" /> Add Listing
          </Button>
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search my listings..."
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
                <th className="p-3">Business Title</th>
                <th className="p-3">Category / Village</th>
                <th className="p-3">Views / Clicks</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No listings found. Use "+ Add Listing" or "CSV Import" to create one.
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
                      </div>
                      <div className="text-[11px] text-slate-400">/{l.slug}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>{l.category?.name ?? 'Uncategorized'}</div>
                      <div className="text-[11px] text-slate-400">{l.village?.name ?? 'Choutuppal'}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>{l.views} views</div>
                      <div className="text-[11px] text-emerald-600 font-semibold">{l.whatsappClicks} WA clicks</div>
                    </td>
                    <td className="p-3">
                      <Badge className={
                        l.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        l.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }>
                        {l.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setEditingItem(l); setAddModalOpen(true) }}
                          className="h-7 px-2"
                          title="Edit Listing"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                        </Button>
                        <button
                          onClick={() => handleDelete(l.id)}
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

      <AddListingModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        villages={villages}
        categories={categories}
        defaultType="business"
        editingItem={editingItem}
        onSuccess={load}
      />
    </div>
  )
}
