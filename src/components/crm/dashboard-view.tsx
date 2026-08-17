'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Building2,
  IndianRupee,
  MessageSquare,
  TrendingUp,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { toast } from 'sonner'

export function DashboardView() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  async function fetchStats() {
    setLoading(true)
    try {
      const res = await fetch('/api/crm/stats')
      const json = await res.json()
      if (res.ok) {
        setData(json)
      } else {
        toast.error(json.error || 'Failed to load stats')
      }
    } catch {
      toast.error('Network error loading dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading && !data) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8 text-xs text-gray-500 bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin mr-2 text-emerald-600" /> Loading CRM Dashboard...
      </div>
    )
  }

  const stats = data?.stats || {
    totalUsers: 208,
    businessOwnersCount: 42,
    totalRevenue: 60780,
    messagesTodayCount: 38,
  }

  const latestUsers = data?.latestUsers || []
  const revenueData = data?.revenueData || []

  return (
    <div className="flex h-full w-full flex-col bg-gray-50 p-4 md:p-6 space-y-6 overflow-y-auto fancy-scroll font-sans text-gray-900">
      {/* Top Welcome Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 bg-white p-4 rounded-2xl border shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
            Wapi Executive Overview <Sparkles className="h-4 w-4 text-emerald-600" />
          </h2>
          <p className="text-xs text-gray-500">
            Real-time analytics for WhatsApp users, business subscriptions & ad revenue.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchStats}
          disabled={loading}
          className="gap-1.5 border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 h-8"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Metrics
        </Button>
      </div>

      {/* 4 Premium Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Users */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs transition hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total WhatsApp Users
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{stats.totalUsers}</span>
            <span className="flex items-center text-[10px] font-bold text-emerald-600">
              <TrendingUp className="h-3 w-3 mr-0.5" /> +12%
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Saved leads in database</p>
        </div>

        {/* Card 2: Active Business Owners */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs transition hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Active Businesses
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{stats.businessOwnersCount}</span>
            <span className="flex items-center text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
              Verified
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Subscribed shop owners</p>
        </div>

        {/* Card 3: Monthly Revenue */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs transition hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Monthly Revenue
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <IndianRupee className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">
              ₹{stats.totalRevenue.toLocaleString()}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Ads, Bulk & Franchise income</p>
        </div>

        {/* Card 4: Messages Sent Today */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs transition hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Messages Today
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{stats.messagesTodayCount}</span>
            <span className="text-[10px] text-gray-400 font-medium">logs</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Inbound & outbound activity</p>
        </div>
      </div>

      {/* Grid Row: Revenue Chart & New Users Table */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Donut Chart: Revenue Breakdown */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900">Revenue Breakdown by Product</h3>
            <p className="text-xs text-gray-500">Ad campaigns, broadcasts, and white-label sales.</p>
          </div>

          <div className="h-64 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {revenueData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, 'Revenue']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    borderColor: '#e5e7eb',
                    fontSize: '12px',
                  }}
                />
                <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* New Users Table */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Latest WhatsApp Onboarding Leads</h3>
              <p className="text-xs text-gray-500">Recent contacts added to the CRM database.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              Live Feed
            </span>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400">
                <tr>
                  <th className="p-2.5 rounded-l-lg">Name</th>
                  <th className="p-2.5">Phone Number</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5 rounded-r-lg">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {latestUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400 text-xs">
                      No user records found.
                    </td>
                  </tr>
                ) : (
                  latestUsers.map((u: any) => (
                    <tr key={u.id || u.phone} className="hover:bg-gray-50 transition">
                      <td className="p-2.5 font-bold text-gray-900 truncate max-w-[120px]">
                        {u.name || 'WhatsApp Lead'}
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-gray-600">{u.phone}</td>
                      <td className="p-2.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[9px] font-extrabold ${
                            u.userType === 'business_owner'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {u.userType === 'business_owner' ? 'Business' : 'Customer'}
                        </span>
                      </td>
                      <td className="p-2.5 text-[10px] text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
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
