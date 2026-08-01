'use client'

import { useState, useEffect, useCallback } from 'react'
import { Home, Search, Star, Trash2, Check, RefreshCw, Loader2, ExternalLink } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'

interface RealEstateItem {
  id: string
  title: string
  slug: string
  type: string
  listingType: string
  price: number
  status: string
  isFeatured?: boolean
  createdAt: string
  village: { name: string } | null
  owner: { id: string; name: string | null; email: string; phone: string | null }
}

export function AdminRealEstateTab() {
  const [properties, setProperties] = useState<RealEstateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/listings')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) setProperties(j.realEstates ?? [])
      })
      .catch(() => toast.error('Failed to load real estate properties'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function toggleFeatured(item: RealEstateItem) {
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'realestate', id: item.id, isFeatured: !item.isFeatured }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error()
      toast.success(item.isFeatured ? 'Removed from Featured' : 'Marked as Featured')
      load()
    } catch {
      toast.error('Failed to update featured status')
    }
  }

  async function deleteProperty(id: string) {
    if (!confirm('Are you sure you want to delete this property permanently?')) return
    try {
      const res = await fetch(`/api/admin/listings?type=realestate&id=${id}`, { method: 'DELETE' })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error()
      toast.success('Property deleted')
      load()
    } catch {
      toast.error('Failed to delete property')
    }
  }

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'realestate', id, status }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error()
      toast.success(`Status updated to ${status}`)
      load()
    } catch {
      toast.error('Failed to update status')
    }
  }

  const filtered = properties.filter((p) => {
    const q = search.toLowerCase()
    return (
      p.title.toLowerCase().includes(q) ||
      (p.village?.name ?? '').toLowerCase().includes(q) ||
      (p.owner?.name ?? '').toLowerCase().includes(q) ||
      p.type.toLowerCase().includes(q)
    )
  })

  if (loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Real Estate Management</h2>
          <p className="text-sm text-slate-500">Manage all plots, houses & commercial real estate ({properties.length} total)</p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search properties..."
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
                <th className="p-3">Property</th>
                <th className="p-3">Type / Price</th>
                <th className="p-3">Village</th>
                <th className="p-3">Owner</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No real estate properties found matching search.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-white/60">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Link href={`/explore?tab=real-estate`} target="_blank" className="hover:underline flex items-center gap-1">
                          {p.title} <ExternalLink className="h-3 w-3 text-slate-400" />
                        </Link>
                        {p.isFeatured ? (
                          <Badge className="bg-amber-100 text-amber-800 text-[9px] px-1.5 py-0">Featured</Badge>
                        ) : null}
                      </div>
                      <div className="text-[11px] text-slate-400">/{p.slug}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div><Badge variant="outline">{p.type}</Badge> ({p.listingType})</div>
                      <div className="text-[11px] font-bold text-emerald-600 mt-0.5">
                        ₹{p.price ? p.price.toLocaleString('en-IN') : 'Contact'}
                      </div>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>{p.village?.name ?? 'Choutuppal'}</div>
                    </td>
                    <td className="p-3 text-slate-600">
                      <div>{p.owner?.name ?? 'User'}</div>
                      <div className="text-[11px] text-slate-400">{p.owner?.phone ?? p.owner?.email}</div>
                    </td>
                    <td className="p-3">
                      <Badge className={
                        p.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        p.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }>
                        {p.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleFeatured(p)}
                          title={p.isFeatured ? 'Remove Featured' : 'Make Featured'}
                          className={`h-7 px-2 ${p.isFeatured ? 'bg-amber-50 border-amber-300 text-amber-700' : ''}`}
                        >
                          <Star className={`h-3.5 w-3.5 ${p.isFeatured ? 'fill-amber-500' : ''}`} />
                        </Button>

                        {p.status !== 'APPROVED' ? (
                          <Button
                            size="sm"
                            onClick={() => updateStatus(p.id, 'APPROVED')}
                            className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                            title="Approve"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </Button>
                        ) : null}

                        <button
                          onClick={() => deleteProperty(p.id)}
                          className="grid h-7 w-7 place-items-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
                          title="Delete Property"
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
