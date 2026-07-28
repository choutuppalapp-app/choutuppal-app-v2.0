'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard,
  User as UserIcon,
  Store,
  Home,
  Image as ImageIcon,
  BarChart3,
  Plus,
  LogOut,
  Menu,
  X,
  Crown,
  ShieldCheck,
  Briefcase,
  MessageCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { DashboardData } from '@/lib/dashboard-data'
import { ProfileSection } from './profile-section'
import { MyListings } from './my-listings'
import { MyRealEstate } from './my-real-estate'
import { MyBannersStories } from './my-banners-stories'
import { Analytics } from './analytics'
import { AddListingModal } from './add-listing-modal'
import { MyCommunityPosts } from './my-community-posts'
import { MyNotifications } from './my-notifications'
import { Bell } from 'lucide-react'

type TabId = 'overview' | 'profile' | 'listings' | 'realestate' | 'media' | 'analytics' | 'community' | 'notifications'

const NAV: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: UserIcon },
  { id: 'listings', label: 'My Listings', icon: Store },
  { id: 'realestate', label: 'Real Estate', icon: Home },
  { id: 'media', label: 'Banners & Stories', icon: ImageIcon },
  { id: 'community', label: 'My Posts', icon: MessageCircle },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
]

interface DashboardShellProps {
  data: DashboardData
}

