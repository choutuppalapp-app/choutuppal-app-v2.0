import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { getDashboardData } from '@/lib/dashboard-data'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Loader2, Briefcase, PhoneCall, TrendingUp, Users, PlusCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AgentPortalPage() {
  let user: any = null
  try {
    user = await getCurrentUser()
  } catch (err) {
    console.error('[AgentPortalPage] getCurrentUser error:', err)
  }

  // If not authenticated, prompt login with callback to agent portal
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center px-4">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 mb-4">
            <Briefcase className="h-7 w-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            Choutuppal Agent &amp; Partner Portal
          </h2>
          <p className="mt-2 text-sm text-slate-600 max-w-sm mx-auto">
            Manage your verified real estate leads, business listings, direct commission payouts, and customer inquiries.
          </p>
          <div className="mt-8 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
            <div className="space-y-4">
              <Link
                href="/login?callbackUrl=/agent"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-bold text-white shadow hover:bg-blue-700 transition"
              >
                Sign In to Agent Portal
              </Link>
              <Link
                href="/franchise"
                className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                Become a Choutuppal Franchise Agent
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (user.isBanned) redirect('/login?error=banned')

  let data: any = null
  try {
    data = await getDashboardData(user)
  } catch (err) {
    console.error('[AgentPortalPage] getDashboardData error:', err)
  }

  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <div className="min-h-screen bg-slate-50">
        {/* Agent Subdomain Top Banner Header */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white px-4 py-3 sm:px-6 shadow-sm">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15 text-white">
                <Briefcase className="h-4 w-4" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-200">Official Portal</p>
                <h1 className="text-sm sm:text-base font-black text-white">Choutuppal Real Estate &amp; Business Agent Workspace</h1>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200 border border-emerald-500/30">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Agent Sync
              </span>
            </div>
          </div>
        </div>

        {/* Core Agent Dashboard Shell */}
        <DashboardShell data={data} />
      </div>
    </Suspense>
  )
}
