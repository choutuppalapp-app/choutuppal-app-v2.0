import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { getDashboardData } from '@/lib/dashboard-data'
import {
  Store,
  Plus,
  Eye,
  TrendingUp,
  Bookmark,
  Building2,
  Wrench,
  Home,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export default async function ProfileOverviewPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=/profile')

  const data = await getDashboardData(user).catch(() => null)
  const listingsCount = data?.stats?.myListings ?? 0
  const realEstateCount = data?.stats?.myRealEstate ?? 0
  const totalViews = data?.stats?.totalViews ?? 0

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Badge className="bg-blue-500/20 text-blue-200 border-blue-400/30 mb-2">
                User Dashboard Overview
              </Badge>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Namaste, {user.name || 'Member'}! 👋
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
                Welcome to your Choutuppal Command Center. Manage your local business listings, real estate, bookings, and track customer engagement.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/profile/listings/new"
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" />
                Add New Listing
              </Link>
              <a
                href="https://wa.me/919494348175?text=Hi%20Choutuppal%2C%20I%20want%20to%20boost%20my%20listing"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-emerald-700 transition"
              >
                <MessageSquare className="h-4 w-4" />
                WhatsApp Help Desk
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Business Listings</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">{listingsCount}</p>
          <p className="mt-1 text-[11px] text-slate-400">Active shops &amp; services</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Properties</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Home className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">{realEstateCount}</p>
          <p className="mt-1 text-[11px] text-slate-400">Plots &amp; houses</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Views</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-2xl sm:text-3xl font-black text-slate-900">{totalViews}</p>
          <p className="mt-1 text-[11px] text-slate-400">Customer impressions</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Account Role</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-lg font-black text-slate-900 uppercase truncate">
            {user.role || 'Member'}
          </p>
          <p className="mt-1 text-[11px] text-emerald-600 font-semibold">Active &amp; Verified</p>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          Quick Actions &amp; Navigation
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/profile/listings/new"
            className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold">
                <Plus className="h-5 w-5" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition" />
            </div>
            <h3 className="mt-3 text-sm font-black text-slate-900 group-hover:text-blue-600">
              Post New Listing
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Add your shop, business, service or real estate property using direct image links.
            </p>
          </Link>

          <Link
            href="/profile/listings"
            className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white font-bold">
                <Store className="h-5 w-5" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-600 transition" />
            </div>
            <h3 className="mt-3 text-sm font-black text-slate-900 group-hover:text-emerald-600">
              Manage My Listings
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              View your published listings, customer reviews, and test WhatsApp booking deep links.
            </p>
          </Link>

          <Link
            href="/profile/saved"
            className="group rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-blue-50/50"
          >
            <div className="flex items-center justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white font-bold">
                <Bookmark className="h-5 w-5" />
              </span>
              <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 transition" />
            </div>
            <h3 className="mt-3 text-sm font-black text-slate-900 group-hover:text-amber-600">
              Saved &amp; Bookmarks
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Access your saved properties, emergency phone numbers, and favorite services.
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}
