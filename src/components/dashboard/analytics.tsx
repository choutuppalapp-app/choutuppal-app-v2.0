'use client'

import { Eye, MessageCircle, Store, Home, Megaphone, ImageIcon, TrendingUp, MousePointerClick, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnalyticsLineChart } from './analytics-line-chart'

interface AnalyticsProps {
  analytics: {
    totalViews: number
    totalWhatsappClicks: number
    totalCallClicks: number
    totalClicks: number
    totalListings: number
    approvedListings: number
    pendingListings: number
    totalProperties: number
    activeBanners: number
    activeStories: number
  }
  listings?: any[]
}

export function Analytics({ analytics, listings = [] }: AnalyticsProps) {
  const cards = [
    { label: 'Profile Views', value: analytics.totalViews, icon: Eye, grad: 'from-blue-600 to-blue-400', sub: 'Across all listings' },
    { label: 'Total Listings', value: analytics.totalListings, icon: Store, grad: 'from-blue-500 to-amber-400', sub: `${analytics.approvedListings} approved · ${analytics.pendingListings} pending` },
    { label: 'WhatsApp Clicks', value: analytics.totalWhatsappClicks, icon: MessageCircle, grad: 'from-emerald-500 to-emerald-400', sub: 'Customer enquiries' },
    { label: 'Call Clicks', value: analytics.totalCallClicks, icon: Phone, grad: 'from-amber-500 to-amber-400', sub: 'Phone call taps' },
    { label: 'Total Clicks', value: analytics.totalClicks, icon: MousePointerClick, grad: 'from-blue-500 to-blue-400', sub: 'All interactions' },
    { label: 'Properties', value: analytics.totalProperties, icon: Home, grad: 'from-amber-500 to-blue-400', sub: 'Real estate listings' },
    { label: 'Active Banners', value: analytics.activeBanners, icon: Megaphone, grad: 'from-blue-600 to-amber-500', sub: 'Running campaigns' },
    { label: 'Active Stories', value: analytics.activeStories, icon: ImageIcon, grad: 'from-amber-400 to-blue-500', sub: '24hr stories live' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">Performance Analytics</h2>
          <p className="text-sm text-slate-500">Track impressions, WhatsApp leads, and customer engagement across Choutuppal.</p>
        </div>

        <div className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700">
          <TrendingUp className="h-3.5 w-3.5" />
          <span>Real-time Lead Tracker Active</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="hover-glow rounded-2xl glass p-4 transition">
              <div className={cn('mb-3 grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br text-white shadow', c.grad)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="text-2xl font-black text-slate-900">
                {c.value.toLocaleString('en-IN')}
              </div>
              <div className="text-xs font-semibold text-slate-700">{c.label}</div>
              <div className="text-[10px] text-slate-400">{c.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Interactive 30-Day Line Chart */}
      <AnalyticsLineChart
        totalViews={analytics.totalViews}
        totalWhatsappClicks={analytics.totalWhatsappClicks}
        listings={listings}
      />
    </div>
  )
}
