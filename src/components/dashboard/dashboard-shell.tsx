'use client'

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  createContext,
  useContext,
} from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
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
  MessageCircle,
  Bell,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { DashboardData } from '@/lib/dashboard-data'
import nextDynamic from 'next/dynamic'
import { ProfileSection } from './profile-section'
import { MyListings } from './my-listings'
import { MyCommunityPosts } from './my-community-posts'
import { MyNotifications } from './my-notifications'

const Analytics = nextDynamic(
  () => import('./analytics').then((m) => ({ default: m.Analytics })),
  { ssr: false }
)
const AddListingModal = nextDynamic(
  () => import('./add-listing-modal').then((m) => ({ default: m.AddListingModal })),
  { ssr: false }
)
const MyRealEstate = nextDynamic(
  () => import('./my-real-estate').then((m) => ({ default: m.MyRealEstate })),
  { ssr: false }
)
const MyBannersStories = nextDynamic(
  () => import('./my-banners-stories').then((m) => ({ default: m.MyBannersStories })),
  { ssr: false }
)

export type TabId =
  | 'overview'
  | 'profile'
  | 'listings'
  | 'realestate'
  | 'media'
  | 'analytics'
  | 'community'
  | 'notifications'

const VALID_TABS: TabId[] = [
  'overview',
  'profile',
  'listings',
  'realestate',
  'media',
  'analytics',
  'community',
  'notifications',
]

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

/* -------------------------------------------------------------------------- */
/* Memoized Data Fetcher & Client In-Memory Cache                             */
/* -------------------------------------------------------------------------- */

interface CacheEntry {
  data: DashboardData
  timestamp: number
}

const dashboardClientCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60_000 // 60 seconds TTL

