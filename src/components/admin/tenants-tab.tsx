'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Globe, Building2, Phone, Palette, Loader2, Save, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'

interface Tenant {
  id: string
  name: string
  domain: string
  logoUrl: string | null
  primaryColor: string
  adminPhone: string
  subscriptionStatus?: string
  subscriptionExpiresAt?: string | null
  createdAt: string
  _count?: {
    users: number
    listings: number
    realEstates: number
    news: number
    blogs: number
  }
}

export function TenantsTab() {
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null)
  const [saving, setSaving] = useState(false)
  const [renewingId, setRenewingId] = useState<string | null>(null)

  // Form State
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#1d4ed8')
  const [adminPhone, setAdminPhone] = useState('')

  useEffect(() => {
    fetchTenants()
  }, [])

  async function fetchTenants() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/tenants')
      const json = await res.json()
      if (json.ok && Array.isArray(json.tenants)) {
        setTenants(json.tenants)
      }
    } catch {
      toast.error('Failed to load tenants')
    } finally {
      setLoading(false)
    }
  }

  async function renewSubscription(tenantId: string) {
    setRenewingId(tenantId)
    try {
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      const res = await fetch(`/api/admin/tenants/${tenantId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionStatus: 'ACTIVE',
          subscriptionExpiresAt: expiresAt,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to renew subscription')

      toast.success('Subscription renewed for 30 days!')
      fetchTenants()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Renewal failed')
    } finally {
      setRenewingId(null)
    }
  }

  function openCreateModal() {
    setEditingTenant(null)
    setName('')
    setDomain('')
    setLogoUrl('')
    setPrimaryColor('#1d4ed8')
    setAdminPhone('')
    setModalOpen(true)
  }

  function openEditModal(tenant: Tenant) {
    setEditingTenant(tenant)
    setName(tenant.name)
    setDomain(tenant.domain)
    setLogoUrl(tenant.logoUrl || '')
    setPrimaryColor(tenant.primaryColor || '#1d4ed8')
    setAdminPhone(tenant.adminPhone || '')
    setModalOpen(true)
  }

  async function saveTenant() {
    if (!name.trim() || !domain.trim() || !adminPhone.trim()) {
      toast.error('Name, Domain, and Admin Phone are required.')
      return
    }

    setSaving(true)
    try {
      if (editingTenant) {
        const res = await fetch(`/api/admin/tenants/${editingTenant.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            domain,
            logoUrl,
            primaryColor,
            adminPhone,
          }),
        })
        const json = await res.json()
        if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to update partner city')
        toast.success('Partner city updated!')
      } else {
        const res = await fetch('/api/admin/tenants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            domain,
            logoUrl,
            primaryColor,
            adminPhone,
          }),
        })
        const json = await res.json()
        if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to create partner city')
        toast.success('New partner city created successfully!')
      }

      setModalOpen(false)
      fetchTenants()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed')
    } finally {
      setSaving(false)
    }
  }

  async function deleteTenant(id: string, tenantName: string) {
    if (!confirm(`Are you sure you want to delete "${tenantName}"? This action cannot be undone.`)) return

    try {
      const res = await fetch(`/api/admin/tenants/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to delete')
      toast.success('Partner city deleted')
      setTenants((prev) => prev.filter((t) => t.id !== id))
    } catch {
      toast.error('Failed to delete tenant')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900">Multi-Tenant Cities / Partners</h2>
          <p className="text-xs text-slate-500">
            Manage white-label city apps, domain mappings, logos, subscriptions, and admin contacts.
          </p>
        </div>
        <Button onClick={openCreateModal} className="gap-2 gradient-brand text-white shadow-md">
          <Plus className="h-4 w-4" /> Add Partner City
        </Button>
      </div>

      {/* Tenant List */}
      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : tenants.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white/50 p-8 text-center">
          <Globe className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-2 text-sm font-bold text-slate-700">No partner cities registered yet</h3>
          <p className="mt-1 text-xs text-slate-500">
            Click "Add Partner City" to configure white-label domains like `warangalapp.in`.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tenants.map((t) => (
            <div key={t.id} className="hover-lift overflow-hidden rounded-3xl glass p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  {t.logoUrl ? (
                    <img src={t.logoUrl} alt={t.name} className="h-10 w-10 rounded-xl object-contain bg-white p-1 border border-slate-200" />
                  ) : (
                    <div
                      className="grid h-10 w-10 place-items-center rounded-xl text-white font-extrabold text-base shadow"
                      style={{ backgroundColor: t.primaryColor }}
                    >
                      {t.name.substring(0, 1).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{t.name}</h3>
                    <a
                      href={`https://${t.domain}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      {t.domain} <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <Badge className={t.subscriptionStatus === 'EXPIRED' ? 'bg-rose-100 text-rose-700 hover:bg-rose-100' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100'}>
                  {t.subscriptionStatus === 'EXPIRED' ? 'EXPIRED' : 'ACTIVE'}
                </Badge>
              </div>

              <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500"><Phone className="h-3.5 w-3.5 text-blue-500" /> Admin Phone:</span>
                  <span className="font-semibold text-slate-800">{t.adminPhone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-slate-500"><Palette className="h-3.5 w-3.5 text-amber-500" /> Brand Color:</span>
                  <div className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span className="h-3.5 w-3.5 rounded-full border border-slate-300 shadow-sm" style={{ backgroundColor: t.primaryColor }} />
                    {t.primaryColor}
                  </div>
                </div>
              </div>

              {t._count ? (
                <div className="mt-3 flex flex-wrap gap-1.5 border-t border-slate-100 pt-2 text-[10px]">
                  <Badge variant="outline" className="bg-slate-50">{t._count.users} Users</Badge>
                  <Badge variant="outline" className="bg-slate-50">{t._count.listings} Listings</Badge>
                  <Badge variant="outline" className="bg-slate-50">{t._count.realEstates} Properties</Badge>
                </div>
              ) : null}

              <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-3">
                <Button
                  size="sm"
                  onClick={() => renewSubscription(t.id)}
                  disabled={renewingId === t.id}
                  className="w-full gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700 text-xs"
                >
                  {renewingId === t.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  Renew Subscription (30 Days)
                </Button>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEditModal(t)} className="flex-1 gap-1 text-xs">
                    <Edit2 className="h-3.5 w-3.5" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteTenant(t.id, t.name)}
                    className="gap-1 border-red-200 text-red-600 hover:bg-red-50 text-xs"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Tenant Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              {editingTenant ? 'Edit Partner City' : 'Add New Partner City'}
            </DialogTitle>
            <DialogDescription>
              Configure multi-tenant domain, branding, and partner admin details.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2 text-xs">
            <div>
              <Label className="mb-1 block font-semibold text-slate-700">App Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Warangal App"
              />
            </div>

            <div>
              <Label className="mb-1 block font-semibold text-slate-700">Domain Name *</Label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. warangalapp.in"
              />
            </div>

            <div>
              <Label className="mb-1 block font-semibold text-slate-700">Admin Phone Number *</Label>
              <Input
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder="e.g. 9876543210"
              />
            </div>

            <div>
              <Label className="mb-1 block font-semibold text-slate-700">Logo Image URL (Optional)</Label>
              <Input
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://images.choutuppal.in/..."
              />
            </div>

            <div>
              <Label className="mb-1 block font-semibold text-slate-700">Primary Brand Color</Label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded border border-slate-200 p-0.5 bg-white"
                />
                <Input
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#1d4ed8"
                  className="flex-1 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveTenant} disabled={saving} className="gap-1.5 gradient-brand text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {editingTenant ? 'Update City' : 'Create City'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
