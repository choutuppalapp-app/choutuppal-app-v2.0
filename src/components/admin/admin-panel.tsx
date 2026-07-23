'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Store,
  Clock,
  Image as ImageIcon,
  Check,
  X,
  Ban,
  ShieldCheck,
  Crown,
  KeyRound,
  ChevronLeft,
  Loader2,
  Megaphone,
  Save,
  RefreshCw,
  Home,
  Trash2,
  Newspaper,
  UserPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { ContentTab } from './content-tab'
import { CreateUserModal } from './create-user-modal'

interface Stats {
  totalUsers: number
  totalListings: number
  pendingApprovals: number
  pendingListings: number
  pendingRealEstate: number
  activeBanners: number
  activeStories: number
  totalProperties: number
  bannedUsers: number
}

interface PendingListing {
  id: string
  slug: string
  title: string
  description: string
  coverImage: string | null
  logo: string | null
  phone: string | null
  createdAt: string
  category?: { name: string } | null
  village?: { name: string } | null
  owner: { id: string; name: string | null; username: string | null; email: string }
}

interface PendingRE extends Omit<PendingListing, 'category'> {
  type: string
  listingType: string
  price: number
  address: string
}

interface PendingBanner {
  id: string
  imageUrl: string
  title: string | null
  link: string | null
  position: string
  createdAt: string
  owner: { id: string; name: string | null; username: string | null; email: string }
}

interface AdminUser {
  id: string
  name: string | null
  username: string | null
  email: string
  phone: string | null
  role: string
  isBanned: boolean
  isPublic: boolean
  planTier: string
  createdAt: string
  image: string | null
  _count: { listings: number; realEstates: number }
}

export function AdminPanel({ adminName }: { adminName: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-4 lg:px-6">
          <Link href="/" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-base font-black text-white">
            C
          </span>
          <div className="leading-none">
            <h1 className="text-sm font-extrabold text-slate-900">Admin Panel</h1>
            <p className="text-[10px] uppercase tracking-[0.18em] text-blue-600">
              {adminName}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="ml-auto hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 sm:flex"
          >
            <Home className="h-3.5 w-3.5" /> Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-4 lg:px-6">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-6">
            <TabsTrigger value="overview" className="gap-1.5 text-xs sm:text-sm">
              <Home className="h-3.5 w-3.5" /> Overview
            </TabsTrigger>
            <TabsTrigger value="approvals" className="gap-1.5 text-xs sm:text-sm">
              <Clock className="h-3.5 w-3.5" /> Approvals
            </TabsTrigger>
            <TabsTrigger value="content" className="gap-1.5 text-xs sm:text-sm">
              <Newspaper className="h-3.5 w-3.5" /> Content
            </TabsTrigger>
            <TabsTrigger value="stories" className="gap-1.5 text-xs sm:text-sm">
              <ImageIcon className="h-3.5 w-3.5" /> Stories
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-1.5 text-xs sm:text-sm">
              <Users className="h-3.5 w-3.5" /> Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5 text-xs sm:text-sm">
              <Megaphone className="h-3.5 w-3.5" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="approvals"><ApprovalsTab /></TabsContent>
          <TabsContent value="content"><ContentTab /></TabsContent>
          <TabsContent value="stories"><StoriesTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Overview                                                                    */
/* -------------------------------------------------------------------------- */

function OverviewTab() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((j) => j.ok && setStats(j.stats))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <CenteredLoader />
  if (!stats) return <ErrorState />

  const cards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, grad: 'from-blue-600 to-blue-400', sub: `${stats.bannedUsers} banned` },
    { label: 'Total Listings', value: stats.totalListings, icon: Store, grad: 'from-amber-500 to-amber-400', sub: 'All businesses/services' },
    { label: 'Pending Approvals', value: stats.pendingApprovals, icon: Clock, grad: 'from-rose-500 to-amber-400', sub: `${stats.pendingListings} listings · ${stats.pendingRealEstate} RE` },
    { label: 'Active Banners', value: stats.activeBanners, icon: ImageIcon, grad: 'from-blue-500 to-amber-400', sub: 'Live (24hr)' },
    { label: 'Active Stories', value: stats.activeStories, icon: ImageIcon, grad: 'from-amber-500 to-blue-400', sub: 'Live (24hr)' },
    { label: 'Properties', value: stats.totalProperties, icon: Home, grad: 'from-blue-500 to-blue-400', sub: 'Real estate total' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="hover-glow rounded-2xl glass p-4">
              <div className={cn('mb-2 grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br text-white shadow', c.grad)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-2xl font-black text-slate-900">{c.value.toLocaleString('en-IN')}</div>
              <div className="text-xs font-semibold text-slate-700">{c.label}</div>
              <div className="text-[10px] text-slate-400">{c.sub}</div>
            </div>
          )
        })}
      </div>

      <div className="rounded-3xl glass-strong p-6">
        <h2 className="text-lg font-bold text-slate-900">Welcome, Admin 👋</h2>
        <p className="mt-1 text-sm text-slate-500">
          Review pending listings, manage users, and control platform settings from the tabs above.
        </p>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Pending Approvals                                                          */