async function fetchDashboardDataMemoized(
  userId: string,
  force = false
): Promise<DashboardData | null> {
  if (!force && dashboardClientCache.has(userId)) {
    const cached = dashboardClientCache.get(userId)!
    if (Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data
    }
  }

  try {
    const res = await fetch('/api/dashboard', {
      method: 'GET',
      headers: { 'Cache-Control': 'no-cache' },
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const freshData: DashboardData = await res.json()
    if (freshData?.user) {
      dashboardClientCache.set(userId, {
        data: freshData,
        timestamp: Date.now(),
      })
      return freshData
    }
  } catch (err) {
    console.warn('[Dashboard] Memoized data fetch error:', err)
  }
  return null
}

/* -------------------------------------------------------------------------- */
/* Lightweight Dashboard Context & State Management                           */
/* -------------------------------------------------------------------------- */

interface DashboardContextValue {
  data: DashboardData
  analytics: DashboardData['analytics']
  isRefreshing: boolean
  tab: TabId
  setTab: (tab: TabId) => void
  openAdd: (type?: 'business' | 'service' | 'realestate') => void
  openEdit: (item: any) => void
  refreshData: (force?: boolean) => Promise<void>
  mutateData: (updater: (prev: DashboardData) => DashboardData) => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext)
  if (!ctx) {
    throw new Error('useDashboard must be used within DashboardShell')
  }
  return ctx
}

/* -------------------------------------------------------------------------- */
/* Main Dashboard Shell                                                       */
/* -------------------------------------------------------------------------- */

interface DashboardShellProps {
  data: DashboardData
}

export function DashboardShell({ data: initialData }: DashboardShellProps) {
  const searchParams = useSearchParams()
  const rawTab = searchParams.get('tab')

  // Initialize active tab from search params or default to 'overview'
  const initialTab: TabId = useMemo(() => {
    return rawTab && VALID_TABS.includes(rawTab as TabId)
      ? (rawTab as TabId)
      : 'overview'
  }, [rawTab])

  // Primary reactive dashboard state
  const [data, setData] = useState<DashboardData>(initialData)
  const [tab, setTabState] = useState<TabId>(initialTab)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Keep-alive visited tabs set for lazy mounting and fast instant tab switches
  const [visitedTabs, setVisitedTabs] = useState<Set<TabId>>(() => new Set<TabId>([initialTab]))

  // Modal & Drawer states
  const [addOpen, setAddOpen] = useState(rawTab === 'add-listing')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [addDefaultType, setAddDefaultType] = useState<'business' | 'service' | 'realestate'>('business')

  // Seed cache on initial render or when initialData changes
  useEffect(() => {
    if (initialData?.user?.id) {
      dashboardClientCache.set(initialData.user.id, {
        data: initialData,
        timestamp: Date.now(),
      })
      setData(initialData)
    }
  }, [initialData])

  // Handle URL search parameter triggers
  useEffect(() => {
    const t = searchParams.get('tab')
    if (t === 'add-listing') {
      setAddDefaultType('business')
      setAddOpen(true)
    } else if (t === 'add-property') {
      setAddDefaultType('realestate')
      setAddOpen(true)
    } else if (t && VALID_TABS.includes(t as TabId)) {
      setTabState(t as TabId)
      setVisitedTabs((prev) => {
        if (prev.has(t as TabId)) return prev
        const next = new Set(prev)
        next.add(t as TabId)
        return next
      })
    }
  }, [searchParams])

  // Memoized tab change handler with shallow history URL sync
  const handleTabChange = useCallback((newTab: TabId) => {
    setTabState(newTab)
    setVisitedTabs((prev) => {
      if (prev.has(newTab)) return prev
      const next = new Set(prev)
      next.add(newTab)
      return next
    })
    setSidebarOpen(false)

    // Smooth URL update without triggering full Next.js page remount
    try {
      const url = new URL(window.location.href)
      url.searchParams.set('tab', newTab)
      window.history.replaceState({}, '', url.toString())
    } catch {
      // safe fallback if window is constrained
    }
  }, [])

  // Memoized modal actions
  const openAdd = useCallback((type?: 'business' | 'service' | 'realestate') => {
    setEditingItem(null)
    setAddDefaultType(type || 'business')
    setAddOpen(true)
  }, [])

  const openEdit = useCallback((item: any) => {
    setEditingItem(item)
    setAddOpen(true)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  // Memoized data refresh function
  const refreshData = useCallback(async (force = true) => {
    const userId = data.user.id
    if (!userId) return

    setIsRefreshing(true)
    try {
      const fresh = await fetchDashboardDataMemoized(userId, force)
      if (fresh) {
        setData(fresh)
        toast.success('Dashboard synced with latest data')
      }
    } catch {
      toast.error('Could not refresh dashboard data')
    } finally {
      setIsRefreshing(false)
    }
  }, [data.user.id])

  // Optimistic local state mutation dispatcher
  const mutateData = useCallback((updater: (prev: DashboardData) => DashboardData) => {
    setData((prev) => {
      const updated = updater(prev)
      if (updated?.user?.id) {
        dashboardClientCache.set(updated.user.id, {
          data: updated,
          timestamp: Date.now(),
        })
      }
      return updated
    })
  }, [])

  // Callback when a listing is added/edited: revalidate smoothly without reloading browser!
  const handleModalSuccess = useCallback(() => {
    setAddOpen(false)
    refreshData(true)
  }, [refreshData])

  // Memoized analytics calculation
  const computedAnalytics = useMemo(() => {
    const listings = data.listings || []
    const realEstates = data.realEstates || []
    const banners = data.banners || []
    const stories = data.stories || []

    const totalViews = listings.reduce((s, l) => s + (l.views || 0), 0)
    const totalWhatsappClicks = listings.reduce((s, l) => s + (l.whatsappClicks || 0), 0)
    const totalClicks = listings.reduce((s, l) => s + (l.clicks || 0), 0)
    const totalCallClicks = Math.max(0, totalClicks - totalWhatsappClicks)
    const totalListings = listings.length
    const approvedListings = listings.filter((l) => l.status === 'APPROVED').length
    const pendingListings = listings.filter((l) => l.status === 'PENDING').length
    const totalProperties = realEstates.length
    const now = new Date()
    const activeBanners = banners.filter((b) => !b.expiresAt || new Date(b.expiresAt) > now).length
    const activeStories = stories.filter((s) => !s.expiresAt || new Date(s.expiresAt) > now).length

    return {
      totalViews,
      totalWhatsappClicks,
      totalCallClicks,
      totalClicks,
      totalListings,
      approvedListings,
      pendingListings,
      totalProperties,
      activeBanners,
      activeStories,
    }
  }, [data.listings, data.realEstates, data.banners, data.stories])

  const contextValue = useMemo<DashboardContextValue>(
    () => ({
      data,
      analytics: computedAnalytics,
      isRefreshing,
      tab,
      setTab: handleTabChange,
      openAdd,
      openEdit,
      refreshData,
      mutateData,
    }),
    [data, computedAnalytics, isRefreshing, tab, handleTabChange, openAdd, openEdit, refreshData, mutateData]
  )

  return (
    <DashboardContext.Provider value={contextValue}>
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50">
        {/* Top header bar */}
        <header className="sticky top-0 z-40 border-b border-white/50 bg-white/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-4 lg:px-6">
            <button
              className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 transition hover:bg-slate-50 lg:hidden"
              onClick={toggleSidebar}
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
            <span className="text-sm font-extrabold text-slate-900 sm:text-base">
              Dashboard
            </span>

            <div className="ml-auto flex items-center gap-2">
              {/* Memoized background revalidation button */}
              <Button
                onClick={() => refreshData(true)}
                variant="outline"
                size="sm"
                disabled={isRefreshing}
                className="gap-1.5 border-slate-200 bg-white/80 text-slate-700 hover:bg-white"
                title="Sync latest dashboard data"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', isRefreshing && 'animate-spin text-blue-600')} />
                <span className="hidden md:inline text-xs font-medium">
                  {isRefreshing ? 'Syncing…' : 'Sync'}
                </span>
              </Button>

              <Link href="/profile/listings/new">
                <Button
                  size="sm"
                  className="gap-1.5 gradient-brand text-white shadow-md shadow-blue-500/30"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Listing</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              </Link>

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
          {/* Sidebar (Desktop) */}
          <aside className="hidden w-60 shrink-0 lg:block">
            <nav className="sticky top-24 space-y-1">
              <UserCard user={data.user} analytics={computedAnalytics} />
              {NAV.map((n) => {
                const Icon = n.icon
                const isActive = tab === n.id
                return (
                  <button
                    key={n.id}
                    onClick={() => handleTabChange(n.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                      isActive
                        ? 'gradient-brand-soft text-blue-700 ring-1 ring-blue-200 font-semibold'
                        : 'text-slate-600 hover:bg-white/70 hover:text-blue-700'
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
                className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
                onClick={closeSidebar}
              />
              <aside className="absolute left-0 top-0 h-full w-72 max-w-[80%] bg-white p-4 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-bold text-slate-900">Menu</span>
                  <button onClick={closeSidebar} aria-label="Close">
                    <X className="h-5 w-5 text-slate-600" />
                  </button>
                </div>
                <UserCard user={data.user} analytics={computedAnalytics} />
                <nav className="mt-3 space-y-1">
                  {NAV.map((n) => {
                    const Icon = n.icon
                    const isActive = tab === n.id
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleTabChange(n.id)}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                          isActive
                            ? 'gradient-brand-soft text-blue-700 font-semibold'
                            : 'text-slate-600 hover:bg-slate-50'
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {n.label}
                      </button>
                    )
                  })}
                </nav>
                <RoleLinks role={data.user.role} onNavigate={closeSidebar} />
              </aside>
            </div>
          ) : null}

          {/* Main content area with keep-alive tab preservation */}
          <main className="min-w-0 flex-1 pb-28 lg:pb-6">
            {visitedTabs.has('overview') && (
              <div className={tab === 'overview' ? 'block' : 'hidden'}>
                <Overview
                  user={data.user}
                  analytics={computedAnalytics}
                  onTab={handleTabChange}
                  onAdd={() => openAdd('business')}
                />
              </div>
            )}
            {visitedTabs.has('profile') && (
              <div className={tab === 'profile' ? 'block' : 'hidden'}>
                <ProfileSection user={data.user} villages={data.villages} />
              </div>
            )}
            {visitedTabs.has('listings') && (
              <div className={tab === 'listings' ? 'block' : 'hidden'}>
                <MyListings
                  listings={data.listings}
                  onAdd={() => openAdd('business')}
                  onEdit={openEdit}
                />
              </div>
            )}
            {visitedTabs.has('realestate') && (
              <div className={tab === 'realestate' ? 'block' : 'hidden'}>
                <MyRealEstate
                  realEstates={data.realEstates}
                  onAdd={() => openAdd('realestate')}
                  onEdit={openEdit}
                />
              </div>
            )}
            {visitedTabs.has('media') && (
              <div className={tab === 'media' ? 'block' : 'hidden'}>
                <MyBannersStories banners={data.banners} stories={data.stories} />
              </div>
            )}
            {visitedTabs.has('community') && (
              <div className={tab === 'community' ? 'block' : 'hidden'}>
                <MyCommunityPosts posts={data.communityPosts} />
              </div>
            )}
            {visitedTabs.has('notifications') && (
              <div className={tab === 'notifications' ? 'block' : 'hidden'}>
                <MyNotifications />
              </div>
            )}
            {visitedTabs.has('analytics') && (
              <div className={tab === 'analytics' ? 'block' : 'hidden'}>
                <Analytics analytics={computedAnalytics} />
              </div>
            )}
          </main>
        </div>

        {/* Mobile bottom navigation bar */}
        <MobileBottomNav tab={tab} onTab={handleTabChange} onAdd={() => openAdd('business')} />

        {/* Add/Edit Listing Modal with fast in-memory revalidation */}
        <AddListingModal
          open={addOpen}
          onOpenChange={setAddOpen}
          villages={data.villages}
          categories={data.categories}
          defaultType={addDefaultType}
          editingItem={editingItem}
          onSuccess={handleModalSuccess}
        />
      </div>
    </DashboardContext.Provider>
  )
}

/* -------------------------------------------------------------------------- */
/* Memoized Sub-components                                                    */
/* -------------------------------------------------------------------------- */

interface UserCardProps {
  user: DashboardData['user']
  analytics: DashboardData['analytics']
}

const UserCard = React.memo(function UserCard({ user, analytics }: UserCardProps) {
  const initial = (user.name ?? user.username ?? user.email ?? 'U').charAt(0).toUpperCase()
  return (
    <div className="rounded-2xl glass p-3 shadow-xs">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-full gradient-brand text-lg font-bold text-white shadow-xs">
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
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 text-[11px]">
          {user.role}
        </Badge>
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 text-[11px]">
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
})

interface RoleLinksProps {
  role: string
  onNavigate?: () => void
}

const RoleLinks = React.memo(function RoleLinks({ role, onNavigate }: RoleLinksProps) {
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN'
  const links: { href: string; label: string; icon: typeof ShieldCheck; accent: string }[] = []

  if (isAdmin) {
    links.push({
      href: '/admin',
      label: 'Admin Panel',
      icon: ShieldCheck,
      accent: 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100',
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
              l.accent
            )}
          >
            <Icon className="h-4 w-4" />
            {l.label}
          </Link>
        )
      })}
    </div>
  )
})

interface OverviewProps {
  user: DashboardData['user']
  analytics: DashboardData['analytics']
  onTab: (t: TabId) => void
  onAdd: () => void
}

const Overview = React.memo(function Overview({
  user,
  analytics,
  onTab,
  onAdd,
}: OverviewProps) {
  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-3xl glass-strong p-6 shadow-xs">
        <h1 className="text-2xl font-black tracking-tight text-slate-900">
          Welcome back, <span className="gradient-text">{user.name ?? 'User'}</span> 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your listings, properties, banners and stories — all in one place.
        </p>
        <Button onClick={onAdd} className="mt-4 gap-2 gradient-brand text-white shadow-sm">
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
})

interface StatCardProps {
  label: string
  value: number
  icon: 'eye' | 'chat' | 'store' | 'home'
  accent: 'blue' | 'green' | 'amber'
}

const StatCard = React.memo(function StatCard({
  label,
  value,
  icon,
  accent,
}: StatCardProps) {
  const colors = {
    blue: 'from-blue-500 to-blue-400',
    green: 'from-emerald-500 to-emerald-400',
    amber: 'from-amber-500 to-amber-400',
  }[accent]
  return (
    <div className="rounded-2xl glass p-4 shadow-xs">
      <div
        className={cn(
          'mb-2 grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br text-white shadow-xs',
          colors
        )}
      >
        {icon === 'eye' ? '👁' : icon === 'chat' ? '💬' : icon === 'store' ? '🏪' : '🏠'}
      </div>
      <div className="text-2xl font-black text-slate-900">{value.toLocaleString('en-IN')}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  )
})

interface QuickActionProps {
  title: string
  desc: string
  icon: typeof Store
  onClick: () => void
}

const QuickAction = React.memo(function QuickAction({
  title,
  desc,
  icon: Icon,
  onClick,
}: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="hover-glow flex items-center gap-4 rounded-2xl glass p-4 text-left shadow-xs transition hover:bg-white"
    >
      <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl gradient-brand text-white shadow-xs">
        <Icon className="h-6 w-6" />
      </span>
      <div className="min-w-0">
        <h3 className="font-bold text-slate-900">{title}</h3>
        <p className="truncate text-xs text-slate-500">{desc}</p>
      </div>
    </button>
  )
})

interface MobileBottomNavProps {
  tab: TabId
  onTab: (t: TabId) => void
  onAdd: () => void
}

const MobileBottomNav = React.memo(function MobileBottomNav({
  tab,
  onTab,
  onAdd,
}: MobileBottomNavProps) {
  const items: { id: TabId; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'listings', label: 'Listings', icon: Store },
    { id: 'analytics', label: 'Stats', icon: BarChart3 },
    { id: 'profile', label: 'You', icon: UserIcon },
  ]
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/50 bg-white/90 backdrop-blur-xl lg:hidden"
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
})

interface MobileTabProps {
  label: string
  icon: typeof LayoutDashboard
  active: boolean
  onClick: () => void
}

const MobileTab = React.memo(function MobileTab({
  label,
  icon: Icon,
  active,
  onClick,
}: MobileTabProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition',
        active ? 'text-blue-600 font-semibold' : 'text-slate-500'
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </button>
  )
})
