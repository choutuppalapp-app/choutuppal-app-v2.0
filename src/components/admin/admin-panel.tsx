'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  Plus,
  Bell,
  Send,
  Upload,
  FileSpreadsheet,
  LogOut,
  Search,
  Menu,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ContentTab } from './content-tab'
import { CreateUserModal } from './create-user-modal'
import { AddListingModal } from '@/components/dashboard/add-listing-modal'
import { AdminListingsTab } from './listings-tab'
import { AdminRealEstateTab } from './real-estate-tab'
import { AdminBannersTab } from './banners-tab'
import { AutoLinksTab } from './auto-links-tab'
import { TenantsTab } from './tenants-tab'
import { WhatsAppCrmTab } from './whatsapp-crm-tab'
import { Link2, Globe, MessageSquare } from 'lucide-react'

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
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const navItems = [
    { value: 'overview', label: 'Overview', icon: Home },
    { value: 'approvals', label: 'Approvals', icon: Clock },
    { value: 'tenants', label: 'Tenants', icon: Globe },
    { value: 'content', label: 'Content', icon: Newspaper },
    { value: 'listings', label: 'Listings', icon: Store },
    { value: 'realestate', label: 'Real Estate', icon: Home },
    { value: 'stories', label: 'Stories', icon: ImageIcon },
    { value: 'banners', label: 'Banners', icon: ImageIcon },
    { value: 'users', label: 'Users', icon: Users },
    { value: 'push', label: 'Push', icon: Bell },
    { value: 'whatsapp', label: 'WhatsApp CRM', icon: MessageSquare },
    { value: 'autolinks', label: 'Auto Links', icon: Link2 },
    { value: 'settings', label: 'Settings', icon: Megaphone },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="md:hidden grid h-9 w-9 place-items-center rounded-lg border border-slate-200"
            title="Toggle Menu"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </Button>

          <Link href="/" className="hidden md:grid h-9 w-9 place-items-center rounded-lg border border-slate-200" title="Back to home">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <img src="/logo.png" alt="Choutuppal App" className="h-8 w-auto" />
          <span className="font-bold text-slate-900 text-sm sm:text-base">Admin Panel</span>
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={() => signOut({ callbackUrl: '/' })}
              variant="outline"
              size="sm"
              className="gap-1.5 border-slate-200 text-slate-700 hover:text-red-600 text-xs sm:text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Slide-in Mobile Sidebar Drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
          <div
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white p-5 shadow-2xl space-y-4 overflow-y-auto transform transition-transform duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Logo" className="h-7 w-auto" />
                <span className="font-bold text-sm text-slate-900">Admin Navigation</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.value
                return (
                  <button
                    key={item.value}
                    onClick={() => {
                      setActiveTab(item.value)
                      setDrawerOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition',
                      isActive ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-7xl px-3 py-6 sm:px-4 lg:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto no-scrollbar whitespace-nowrap justify-start gap-1.5 p-1 bg-slate-100/80 rounded-xl">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <TabsTrigger key={item.value} value={item.value} className="gap-1.5 text-xs shrink-0 px-3 py-1.5">
                  <Icon className="h-3.5 w-3.5" /> {item.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="approvals"><ApprovalsTab /></TabsContent>
          <TabsContent value="tenants"><TenantsTab /></TabsContent>
          <TabsContent value="content"><ContentTab /></TabsContent>
          <TabsContent value="listings"><AdminListingsTab /></TabsContent>
          <TabsContent value="realestate"><AdminRealEstateTab /></TabsContent>
          <TabsContent value="stories"><StoriesTab /></TabsContent>
          <TabsContent value="banners"><AdminBannersTab /></TabsContent>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="push"><PushTab /></TabsContent>
          <TabsContent value="whatsapp"><WhatsAppCrmTab /></TabsContent>
          <TabsContent value="autolinks"><AutoLinksTab /></TabsContent>
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
  const [addListingOpen, setAddListingOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [villages, setVillages] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([])

  useEffect(() => {
    let active = true
    fetch('/api/admin/stats')
      .then((r) => r.json())
      .then((j) => { if (active && j.ok) setStats(j.stats) })
      .finally(() => { if (active) setLoading(false) })
    fetch('/api/villages').then((r) => r.json()).then((j) => { if (active && j.ok) setVillages(j.villages) }).catch(() => {})
    fetch('/api/admin/content').then((r) => r.json()).then((j) => { if (active && j.ok) setCategories(j.categories) }).catch(() => {})
    return () => { active = false }
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

      <AddListingModal
        open={addListingOpen}
        onOpenChange={setAddListingOpen}
        villages={villages}
        categories={categories}
        editingItem={editingItem}
      />
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
             
            <img loading="lazy" decoding="async" src={(cover || logo)!} alt={title} className="h-full w-full object-cover" />
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

interface UserListingsDialogProps {
  user: AdminUser | null
  onClose: () => void
  categories: any[]
  villages: any[]
  onEdit: (item: any) => void
}

function UserListingsDialog({ user, onClose, categories, villages, onEdit }: UserListingsDialogProps) {
  const [listings, setListings] = useState<any[]>([])
  const [realEstates, setRealEstates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadListings = useCallback(() => {
    if (!user) return
    setLoading(true)
    Promise.all([
      fetch(`/api/listings?userId=${user.id}`).then((r) => r.json()),
      fetch(`/api/real-estate?userId=${user.id}`).then((r) => r.json()),
    ])
      .then(([lRes, reRes]) => {
        if (lRes.ok) setListings(lRes.listings)
        if (reRes.ok) setRealEstates(reRes.realEstates)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    loadListings()
  }, [loadListings])

  async function deleteListing(id: string) {
    if (!confirm('Delete this listing?')) return
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Deleted')
      loadListings()
    } catch {
      toast.error('Failed to delete')
    }
  }

  async function deleteRealEstate(id: string) {
    if (!confirm('Delete this property?')) return
    try {
      const res = await fetch(`/api/real-estate/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Deleted')
      loadListings()
    } catch {
      toast.error('Failed to delete')
    }
  }

  if (!user) return null

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/40 p-4 animate-in fade-in duration-200" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="text-lg font-black text-slate-900">Listings for {user.name ?? user.email}</h3>
            <p className="text-xs text-slate-500">Manage business and property listings owned by this user.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>Close</Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto py-4 space-y-6 fancy-scroll">
            {/* Listings Section */}
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1.5"><Store className="h-4 w-4 text-blue-500" /> Business/Service Listings ({listings.length})</h4>
              {listings.length === 0 ? (
                <p className="text-xs text-slate-400 pl-5">No listings found.</p>
              ) : (
                <div className="space-y-2">
                  {listings.map((l) => (
                    <div key={l.id} className="flex items-center justify-between border rounded-xl p-3 hover:bg-slate-50">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{l.title}</p>
                        <p className="text-[10px] text-slate-400">Category: {l.category?.name ?? 'General'} · Status: <span className="font-bold text-[10px]">{l.status}</span></p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs py-1 px-2.5 h-7" onClick={() => onEdit(l)}>Edit</Button>
                        <Button size="sm" variant="outline" className="text-xs py-1 px-2.5 h-7 text-red-600 border-red-100 hover:bg-red-50" onClick={() => deleteListing(l.id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Properties Section */}
            <div>
              <h4 className="font-bold text-slate-800 text-sm mb-2 flex items-center gap-1.5"><Home className="h-4 w-4 text-amber-500" /> Real Estate Properties ({realEstates.length})</h4>
              {realEstates.length === 0 ? (
                <p className="text-xs text-slate-400 pl-5">No properties found.</p>
              ) : (
                <div className="space-y-2">
                  {realEstates.map((p) => (
                    <div key={p.id} className="flex items-center justify-between border rounded-xl p-3 hover:bg-slate-50">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{p.title}</p>
                        <p className="text-[10px] text-slate-400">Type: {p.type} · Status: <span className="font-bold text-[10px]">{p.status}</span></p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-xs py-1 px-2.5 h-7" onClick={() => onEdit(p)}>Edit</Button>
                        <Button size="sm" variant="outline" className="text-xs py-1 px-2.5 h-7 text-red-600 border-red-100 hover:bg-red-50" onClick={() => deleteRealEstate(p.id)}>Delete</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function UsersTab() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [listingsUser, setListingsUser] = useState<AdminUser | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [resetId, setResetId] = useState<string | null>(null)
  const [newPw, setNewPw] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  const [categories, setCategories] = useState<Array<{ id: string; name: string; slug: string }>>([])
  const [villages, setVillages] = useState<Array<{ id: string; name: string; slug: string }>>([])

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase()
    return (
      (u.name?.toLowerCase().includes(q) ?? false) ||
      (u.username?.toLowerCase().includes(q) ?? false) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone?.includes(q) ?? false)
    )
  })

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/users')
      .then((r) => r.json())
      .then((j) => j.ok && setUsers(j.users))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()

    // Fetch categories and villages for listings modal
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setCategories(j.categories || [])
          setVillages(j.villages || [])
        }
      })
      .catch(() => {})
  }, [load])

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

  function handleCsvUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const Papa = require('papaparse')
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results: any) => {
        const rows = results.data
        if (rows.length === 0) {
          toast.error('No data found in CSV')
          return
        }

        const loader = toast.loading('Importing users...')
        try {
          const res = await fetch('/api/admin/users/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users: rows }),
          })
          const j = await res.json()
          if (res.ok && j.ok) {
            toast.success(`Imported: ${j.createdCount} created, ${j.skippedCount} skipped`, { id: loader })
            load()
          } else {
            toast.error(j.error || 'Failed to import', { id: loader })
          }
        } catch {
          toast.error('Failed to upload', { id: loader })
        }
      },
    })
  }

  if (loading) return <CenteredLoader />

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users by name, email, phone..."
            className="pl-8 text-xs"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* CSV File Input */}
          <input
            type="file"
            accept=".csv"
            onChange={handleCsvUpload}
            id="csv-upload"
            className="hidden"
          />
          <Button asChild size="sm" variant="outline" className="gap-1.5 cursor-pointer">
            <label htmlFor="csv-upload" className="flex items-center gap-1.5 cursor-pointer">
              <Upload className="h-3.5 w-3.5 text-slate-500" />
              <span>Bulk CSV Upload</span>
            </label>
          </Button>

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
                <th className="hidden p-3 sm:table-cell">Plan Tier</th>
                <th className="hidden p-3 md:table-cell">Listings</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
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
                  <td className="hidden p-3 sm:table-cell">
                    <Select
                      value={u.planTier || 'FREE'}
                      onValueChange={(v) => {
                        act(u.id, 'update_tier', { planTier: v })
                      }}
                    >
                      <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FREE">FREE</SelectItem>
                        <SelectItem value="BASIC">BASIC</SelectItem>
                        <SelectItem value="PRO">PRO</SelectItem>
                        <SelectItem value="PREMIUM">PREMIUM</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="hidden p-3 text-slate-600 md:table-cell">
                    {u._count.listings} listings · {u._count.realEstates} RE
                  </td>
                  <td className="p-3">
                    <div className="flex justify-end gap-1">
                      <IconBtn
                        icon={Store}
                        label="View Listings"
                        tone="blue"
                        disabled={busy === u.id}
                        onClick={() => setListingsUser(u)}
                      />
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
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 animate-in fade-in duration-200" onClick={() => setResetId(null)}>
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
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

      {/* View listings modal */}
      <UserListingsDialog
        user={listingsUser}
        onClose={() => setListingsUser(null)}
        categories={categories}
        villages={villages}
        onEdit={(item) => {
          setEditingItem(item)
          setEditModalOpen(true)
        }}
      />

      {/* Add listing modal in edit mode */}
      <AddListingModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        categories={categories}
        villages={villages}
        editingItem={editingItem}
        onSuccess={() => {
          if (listingsUser) {
            const old = listingsUser
            setListingsUser(null)
            setTimeout(() => setListingsUser(old), 50)
          }
          load()
        }}
      />
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
            checked={settings.banner_free === 'true' && settings.ads_paid !== 'true'}
            onCheckedChange={(v) => {
              update('banner_free', v ? 'true' : 'false')
              update('ads_paid', v ? 'false' : 'true')
            }}
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

      {/* Social Media Links */}
      <div className="rounded-3xl glass p-5">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
          <Megaphone className="h-4 w-4 text-blue-500" /> Social Media Links
        </h3>
        <div className="space-y-3">
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-600">Facebook Page URL</Label>
            <Input
              value={settings.social_facebook ?? ''}
              onChange={(e) => update('social_facebook', e.target.value)}
              placeholder="https://facebook.com/..."
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-600">Instagram Handle URL</Label>
            <Input
              value={settings.social_instagram ?? ''}
              onChange={(e) => update('social_instagram', e.target.value)}
              placeholder="https://instagram.com/..."
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-600">YouTube Channel URL</Label>
            <Input
              value={settings.social_youtube ?? ''}
              onChange={(e) => update('social_youtube', e.target.value)}
              placeholder="https://youtube.com/..."
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-600">WhatsApp Community Invite URL</Label>
            <Input
              value={settings.social_whatsapp_community ?? ''}
              onChange={(e) => update('social_whatsapp_community', e.target.value)}
              placeholder="https://chat.whatsapp.com/..."
            />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-600">WhatsApp Channel URL</Label>
            <Input
              value={settings.social_whatsapp_channel ?? ''}
              onChange={(e) => update('social_whatsapp_channel', e.target.value)}
              placeholder="https://whatsapp.com/channel/..."
            />
          </div>
        </div>
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
  _count: { storyViews: number; storyReplies: number; storyLikes?: number }
}

function parseStoriesCsv(text: string) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)
  const items: Array<{ mediaUrl: string; caption?: string; link?: string }> = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (i === 0 && (line.toLowerCase().includes('media') || line.toLowerCase().includes('url'))) continue
    const parts = line.split(',').map((p) => p.trim().replace(/^["']|["']$/g, ''))
    if (parts.length >= 1) {
      const mediaUrl = parts[0]
      const caption = parts[1] || undefined
      const link = parts[2] || undefined
      if (mediaUrl && mediaUrl.startsWith('http')) {
        items.push({ mediaUrl, caption, link })
      }
    }
  }
  return items
}

function StoriesTab() {
  const [stories, setStories] = useState<AdminStory[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  // Add Story Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkSaving, setBulkSaving] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [creating, setCreating] = useState(false)
  const [mediaUrl, setMediaUrl] = useState('')
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE')
  const [caption, setCaption] = useState('')
  const [link, setLink] = useState('')
  const [hours, setHours] = useState('24')

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

  async function handleCreateStory() {
    if (!mediaUrl.trim()) {
      toast.error('Please upload an image or enter a media URL')
      return
    }

    setCreating(true)
    try {
      const res = await fetch('/api/admin/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaUrl,
          mediaType,
          caption,
          link,
          hours,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to create story')

      toast.success('Story published successfully!')
      setModalOpen(false)
      setMediaUrl('')
      setCaption('')
      setLink('')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to publish story')
    } finally {
      setCreating(false)
    }
  }

  async function handleBulkStoriesSubmit(e: React.FormEvent) {
    e.preventDefault()
    const items = parseStoriesCsv(bulkText)
    if (items.length === 0) {
      toast.error('No valid story rows found. Format: Media URL, Caption, Link')
      return
    }

    setBulkSaving(true)
    try {
      const res = await fetch('/api/admin/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed bulk upload')

      toast.success(`Successfully uploaded ${j.count ?? items.length} stories!`)
      setBulkOpen(false)
      setBulkText('')
      load()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed bulk upload')
    } finally {
      setBulkSaving(false)
    }
  }

  function handleBulkFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      const text = evt.target?.result as string
      if (text) setBulkText(text)
    }
    reader.readAsText(file)
  }

  async function del(id: string) {
    if (!confirm('Delete this story? This action cannot be undone.')) return
    setBusy(id)
    try {
      const res = await fetch(`/api/admin/stories?id=${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to delete story')
      setStories((p) => p.filter((s) => s.id !== id))
      toast.success('Story deleted')
    } catch {
      toast.error('Failed to delete story')
    } finally {
      setBusy(null)
    }
  }

  if (loading) return <CenteredLoader />

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Active Stories</h2>
          <p className="text-sm text-slate-500">{stories.length} stories currently live (auto-expire in 24h)</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setBulkOpen(true)} variant="outline" size="sm" className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50">
            <FileSpreadsheet className="h-4 w-4" /> Bulk CSV Upload
          </Button>
          <Button onClick={() => setModalOpen(true)} size="sm" className="gap-1.5 gradient-brand text-white shadow-sm">
            <Plus className="h-4 w-4" /> Add Story
          </Button>
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {stories.length === 0 ? (
        <div className="rounded-3xl glass p-10 text-center">
          <ImageIcon className="mx-auto h-10 w-10 text-slate-300" />
          <h3 className="mt-2 font-bold text-slate-900">No active stories</h3>
          <p className="text-sm text-slate-500">All clear — click "Add Story" to publish a new story.</p>
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
                    <img loading="lazy" decoding="async" src={s.mediaUrl} alt={s.caption ?? 'story'} className="h-full w-full object-cover" />
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
                  <span>{s._count.storyLikes} likes</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => del(s.id)}
                  disabled={busy === s.id}
                  className="mt-2 w-full gap-1.5 border-red-200 text-red-600 hover:bg-red-50 text-xs"
                >
                  {busy === s.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                  Delete Story
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Story Modal */}
      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-amber-500" /> Publish Admin Story
              </h3>
              <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <Label className="mb-1 block font-semibold text-slate-700">Media URL *</Label>
                <Input
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://images.choutuppal.in/..."
                />
              </div>

              <div>
                <Label className="mb-1 block font-semibold text-slate-700">Media Type</Label>
                <Select value={mediaType} onValueChange={(v) => setMediaType(v as 'IMAGE' | 'VIDEO')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMAGE">Image</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-1 block font-semibold text-slate-700">Caption / Title (Optional)</Label>
                <Input
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. Special offer at Choutuppal Main Market"
                />
              </div>

              <div>
                <Label className="mb-1 block font-semibold text-slate-700">Action Link URL (Optional)</Label>
                <Input
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder="https://choutuppal.in/business/..."
                />
              </div>

              <div>
                <Label className="mb-1 block font-semibold text-slate-700">Duration (Hours)</Label>
                <Select value={hours} onValueChange={setHours}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 Hours (Default)</SelectItem>
                    <SelectItem value="48">48 Hours</SelectItem>
                    <SelectItem value="72">72 Hours</SelectItem>
                    <SelectItem value="168">7 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={creating}>
                Cancel
              </Button>
              <Button onClick={handleCreateStory} disabled={creating} className="gap-1.5 gradient-brand text-white">
                {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Publish Story
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Bulk CSV Stories Modal */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" /> Bulk CSV Upload Stories
            </DialogTitle>
            <DialogDescription>
              Upload a .csv file or paste raw CSV text with columns: <strong>Media URL, Caption, Link</strong>
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleBulkStoriesSubmit} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Select CSV File</Label>
              <Input type="file" accept=".csv,text/csv" onChange={handleBulkFileUpload} className="cursor-pointer" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-700">Or Paste CSV Data</Label>
              <Textarea
                rows={6}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder={`Media URL, Caption, Link\nhttps://example.com/story1.jpg, Main Market Offer, https://choutuppal.in\nhttps://example.com/story2.mp4, New Arrival Reel, https://choutuppal.in/explore`}
                className="font-mono text-xs"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setBulkOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={bulkSaving || !bulkText.trim()} className="gradient-brand text-white font-bold">
                {bulkSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Import Stories (24h)'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Push Notifications                                                          */
/* -------------------------------------------------------------------------- */

function PushTab() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [link, setLink] = useState('')
  const [busy, setBusy] = useState(false)

  async function send() {
    if (!title.trim() || !message.trim()) {
      toast.error('Title and message are required')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/admin/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), message: message.trim(), link: link.trim() || undefined }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed')
      toast.success(`Notification sent to ${j.sent} users`)
      setTitle(''); setMessage(''); setLink('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to send')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Push Notifications</h2>
        <p className="text-sm text-slate-500">Broadcast a notification to all users. They'll see it in the bell icon + dashboard.</p>
      </div>
      <div className="max-w-lg space-y-4 rounded-3xl glass p-5">
        <div>
          <Label className="mb-1 block text-xs font-semibold text-slate-600">Title *</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. New Feature Live!" maxLength={120} />
        </div>
        <div>
          <Label className="mb-1 block text-xs font-semibold text-slate-600">Message *</Label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Notification message…" rows={3} maxLength={500} />
          <p className="mt-1 text-right text-[10px] text-slate-400">{message.length}/500</p>
        </div>
        <div>
          <Label className="mb-1 block text-xs font-semibold text-slate-600">Link (optional)</Label>
          <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="/dashboard or https://…" />
        </div>
        <Button onClick={send} disabled={busy} className="w-full gap-2 gradient-brand text-white">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Send to All Users
        </Button>
        <p className="text-center text-[11px] text-slate-400">
          Creates an in-app Notification for every non-banned user. Web Push (VAPID) requires PushSubscription setup.
        </p>
      </div>
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