/* -------------------------------------------------------------------------- */

function ApprovalsTab() {
  const [listings, setListings] = useState<PendingListing[]>([])
  const [realEstates, setRealEstates] = useState<PendingRE[]>([])
  const [banners, setBanners] = useState<PendingBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/pending')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setListings(j.listings)
          setRealEstates(j.realEstates)
          setBanners(j.banners ?? [])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function approve(id: string, type: 'listing' | 'realestate' | 'banner') {
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/approve/${id}?type=${type}`, { method: 'PATCH' })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed')
      toast.success('Approved')
      if (type === 'listing') setListings((p) => p.filter((l) => l.id !== id))
      else if (type === 'realestate') setRealEstates((p) => p.filter((r) => r.id !== id))
      else setBanners((p) => p.filter((b) => b.id !== id))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(null)
    }
  }

  async function reject(id: string, type: 'listing' | 'realestate' | 'banner') {
    if (!confirm('Reject and delete this submission? Its media will be removed.')) return
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/reject/${id}?type=${type}`, { method: 'DELETE' })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed')
      toast.success('Rejected & deleted')
      if (type === 'listing') setListings((p) => p.filter((l) => l.id !== id))
      else if (type === 'realestate') setRealEstates((p) => p.filter((r) => r.id !== id))
      else setBanners((p) => p.filter((b) => b.id !== id))
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <CenteredLoader />

  const empty = listings.length === 0 && realEstates.length === 0 && banners.length === 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Pending Approvals</h2>
          <p className="text-sm text-slate-500">
            {listings.length} listings · {realEstates.length} properties · {banners.length} banners awaiting review
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {empty ? (
        <div className="rounded-3xl glass p-10 text-center">
          <Check className="mx-auto h-10 w-10 text-emerald-500" />
          <h3 className="mt-2 font-bold text-slate-900">All caught up!</h3>
          <p className="text-sm text-slate-500">No pending submissions right now.</p>
        </div>
      ) : null}

      {/* Listings */}
      {listings.length > 0 ? (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
            <Store className="h-4 w-4 text-blue-500" /> Business / Service Listings
          </h3>
          <div className="grid gap-3 lg:grid-cols-2">
            {listings.map((l) => (
              <ApprovalCard
                key={l.id}
                title={l.title}
                desc={l.description}
                cover={l.coverImage}
                logo={l.logo}
                meta={[l.category?.name, l.village?.name, l.phone].filter(Boolean).join(' · ')}
                owner={l.owner.name ?? l.owner.email}
                createdAt={l.createdAt}
                busy={busy === l.id}
                onApprove={() => approve(l.id, 'listing')}
                onReject={() => reject(l.id, 'listing')}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Real Estate */}
      {realEstates.length > 0 ? (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
            <Home className="h-4 w-4 text-amber-500" /> Real Estate
          </h3>
          <div className="grid gap-3 lg:grid-cols-2">
            {realEstates.map((r) => (
              <ApprovalCard
                key={r.id}
                title={r.title}
                desc={`${r.type} · ${r.listingType} · ₹${new Intl.NumberFormat('en-IN').format(r.price)}`}
                cover={r.coverImage}
                meta={[r.village?.name, r.address].filter(Boolean).join(' · ')}
                owner={r.owner.name ?? r.owner.email}
                createdAt={r.createdAt}
                busy={busy === r.id}
                onApprove={() => approve(r.id, 'realestate')}
                onReject={() => reject(r.id, 'realestate')}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Banners */}
      {banners.length > 0 ? (
        <section className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
            <Megaphone className="h-4 w-4 text-blue-500" /> Banner Ads
          </h3>
          <div className="grid gap-3 lg:grid-cols-2">
            {banners.map((b) => (
              <ApprovalCard
                key={b.id}
                title={b.title ?? 'Untitled Banner'}
                desc={`Position: ${b.position}${b.link ? ' · Link: ' + b.link : ''}`}
                cover={b.imageUrl}
                meta={`by ${b.owner.name ?? b.owner.email}`}
                owner={b.owner.name ?? b.owner.email}
                createdAt={b.createdAt}
                busy={busy === b.id}
                onApprove={() => approve(b.id, 'banner')}
                onReject={() => reject(b.id, 'banner')}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function ApprovalCard({
  title,
  desc,
  cover,
  logo,
  meta,
  owner,
  createdAt,
  busy,
  onApprove,
  onReject,
}: {
  title: string
  desc: string
  cover?: string | null
  logo?: string | null
  meta: string
  owner: string
  createdAt: string
  busy: boolean
  onApprove: () => void
  onReject: () => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl glass">
      <div className="flex gap-3 p-3">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl">
          {cover || logo ? (
             
            <img src={(cover || logo)!} alt={title} className="h-full w-full object-cover" />
          ) : (
            <div className="grid h-full w-full place-items-center gradient-brand text-2xl font-black text-white">
              {title.charAt(0)}
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="truncate font-bold text-slate-900">{title}</h4>
          <p className="line-clamp-2 text-xs text-slate-500">{desc}</p>
          <p className="mt-1 truncate text-[11px] text-slate-400">{meta}</p>
          <p className="text-[11px] text-slate-400">
            by {owner} · {new Date(createdAt).toLocaleDateString('en-IN')}
          </p>
        </div>
      </div>
      <div className="flex gap-2 border-t border-slate-100 p-2">
        <Button
          size="sm"
          onClick={onApprove}
          disabled={busy}
          className="flex-1 gap-1.5 bg-emerald-500 text-white hover:bg-emerald-600"
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onReject}
          disabled={busy}
          className="flex-1 gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
        >
          <X className="h-3.5 w-3.5" /> Reject
        </Button>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* User Management                                                            */
/* -------------------------------------------------------------------------- */

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [resetId, setResetId] = useState<string | null>(null)
  const [newPw, setNewPw] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((j) => j.ok && setUsers(j.users))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { load() }, [load])

  async function act(id: string, action: string, extra?: Record<string, unknown>) {
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...extra }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed')
      toast.success('Done')
      load()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setBusy(null)
    }
  }

  async function submitReset(id: string) {
    if (newPw.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    await act(id, 'reset_password', { password: newPw })
    setResetId(null)
    setNewPw('')
  }

  if (loading) return <CenteredLoader />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">User Management</h2>
          <p className="text-sm text-slate-500">{users.length} registered users</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setCreateOpen(true)} size="sm" className="gap-1.5 gradient-brand text-white">
            <UserPlus className="h-3.5 w-3.5" /> Create User
          </Button>
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl glass">
        <div className="max-h-[70vh] overflow-y-auto fancy-scroll">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white/80 backdrop-blur">
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="p-3">User</th>
                <th className="hidden p-3 sm:table-cell">Role</th>
                <th className="hidden p-3 md:table-cell">Listings</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-white/50">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full gradient-brand text-xs font-bold text-white">
                        {(u.name ?? u.email).charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-900">
                          {u.name ?? 'Unnamed'}
                          {u.isBanned ? (
                            <Badge className="ml-2 bg-red-100 text-red-700 hover:bg-red-100">Banned</Badge>
                          ) : null}
                        </p>
                        <p className="truncate text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden p-3 sm:table-cell">
                    <Select
                      value={u.role}
                      onValueChange={(v) => {
                        if (v === 'USER') act(u.id, 'demote_user')
                        else if (v === 'AGENT') act(u.id, 'promote_agent')
                        else if (v === 'ADMIN') act(u.id, 'promote_admin')
                      }}
                    >
                      <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">USER</SelectItem>
                        <SelectItem value="AGENT">AGENT</SelectItem>
                        <SelectItem value="ADMIN">ADMIN</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="hidden p-3 text-slate-600 md:table-cell">
                    {u._count.listings} listings · {u._count.realEstates} RE
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      {u.isBanned ? (
                        <IconBtn icon={ShieldCheck} label="Unban" tone="green" disabled={busy === u.id} onClick={() => act(u.id, 'unban')} />
                      ) : (
                        <IconBtn icon={Ban} label="Ban" tone="red" disabled={busy === u.id} onClick={() => act(u.id, 'ban')} />
                      )}
                      <IconBtn icon={KeyRound} label="Reset PW" tone="blue" disabled={busy === u.id} onClick={() => { setResetId(u.id); setNewPw('') }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset password modal */}
      {resetId ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setResetId(null)}>
          <div className="w-full max-w-sm rounded-3xl glass-strong p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="flex items-center gap-2 font-bold text-slate-900">
              <KeyRound className="h-4 w-4 text-blue-600" /> Reset Password
            </h3>
            <p className="mt-1 text-xs text-slate-500">Enter a new password for this user.</p>
            <Label className="mt-3 block text-xs font-semibold text-slate-600">New Password</Label>
            <Input
              type="text"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              placeholder="min 6 characters"
              className="mt-1"
              autoFocus
            />
            <div className="mt-4 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setResetId(null)}>Cancel</Button>
              <Button className="flex-1 gap-1.5 gradient-brand text-white" onClick={() => submitReset(resetId)}>
                <Save className="h-4 w-4" /> Reset
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Create user modal */}
      <CreateUserModal open={createOpen} onOpenChange={setCreateOpen} onCreated={load} />
    </div>
  )
}

function IconBtn({
  icon: Icon,
  label,
  tone,
  disabled,
  onClick,
}: {
  icon: typeof Ban
  label: string
  tone: 'red' | 'green' | 'blue'
  disabled: boolean
  onClick: () => void
}) {
  const tones = {
    red: 'border-red-200 text-red-600 hover:bg-red-50',
    green: 'border-emerald-200 text-emerald-600 hover:bg-emerald-50',
    blue: 'border-blue-200 text-blue-600 hover:bg-blue-50',
  }[tone]
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn('grid h-8 w-8 place-items-center rounded-lg border bg-white transition disabled:opacity-50', tones)}
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/* Settings                                                                    */
/* -------------------------------------------------------------------------- */

function SettingsTab() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((j) => j.ok && setSettings(j.settings))
      .finally(() => setLoading(false))
  }, [])

  function update(key: string, value: string) {
    setSettings((p) => ({ ...p, [key]: value }))
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed')
      toast.success('Settings saved')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <CenteredLoader />

  const spinOn = settings.spin_enabled !== 'false'
  const pricingFree = settings.pricing_free !== 'false'

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Platform Settings</h2>
          <p className="text-sm text-slate-500">Control features & content shown across the app.</p>
        </div>
        <Button onClick={save} disabled={saving} className="gap-1.5 gradient-brand text-white">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save
        </Button>
      </div>

      {/* Toggles */}
      <div className="grid gap-3 sm:grid-cols-2">
        <SettingCard
          title="Spin & Win"
          desc={spinOn ? 'Live — users can spin daily.' : 'Disabled — wheel hidden.'}
          on={spinOn}
          onToggle={(v) => update('spin_enabled', v ? 'true' : 'false')}
          icon={Crown}
        />
        <SettingCard
          title="Pricing — All FREE"
          desc={pricingFree ? 'Early Bird: all plans free.' : 'Paid pricing enabled.'}
          on={pricingFree}
          onToggle={(v) => update('pricing_free', v ? 'true' : 'false')}
          icon={Crown}
        />
      </div>

      {/* Announcement ticker */}
      <div className="rounded-3xl glass p-5">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
          <Megaphone className="h-4 w-4 text-blue-500" /> Announcement Ticker
        </h3>
        <p className="mb-2 text-xs text-slate-500">
          Use <code className="rounded bg-slate-100 px-1">|</code> to separate messages. Shown scrolling on the home page.
        </p>
        <Textarea
          value={settings.announcement_ticker ?? ''}
          onChange={(e) => update('announcement_ticker', e.target.value)}
          rows={3}
          placeholder="Message 1 | Message 2 | Message 3"
        />
      </div>

      {/* Banner price */}
      <div className="rounded-3xl glass p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
          <Store className="h-4 w-4 text-amber-500" /> Banner Ad Pricing
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-600">
            {settings.banner_free === 'true' ? 'FREE (Early Bird)' : `₹${settings.banner_price ?? '99'}/day`}
          </span>
          <Switch
            checked={settings.banner_free === 'true'}
            onCheckedChange={(v) => update('banner_free', v ? 'true' : 'false')}
          />
          <span className="text-xs text-slate-400">Toggle Free/Paid</span>
        </div>
        {settings.banner_free !== 'true' ? (
          <div className="mt-3">
            <Label className="mb-1 block text-xs font-semibold text-slate-600">Price (₹/day)</Label>
            <Input
              type="number"
              value={settings.banner_price ?? '99'}
              onChange={(e) => update('banner_price', e.target.value)}
              className="max-w-[160px]"
            />
          </div>
        ) : null}
      </div>

      {/* Integrations: API keys, GA4, FB Pixel */}
      <div className="rounded-3xl glass p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
          <KeyRound className="h-4 w-4 text-blue-500" /> Integrations & API Keys
        </h3>
        <div className="space-y-3">
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-600">Google Analytics 4 (GA4) Measurement ID</Label>
            <Input
              value={settings.ga4_id ?? ''}
              onChange={(e) => update('ga4_id', e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="font-mono text-xs"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-600">Facebook Pixel ID</Label>
            <Input
              value={settings.fb_pixel_id ?? ''}
              onChange={(e) => update('fb_pixel_id', e.target.value)}
              placeholder="123456789012345"
              className="font-mono text-xs"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-600">Google Maps API Key</Label>
            <Input
              value={settings.google_maps_key ?? ''}
              onChange={(e) => update('google_maps_key', e.target.value)}
              placeholder="AIzaSy…"
              className="font-mono text-xs"
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-600">YouTube API Key (for Shorts sync)</Label>
            <Input
              value={settings.youtube_api_key ?? ''}
              onChange={(e) => update('youtube_api_key', e.target.value)}
              placeholder="AIzaSy…"
              className="font-mono text-xs"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function SettingCard({
  title,
  desc,
  on,
  onToggle,
  icon: Icon,
}: {
  title: string
  desc: string
  on: boolean
  onToggle: (v: boolean) => void
  icon: typeof Crown
}) {
  return (
    <div className="rounded-3xl glass p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl gradient-brand-soft text-blue-600">
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <h3 className="font-bold text-slate-900">{title}</h3>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
        <Switch checked={on} onCheckedChange={onToggle} />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Stories Moderation                                                          */
/* -------------------------------------------------------------------------- */

interface AdminStory {
  id: string
  mediaUrl: string
  mediaType: string
  caption: string | null
  views: number
  expiresAt: string
  createdAt: string
  owner: { id: string; name: string | null; username: string | null; email: string; image: string | null }
  _count: { storyViews: number; storyReplies: number }
}

function StoriesTab() {
  const [stories, setStories] = useState<AdminStory[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/stories')
      .then((r) => r.json())
      .then((j) => j.ok && setStories(j.stories))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let active = true
    fetch('/api/admin/stories')
      .then((r) => r.json())
      .then((j) => { if (active && j.ok) setStories(j.stories) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function del(id: string) {
    if (!confirm('Delete this story? The media will be removed from R2.')) return
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/stories/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setStories((p) => p.filter((s) => s.id !== id))
      toast.success('Story deleted')
    } catch {
      toast.error('Failed to delete')
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <CenteredLoader />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Active Stories</h2>
          <p className="text-sm text-slate-500">{stories.length} stories currently live (auto-expire in 24h)</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {stories.length === 0 ? (
        <div className="rounded-3xl glass p-10 text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-2 font-bold text-slate-900">No active stories</h3>
          <p className="text-sm text-slate-500">All clear — no stories to moderate right now.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((s) => (
            <div key={s.id} className="overflow-hidden rounded-2xl glass">
              <div className="relative aspect-[9/16] max-h-64">
                {s.mediaUrl ? (
                  s.mediaType === 'VIDEO' ? (
                    <video src={s.mediaUrl} className="h-full w-full object-cover" muted />
                  ) : (
                    <img src={s.mediaUrl} alt={s.caption ?? 'story'} className="h-full w-full object-cover" />
                  )
                ) : (
                  <div className="grid h-full w-full place-items-center gradient-brand p-3 text-center">
                    <span className="text-[11px] font-medium text-white">{s.caption ?? 'Story'}</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="line-clamp-1 text-xs font-semibold text-slate-900">{s.caption ?? 'No caption'}</p>
                <p className="text-[11px] text-slate-500">
                  by {s.owner.name ?? s.owner.email} · {new Date(s.createdAt).toLocaleString('en-IN')}
                </p>
                <div className="mt-1.5 flex items-center gap-3 text-[10px] text-slate-400">
                  <span>{s._count.storyViews} views</span>
                  <span>{s._count.storyReplies} replies</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => del(s.id)}
                  disabled={busy === s.id}
                  className="mt-2 w-full gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                >
                  {busy === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Delete (spam)
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Shared                                                                      */
/* -------------------------------------------------------------------------- */

function CenteredLoader() {
  return (
    <div className="grid place-items-center py-20">
      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
    </div>
  )
}

function ErrorState() {
  return (
    <div className="rounded-3xl glass p-10 text-center">
      <p className="font-bold text-slate-900">Failed to load</p>
      <p className="text-sm text-slate-500">Please try refreshing.</p>
    </div>
  )
}
