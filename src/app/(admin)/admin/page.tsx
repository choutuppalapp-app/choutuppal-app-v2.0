'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Store,
  Users,
  Image as ImageIcon,
  Newspaper,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Phone,
  Eye,
  Megaphone,
  Video,
  ArrowUpRight,
  RefreshCw,
  Building2,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { toast } from '@/hooks/use-toast'

interface AdminStats {
  totalUsers: number
  totalListings: number
  pendingListings: number
  approvedListings: number
  premiumListings: number
  featuredListings: number
  totalRealEstates: number
  activeBanners: number
  totalStories: number
  totalNews: number
  totalBlogs: number
  totalShorts: number
  totalViews: number
  totalClicks: number
  totalWhatsappClicks: number
  estimatedRevenue: number
}

interface RecentListing {
  id: string
  title: string
  slug: string
  category: string
  village: string
  phone: string
  status: string
  isPremium: boolean
  isFeatured: boolean
  views: number
  createdAt?: string
  owner?: { name?: string | null; phone?: string | null } | null
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [recentListings, setRecentListings] = useState<RecentListing[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const fetchDashboardData = async (isManual = false) => {
    if (isManual) setRefreshing(true)
    try {
      const res = await fetch('/api/admin/dashboard')
      const data = await res.json()
      if (data.ok) {
        setStats(data.stats)
        setRecentListings(data.recentListings || [])
        if (isManual) {
          toast({ title: 'Success', description: 'Dashboard stats updated successfully' })
        }
      }
    } catch (err) {
      console.error('Failed to load admin stats:', err)
      toast({ title: 'Notice', description: 'Could not sync latest stats', variant: 'destructive' })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const handleQuickStatus = async (id: string, newStatus: 'APPROVED' | 'REJECTED') => {
    try {
      const res = await fetch('/api/admin/listings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      })
      const data = await res.json()
      if (data.ok) {
        setRecentListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
        )
        toast({
          title: newStatus === 'APPROVED' ? 'Shop Approved' : 'Shop Rejected',
          description: `Listing status updated to ${newStatus}`,
        })
        fetchDashboardData()
      } else {
        toast({ title: 'Error', description: data.error || 'Failed to update', variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Network error', variant: 'destructive' })
    }
  }

  return (
    <div>
      <AdminHeader
        title="Admin Control Center"
        teluguTitle="అడ్మిన్ డాష్‌బోర్డ్"
        description="Overview of businesses, user registrations, pending approvals, and active campaigns in Choutuppal."
        actionButton={{
          label: refreshing ? 'Syncing...' : 'Refresh Stats',
          onClick: () => fetchDashboardData(true),
          icon: RefreshCw,
        }}
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
        {/* Top Metric Cards - Light Theme */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Users */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Users
              </span>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-blue-50 text-blue-700">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                {loading ? '...' : stats?.totalUsers || 0}
              </span>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                Verified
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
              <span>Citizens & Owners</span>
              <Link href="/admin/users" className="font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-0.5">
                Manage <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 2: Pending Listings (Priority Action) */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
                Pending Listings
              </span>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-amber-100 text-amber-800">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-amber-900">
                {loading ? '...' : stats?.pendingListings || 0}
              </span>
              <span className="text-xs font-bold text-amber-800 bg-amber-200/70 px-2 py-0.5 rounded-full">
                Needs Review
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-amber-800 border-t border-amber-200/60 pt-2.5">
              <span>{stats?.approvedListings || 0} Live Approved</span>
              <Link href="/admin/listings?status=PENDING" className="font-bold text-amber-900 hover:underline flex items-center gap-0.5">
                Review Now <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 3: Active Banner Ads & Revenue */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Banners
              </span>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <ImageIcon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                {loading ? '...' : stats?.activeBanners || 0}
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                ₹99 / Day Ads
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
              <span>{stats?.premiumListings || 0} Premium Listings</span>
              <Link href="/admin/stories-banners" className="font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-0.5">
                Banners <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Card 4: Platform Traffic & Engagement */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Impressions
              </span>
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold text-slate-900">
                {loading ? '...' : (stats?.totalViews || 0).toLocaleString()}
              </span>
              <span className="text-xs font-medium text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                Page Views
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-2.5">
              <span>{stats?.totalWhatsappClicks || 0} WhatsApp Inquiries</span>
              <span className="font-semibold text-emerald-600">High Conversion</span>
            </div>
          </div>
        </div>

        {/* Quick Module Navigation Tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/listings"
            className="group flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700 group-hover:scale-105 transition">
              <Store className="h-5 w-5" />
            </div>
            <span className="mt-2.5 text-xs font-bold text-slate-900">Listings</span>
            <span className="text-[11px] text-slate-500">{stats?.totalListings || 0} Shops</span>
          </Link>

          <Link
            href="/admin/users"
            className="group flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-700 group-hover:scale-105 transition">
              <Users className="h-5 w-5" />
            </div>
            <span className="mt-2.5 text-xs font-bold text-slate-900">Users</span>
            <span className="text-[11px] text-slate-500">{stats?.totalUsers || 0} Registered</span>
          </Link>

          <Link
            href="/admin/news"
            className="group flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-700 group-hover:scale-105 transition">
              <Newspaper className="h-5 w-5" />
            </div>
            <span className="mt-2.5 text-xs font-bold text-slate-900">News & Blogs</span>
            <span className="text-[11px] text-slate-500">AI Enabled</span>
          </Link>

          <Link
            href="/admin/stories-banners"
            className="group flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition">
              <ImageIcon className="h-5 w-5" />
            </div>
            <span className="mt-2.5 text-xs font-bold text-slate-900">Stories & Ads</span>
            <span className="text-[11px] text-slate-500">Banners</span>
          </Link>

          <Link
            href="/admin/shorts"
            className="group flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-700 group-hover:scale-105 transition">
              <Video className="h-5 w-5" />
            </div>
            <span className="mt-2.5 text-xs font-bold text-slate-900">Shorts</span>
            <span className="text-[11px] text-slate-500">YouTube Reels</span>
          </Link>

          <Link
            href="/admin/ticker"
            className="group flex flex-col items-center justify-center p-4 rounded-xl bg-white border border-slate-200 shadow-2xs hover:border-blue-300 hover:shadow-xs transition"
          >
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-50 text-purple-700 group-hover:scale-105 transition">
              <Megaphone className="h-5 w-5" />
            </div>
            <span className="mt-2.5 text-xs font-bold text-slate-900">Live Ticker</span>
            <span className="text-[11px] text-slate-500">Announcements</span>
          </Link>
        </div>

        {/* Recent Shop Requests Table (Module 1 Spec) */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 border-b border-slate-200 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">Recent Shop Requests</h2>
                <span className="rounded bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                  తాజా షాప్ రిక్వెస్ట్లు
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify and approve newly submitted merchant listings for Choutuppal and nearby wards.
              </p>
            </div>
            <Link
              href="/admin/listings"
              className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 self-start sm:self-auto"
            >
              <span>View All Listings</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Shop / Business Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Village / Ward</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentListings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-slate-500 text-sm">
                      {loading ? 'Loading requests...' : 'No listings registered yet.'}
                    </td>
                  </tr>
                ) : (
                  recentListings.map((shop, idx) => (
                    <tr
                      key={shop.id}
                      className={idx % 2 === 1 ? 'bg-slate-50/50 hover:bg-slate-50' : 'bg-white hover:bg-slate-50'}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{shop.title}</p>
                            <p className="text-[11px] text-slate-400">ID: {shop.slug}</p>
                          </div>
                          {shop.isPremium && (
                            <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                              Premium
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                          {shop.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-600 font-medium">
                        {shop.village}
                      </td>
                      <td className="px-4 py-3.5 text-xs">
                        <a
                          href={`tel:${shop.phone}`}
                          className="flex items-center gap-1 font-medium text-slate-700 hover:text-blue-700"
                        >
                          <Phone className="h-3 w-3 text-slate-400" />
                          <span>{shop.phone}</span>
                        </a>
                      </td>
                      <td className="px-4 py-3.5">
                        {shop.status === 'APPROVED' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                            <CheckCircle className="h-3 w-3" /> Approved
                          </span>
                        ) : shop.status === 'PENDING' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                            <Clock className="h-3 w-3" /> Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-200">
                            <XCircle className="h-3 w-3" /> Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {shop.status !== 'APPROVED' && (
                            <button
                              onClick={() => handleQuickStatus(shop.id, 'APPROVED')}
                              className="rounded-md bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700 transition"
                            >
                              Approve
                            </button>
                          )}
                          {shop.status !== 'REJECTED' && (
                            <button
                              onClick={() => handleQuickStatus(shop.id, 'REJECTED')}
                              className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50 hover:border-rose-200 border border-slate-200 transition"
                            >
                              Reject
                            </button>
                          )}
                          <Link
                            href={`/business/${shop.slug}`}
                            target="_blank"
                            title="Preview Public Page"
                            className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>
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
    </div>
  )
}
