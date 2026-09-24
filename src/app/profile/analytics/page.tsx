import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { getDashboardData } from '@/lib/dashboard-data'
import {
  BarChart3,
  TrendingUp,
  Eye,
  PhoneCall,
  MessageCircle,
  Users,
  Store,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Analytics & Traffic Insights | Choutuppal Dashboard',
  description: 'Track views, impressions, WhatsApp click-throughs, and customer leads for your Choutuppal listings.',
}

export default async function ProfileAnalyticsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=/profile/analytics')

  const data = await getDashboardData(user).catch(() => null)
  const totalViews = data?.stats?.totalViews ?? 0
  const listingsCount = data?.stats?.myListings ?? 0

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Analytics &amp; Engagement
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Real-time insights into customer traffic, impressions, and WhatsApp inquiry clicks across your listings.
            </p>
          </div>

          <a
            href="https://wa.me/919494348175?text=Hi%20Choutuppal%20Team%2C%20I%20want%20to%20boost%20my%20listing%20views"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-emerald-700 transition"
          >
            <MessageCircle className="h-4 w-4" />
            Boost Impressions via Ads
          </a>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Impressions</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Eye className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">{totalViews}</p>
          <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600 font-semibold">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Organic Local Reach</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Listings</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Store className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">{listingsCount}</p>
          <div className="mt-2 text-xs text-slate-400">
            Across Choutuppal &amp; Surrounding Villages
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Connect Rate</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <MessageCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-4 text-3xl font-black text-slate-900">Direct</p>
          <div className="mt-2 text-xs text-purple-600 font-semibold">
            Pre-filled WhatsApp Deep Links
          </div>
        </div>
      </div>

      {/* Conversion Tips */}
      <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/40 p-6 shadow-xs">
        <h3 className="text-sm font-black text-blue-900 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-blue-600" />
          Pro-Tip to Increase Inquiries
        </h3>
        <p className="mt-1 text-xs text-blue-700 leading-relaxed max-w-2xl">
          Listings with high quality cover image URLs, clear business hours, and accurate WhatsApp phone numbers receive 4x more customer calls and WhatsApp booking requests in Choutuppal.
        </p>
      </div>
    </div>
  )
}
