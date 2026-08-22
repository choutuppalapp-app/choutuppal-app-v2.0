'use client'

import { useState, useEffect } from 'react'
import {
  Users,
  Building2,
  Send,
  Shield,
  TrendingUp,
  Loader2,
  RefreshCw,
  Sparkles,
  MessageSquare,
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
        <Loader2 className="h-6 w-6 animate-spin mr-2 text-emerald-600" /> Loading Choutuppal CRM Dashboard...
      </div>
    )
  }

  const stats = data?.stats || {
    totalContacts: 0,
    businessOwnersCount: 0,
    messagesSentCount: 0,
    emergencyGovtCount: 0,
  }

  const recentInbound = data?.recentInbound || []
  const revenueData = data?.revenueData || []

  return (
    <div className="flex h-full w-full flex-col bg-gray-50 p-4 md:p-6 space-y-6 overflow-y-auto fancy-scroll font-sans text-gray-900">
      {/* Top Welcome Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 bg-white p-4 rounded-2xl border shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
            Choutuppal CRM Overview <Sparkles className="h-4 w-4 text-emerald-600" />
          </h2>
          <p className="text-xs text-gray-500">
            Real-time business leads, active subscriptions, broadcast messages & saved Emergency / Govt.
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

      {/* 4 Clean Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Contacts */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs transition hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Total Contacts
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{stats.totalContacts}</span>
            <span className="flex items-center text-[10px] font-bold text-emerald-600">
              <TrendingUp className="h-3 w-3 mr-0.5" /> Active Leads
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Saved WhatsApp contacts in database</p>
        </div>

        {/* Card 2: Business Owners */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs transition hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Business Owners
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

        {/* Card 3: Messages Sent */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs transition hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Messages Sent
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Send className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">{stats.messagesSentCount}</span>
            <span className="text-[10px] text-gray-400 font-medium">Outbound</span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Total Meta messages sent</p>
        </div>

        {/* Card 4: Emergency / Govt */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs transition hover:shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Emergency / Govt
            </span>
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-gray-900">{stats.emergencyGovtCount}</span>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
              Priority
            </span>
          </div>
          <p className="mt-1 text-[11px] text-gray-500">Pre-built WhatsApp Emergency / Govt</p>
        </div>
      </div>

      {/* Grid Row: Revenue Chart & Recent Inbound Conversations */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Donut Chart: Revenue Breakdown */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-gray-900">Ad Revenue & Subscriptions Share</h3>
            <p className="text-xs text-gray-500">Estimated income across ad products and white-label sales.</p>
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

        {/* Recent Inbound Conversations Table */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-2xs flex flex-col justify-between">
          <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Recent Inbound Conversations</h3>
              <p className="text-xs text-gray-500">Latest messages received on WhatsApp webhook.</p>
            </div>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              Live Messages
            </span>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-gray-50 text-[10px] uppercase font-bold text-gray-400">
                <tr>
                  <th className="p-2.5 rounded-l-lg">Contact Name</th>
                  <th className="p-2.5">Phone Number</th>
                  <th className="p-2.5">Message Snippet</th>
                  <th className="p-2.5 rounded-r-lg">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentInbound.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-center text-gray-400 text-xs">
                      No inbound messages recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentInbound.map((m: any) => (
                    <tr key={m.id} className="hover:bg-gray-50 transition">
                      <td className="p-2.5 font-bold text-gray-900 truncate max-w-[110px]">
                        {m.name || 'WhatsApp Lead'}
                      </td>
                      <td className="p-2.5 font-mono text-[11px] text-gray-600">{m.phone}</td>
                      <td className="p-2.5 text-[11px] text-gray-800 truncate max-w-[180px]">
                        {m.message}
                      </td>
                      <td className="p-2.5 text-[10px] text-gray-400 shrink-0">
                        {new Date(m.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
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