export function DashboardShell({ data }: DashboardShellProps) {
  const [tab, setTab] = useState<TabId>('overview')
  const [addOpen, setAddOpen] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const openAdd = () => {
    setEditingItem(null)
    setAddOpen(true)
  }

  const openEdit = (item: any) => {
    setEditingItem(item)
    setAddOpen(true)
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-4 lg:px-6">
          <button
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 lg:hidden"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
          <Link href="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Choutuppal App" className="h-8 w-auto" />
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={openAdd}
              size="sm"
              className="gap-1.5 gradient-brand text-white shadow-md shadow-blue-500/30"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Listing</span>
              <span className="sm:hidden">Add</span>
            </Button>
            <Button
              onClick={() => signOut({ callbackUrl: '/' })}
              variant="outline"
              size="sm"
              className="gap-1.5 border-slate-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl flex-1 gap-6 px-3 py-6 sm:px-4 lg:px-6">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <nav className="sticky top-24 space-y-1">
            <UserCard data={data} />
            {NAV.map((n) => {
              const Icon = n.icon
              return (
                <button
                  key={n.id}
                  onClick={() => setTab(n.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                    tab === n.id
                      ? 'gradient-brand-soft text-blue-700 ring-1 ring-blue-200'
                      : 'text-slate-600 hover:bg-white/70 hover:text-blue-700',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {n.label}
                </button>
              )
            })}
            <RoleLinks role={data.user.role} />
          </nav>
        </aside>

        {/* Mobile sidebar drawer */}
        {sidebarOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 h-full w-72 max-w-[80%] bg-white p-4 shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <span className="font-bold text-slate-900">Menu</span>
                <button onClick={() => setSidebarOpen(false)} aria-label="Close">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <UserCard data={data} />
              <nav className="mt-3 space-y-1">
                {NAV.map((n) => {
                  const Icon = n.icon
                  return (
                    <button
                      key={n.id}
                      onClick={() => {
                        setTab(n.id)
                        setSidebarOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                        tab === n.id
                          ? 'gradient-brand-soft text-blue-700'
                          : 'text-slate-600 hover:bg-slate-50',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {n.label}
                    </button>
                  )
                })}
              </nav>
              <RoleLinks role={data.user.role} onNavigate={() => setSidebarOpen(false)} />
            </aside>
          </div>
        ) : null}

        {/* Main content */}
        <main className="min-w-0 flex-1 pb-24 lg:pb-6">
          {tab === 'overview' ? (
            <Overview data={data} onTab={setTab} onAdd={openAdd} />
          ) : null}
          {tab === 'profile' ? <ProfileSection user={data.user} villages={data.villages} /> : null}
          {tab === 'listings' ? (
            <MyListings listings={data.listings} onAdd={openAdd} onEdit={openEdit} />
          ) : null}
          {tab === 'realestate' ? (
            <MyRealEstate realEstates={data.realEstates} onAdd={openAdd} onEdit={openEdit} />
          ) : null}
          {tab === 'media' ? <MyBannersStories banners={data.banners} stories={data.stories} /> : null}
          {tab === 'community' ? <MyCommunityPosts posts={data.communityPosts} /> : null}
          {tab === 'notifications' ? <MyNotifications /> : null}
          {tab === 'analytics' ? <Analytics analytics={data.analytics} /> : null}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav tab={tab} onTab={setTab} onAdd={openAdd} />

      <AddListingModal
        open={addOpen}
        onOpenChange={setAddOpen}
        villages={data.villages}
        categories={data.categories}
        editingItem={editingItem}
        onSuccess={() => window.location.reload()}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

/**
 * Role-based navigation links to the Admin and Agent panels.
 * - Admin Panel (/admin): visible to ADMIN + SUPER_ADMIN
 * - Agent Panel (/agent): visible to AGENT + ADMIN (SUPER_ADMIN)
 *
 * `onNavigate` is called after a click (used by the mobile drawer to close).
 */
function RoleLinks({
  role,
  onNavigate,
}: {
  role: string
  onNavigate?: () => void
}) {
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'
  const isAgent = role === 'AGENT' || isAdmin
  const links: { href: string; label: string; icon: typeof ShieldCheck; accent: string }[] = []

  if (isAdmin) {
    links.push({
      href: '/admin',
      label: 'Admin Panel',
      icon: ShieldCheck,
      accent: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
    })
  }
  if (isAgent) {
    links.push({
      href: '/agent',
      label: 'Agent Panel',
      icon: Briefcase,
      accent: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
    })
  }

  if (links.length === 0) return null

  return (
    <div className="mt-3 space-y-1.5 border-t border-slate-100 pt-3">
      <p className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
        Management
      </p>
      {links.map((l) => {
        const Icon = l.icon
        return (
          <Link
            key={l.href}
            href={l.href}
            onClick={onNavigate}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-sm font-semibold transition',
              l.accent,
            )}
          >
            <Icon className="h-4 w-4" />
            {l.label}
          </Link>
        )
      })}
    </div>
  )
}

function UserCard({ data }: { data: DashboardData }) {
  const { user, analytics } = data
  const initial = (user.name ?? user.username ?? user.email).charAt(0).toUpperCase()
  return (
    <div className="rounded-2xl glass p-3">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full gradient-brand text-lg font-bold text-white">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-900">
            {user.name ?? user.username}
          </p>
          <p className="truncate text-xs text-slate-500">{user.email}</p>
        </div>
      </div>
      <div className="mt-2 flex items-center gap-1.5">
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          {user.role}
        </Badge>
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
          {user.planTier}
        </Badge>
        {user.planTier !== 'PREMIUM' ? (
          <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-amber-600">
            <Crown className="h-3 w-3" /> Upgrade
          </span>
        ) : null}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[10px] text-slate-500">
        <div>
          <div className="font-bold text-slate-900">{analytics.totalListings}</div>
          Listings
        </div>
        <div>
          <div className="font-bold text-slate-900">{analytics.totalProperties}</div>
          Properties
        </div>
        <div>
          <div className="font-bold text-slate-900">{analytics.totalViews}</div>
          Views
        </div>
      </div>
    </div>
  )
}

function Overview({
  data,
  onTab,
  onAdd,
}: {
  data: DashboardData
  onTab: (t: TabId) => void
  onAdd: () => void
}) {
  const { analytics } = data
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl glass-strong p-6">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Welcome back, <span className="gradient-text">{data.user.name ?? 'User'}</span> 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your listings, properties, banners and stories — all in one place.
        </p>
        <Button onClick={onAdd} className="mt-4 gap-2 gradient-brand text-white">
          <Plus className="h-4 w-4" /> Add New Listing
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total Views" value={analytics.totalViews} icon="eye" accent="blue" />
        <StatCard label="WhatsApp Clicks" value={analytics.totalWhatsappClicks} icon="chat" accent="green" />
        <StatCard label="Listings" value={analytics.totalListings} icon="store" accent="amber" />
        <StatCard label="Properties" value={analytics.totalProperties} icon="home" accent="blue" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <QuickAction
          title="My Listings"
          desc={`${analytics.approvedListings} approved · ${analytics.pendingListings} pending`}
          icon={Store}
          onClick={() => onTab('listings')}
        />
        <QuickAction
          title="Real Estate"
          desc={`${analytics.totalProperties} properties listed`}
          icon={Home}
          onClick={() => onTab('realestate')}
        />
        <QuickAction
          title="Banners & Stories"
          desc={`${analytics.activeBanners} banners · ${analytics.activeStories} stories active`}
          icon={ImageIcon}
          onClick={() => onTab('media')}
        />
        <QuickAction
          title="Analytics"
          desc="Profile views, clicks & engagement"
          icon={BarChart3}
          onClick={() => onTab('analytics')}
        />
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string
  value: number
  icon: 'eye' | 'chat' | 'store' | 'home'
  accent: 'blue' | 'green' | 'amber'
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-400',
    green: 'from-emerald-500 to-emerald-400',
    amber: 'from-amber-500 to-amber-400',
  }[accent]
  return (
    <div className="rounded-2xl glass p-4">
      <div className={cn('mb-2 grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br text-white', colors)}>
        {icon === 'eye' ? '👁' : icon === 'chat' ? '💬' : icon === 'store' ? '🏪' : '🏠'}
      </div>
      <div className="text-2xl font-black text-slate-900">{value.toLocaleString('en-IN')}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
}

function QuickAction({
  title,
  desc,
  icon: Icon,
  onClick,
}: {
  title: string
  desc: string
  icon: typeof Store
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="hover-glow flex items-center gap-4 rounded-2xl glass p-4 text-left"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl gradient-brand text-white">
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="truncate text-xs text-slate-500">{desc}</p>
      </div>
    </button>
  )
}

function MobileBottomNav({
  tab,
  onTab,
  onAdd,
}: {
  tab: TabId
  onTab: (t: TabId) => void
  onAdd: () => void
}) {
  const items: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'listings', label: 'Listings', icon: Store },
    { id: 'analytics', label: 'Stats', icon: BarChart3 },
    { id: 'profile', label: 'You', icon: UserIcon },
  ]
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/50 bg-white/90 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Dashboard mobile navigation"
    >
      <div className="relative mx-auto grid max-w-md grid-cols-5 items-center px-2 py-1.5">
        {items.slice(0, 2).map((i) => (
          <MobileTab key={i.id} {...i} active={tab === i.id} onClick={() => onTab(i.id)} />
        ))}
        <button onClick={onAdd} aria-label="Add listing" className="relative flex justify-center">
          <span className="-mt-6 grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-white shadow-lg shadow-blue-500/40">
            <Plus className="h-7 w-7" />
          </span>
        </button>
        {items.slice(2).map((i) => (
          <MobileTab key={i.id} {...i} active={tab === i.id} onClick={() => onTab(i.id)} />
        ))}
      </div>
    </nav>
  )
}

function MobileTab({
  label,
  icon: Icon,
  active,
  onClick,
}: {
  label: string
  icon: typeof LayoutDashboard
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition',
        active ? 'text-blue-600' : 'text-slate-500',
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  )
}
