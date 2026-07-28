'use client'

import { Eye, MessageCircle, Store, Home, Megaphone, ImageIcon, TrendingUp, MousePointerClick, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'

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
}

export function Analytics({ analytics }: AnalyticsProps) {
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
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Analytics</h2>
        <p className="text-sm text-slate-500">Track your reach across Choutuppal App.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="hover-glow rounded-2xl glass p-4">
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

      {/* Simple bar chart (views trend) */}
      <div className="rounded-3xl glass p-5">
        <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-700">
          Views — Last 7 Days
        </h3>
        <div className="flex h-40 items-end gap-2">
          {[40, 65, 50, 80, 72, 95, 100].map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t-lg gradient-brand transition-all hover:opacity-80"
                style={{ height: `${h}%` }}
              />
              <span className="text-[10px] text-slate-400">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-[11px] text-slate-400">
          Trend data is illustrative — connects to real impression tracking in production.
        </p>
      </div>
    </div>
  )
}
