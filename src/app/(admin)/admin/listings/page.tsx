'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Store,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  Edit,
  Trash2,
  Phone,
  MapPin,
  ExternalLink,
  PlusCircle,
  Star,
  RefreshCw,
  Eye,
  Crown,
  Upload,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { BulkImportModal } from '@/components/admin/bulk-import-modal'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

export default function AdminListingsPage() {
  const [listings, setListings] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [villages, setVillages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Filters
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [categoryFilter, setCategoryFilter] = useState('ALL')

  // Modals state
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [bulkImportOpen, setBulkImportOpen] = useState(false)
  const [selectedListing, setSelectedListing] = useState<any | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    phone: '',
    whatsapp: '',
    categoryId: 'cat-services',
    villageId: 'cmsepb40r0000jv04tdwwd5cw',
    address: '',
    description: '',
    status: 'APPROVED',
    isPremium: false,
    isFeatured: false,
  })

  const fetchListings = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/listings')
      const data = await res.json()
      if (data.ok) {
        setListings(data.listings || [])
        setCategories(data.categories || [])
        setVillages(data.villages || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch listings', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchListings()
  }, [])

  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchesSearch =
        !search ||
        item.title?.toLowerCase().includes(search.toLowerCase()) ||
        item.phone?.includes(search) ||
        item.category?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.village?.name?.toLowerCase().includes(search.toLowerCase())

      const matchesStatus = statusFilter === 'ALL' || item.status === statusFilter
      const matchesCat =
        categoryFilter === 'ALL' ||
        item.categoryId === categoryFilter ||
        item.category?.id === categoryFilter ||
        item.category?.slug === categoryFilter

      return matchesSearch && matchesStatus && matchesCat
    })
  }, [listings, search, statusFilter, categoryFilter])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      const data = await res.json()
      if (data.ok) {
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
        )
        toast({ title: 'Status Updated', description: `Listing status set to ${newStatus}` })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' })
    }
  }

  const handleTogglePremium = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isPremium: !currentVal }),
      })
      const data = await res.json()
      if (data.ok) {
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, isPremium: !currentVal } : l))
        )
        toast({
          title: !currentVal ? 'Premium Enabled' : 'Premium Disabled',
          description: !currentVal ? 'Shop marked with Gold Premium badge' : 'Shop returned to standard',
        })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update premium', variant: 'destructive' })
    }
  }

  const handleDeleteListing = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return
    try {
      const res = await fetch(`/api/admin/listings?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.ok) {
        setListings((prev) => prev.filter((l) => l.id !== id))
        toast({ title: 'Listing Deleted', description: `"${title}" has been deleted.` })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete listing', variant: 'destructive' })
    }
  }

  const openEditModal = (listing: any) => {
    setSelectedListing(listing)
    setFormData({
      title: listing.title || '',
      phone: listing.phone || '',
      whatsapp: listing.whatsapp || '',
      categoryId: listing.categoryId || listing.category?.id || 'cat-services',
      villageId: listing.villageId || listing.village?.id || 'cmsepb40r0000jv04tdwwd5cw',
      address: listing.address || '',
      description: listing.description || '',
      status: listing.status || 'APPROVED',
      isPremium: Boolean(listing.isPremium),
      isFeatured: Boolean(listing.isFeatured),
    })
    setEditModalOpen(true)
  }

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedListing) return

    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedListing.id,
          ...formData,
        }),
      })
      const data = await res.json()
      if (data.ok) {
        toast({ title: 'Success', description: 'Listing updated successfully' })
        setEditModalOpen(false)
        fetchListings()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save edits', variant: 'destructive' })
    }
  }

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.ok) {
        toast({ title: 'Success', description: 'New business listing registered' })
        setCreateModalOpen(false)
        fetchListings()
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to create listing', variant: 'destructive' })
    }
  }

  return (
    <div>
      <AdminHeader
        title="Listings Management"
        teluguTitle="షాపులు & డైరెక్టరీ నిర్వహణ"
        description="Verify, approve, and manage merchant shops, categories, phone contacts, and premium status across Choutuppal."
        secondaryActionButton={{
          label: 'Bulk Import CSV/JSON',
          icon: Upload,
          onClick: () => setBulkImportOpen(true),
        }}
        actionButton={{
          label: 'Add Business',
          onClick: () => {
            setFormData({
              title: '',
              phone: '',
              whatsapp: '',
              categoryId: 'cat-services',
              villageId: 'cmsepb40r0000jv04tdwwd5cw',
              address: 'Choutuppal Main Road',
              description: '',
              status: 'APPROVED',
              isPremium: false,
              isFeatured: false,
            })
            setCreateModalOpen(true)
          },
          icon: PlusCircle,
        }}
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
        {/* Filters and Search Bar - Light Theme */}
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search shop, phone, owner..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-sm text-slate-900 focus:bg-white focus:border-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-700 focus:outline-none"
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending (పెండింగ్)</option>
              <option value="APPROVED">Approved (ఆమోదించినవి)</option>
              <option value="REJECTED">Rejected (తిరస్కరించినవి)</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 focus:border-blue-700 focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c.id || c.slug} value={c.id || c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={fetchListings}
              title="Refresh"
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Listings DataTable - Clean Light Theme */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Business / Shop</th>
                  <th className="px-4 py-3.5">Category</th>
                  <th className="px-4 py-3.5">Phone & WhatsApp</th>
                  <th className="px-4 py-3.5">Village / Ward</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Badges</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-500 text-sm">
                      Loading merchant directory...
                    </td>
                  </tr>
                ) : filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-12 text-center text-slate-500 text-sm">
                      No listings match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={idx % 2 === 1 ? 'bg-slate-50/40 hover:bg-slate-50' : 'bg-white hover:bg-slate-50'}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-start gap-3">
                          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700 font-bold text-xs border border-blue-100">
                            <Store className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm leading-tight">
                              {item.title}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[200px]">
                              {item.address || 'Choutuppal, Telangana'}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="inline-block rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                          {item.category?.name || 'Local Service'}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-xs">
                        <div className="space-y-0.5">
                          <a
                            href={`tel:${item.phone}`}
                            className="font-semibold text-slate-900 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Phone className="h-3 w-3 text-slate-400" />
                            {item.phone || 'N/A'}
                          </a>
                          {item.whatsapp && item.whatsapp !== item.phone && (
                            <span className="text-[11px] text-emerald-700 font-medium">
                              WA: {item.whatsapp}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs font-medium text-slate-600">
                        {item.village?.name || 'Choutuppal'}
                      </td>

                      <td className="px-4 py-4">
                        {item.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle className="h-3 w-3" /> Approved
                          </span>
                        ) : item.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
                            <Clock className="h-3 w-3" /> Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-bold text-rose-700 border border-rose-200">
                            <XCircle className="h-3 w-3" /> Rejected
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          <button
                            onClick={() => handleTogglePremium(item.id, Boolean(item.isPremium))}
                            className={`rounded-md px-2 py-0.5 text-[11px] font-bold border transition ${
                              item.isPremium
                                ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                                : 'bg-slate-50 text-slate-400 border-slate-200 hover:text-slate-700'
                            }`}
                            title="Toggle Gold Premium Tier"
                          >
                            {item.isPremium ? '★ Premium' : '+ Free'}
                          </button>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {item.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'APPROVED')}
                              className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700 shadow-2xs transition"
                              title="Approve Listing"
                            >
                              Approve
                            </button>
                          )}

                          {item.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleUpdateStatus(item.id, 'REJECTED')}
                              className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-rose-700 border border-rose-200 hover:bg-rose-50 transition"
                              title="Reject Listing"
                            >
                              Reject
                            </button>
                          )}

                          <button
                            onClick={() => openEditModal(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 rounded-md hover:bg-slate-100 transition"
                            title="Edit Listing"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <Link
                            href={`/business/${item.slug}`}
                            target="_blank"
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100 transition"
                            title="View Public Page"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() => handleDeleteListing(item.id, item.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Edit Listing Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Edit Business Listing
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Update details, phone contacts, category, and approval status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Shop / Business Name</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">WhatsApp</label>
                <input
                  type="text"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id || c.slug} value={c.id || c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                >
                  <option value="APPROVED">APPROVED (ఆమోదించినవి)</option>
                  <option value="PENDING">PENDING (పెండింగ్)</option>
                  <option value="REJECTED">REJECTED (తిరస్కరించినవి)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Address / Landmark</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  className="rounded border-slate-300 text-blue-700 focus:ring-blue-700 h-4 w-4"
                />
                <span>Gold Premium Badge (#CA8A04)</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded border-slate-300 text-blue-700 focus:ring-blue-700 h-4 w-4"
                />
                <span>Feature on Homepage</span>
              </label>
            </div>

            <DialogFooter className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditModalOpen(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
              >
                Save Changes
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create New Listing Modal */}
      <Dialog open={createModalOpen} onOpenChange={setCreateModalOpen}>
        <DialogContent className="max-w-lg bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Register New Business Listing
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Directly add a shop to Choutuppal Directory with immediate approval.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateListing} className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Shop / Business Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sri Balaji Hardware & Electricals"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700">WhatsApp</label>
                <input
                  type="tel"
                  placeholder="WhatsApp number"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Category</label>
                <select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id || c.slug} value={c.id || c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                >
                  <option value="APPROVED">APPROVED (ఆమోదించినవి)</option>
                  <option value="PENDING">PENDING (పెండింగ్)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Address / Location</label>
              <input
                type="text"
                placeholder="Main Road, Near Bus Stand, Choutuppal"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPremium}
                  onChange={(e) => setFormData({ ...formData, isPremium: e.target.checked })}
                  className="rounded border-slate-300 text-blue-700 focus:ring-blue-700 h-4 w-4"
                />
                <span>Gold Premium Badge</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="rounded border-slate-300 text-blue-700 focus:ring-blue-700 h-4 w-4"
                />
                <span>Feature on Homepage</span>
              </label>
            </div>

            <DialogFooter className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
              >
                Add Listing
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bulk Import CSV/JSON Tool Modal */}
      <BulkImportModal
        open={bulkImportOpen}
        onOpenChange={setBulkImportOpen}
        onSuccess={fetchListings}
        categories={categories}
        villages={villages}
      />
    </div>
  )
}
