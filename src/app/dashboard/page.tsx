import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { getDashboardData } from '@/lib/dashboard-data'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'
import { Loader2 } from 'lucide-react'

export const revalidate = 3600

export default async function DashboardPage() {
  let user: any = null
  try {
    user = await getCurrentUser()
  } catch (err) {
    console.error('[DashboardPage] getCurrentUser error:', err)
  }

  if (!user) redirect('/login')
  if (user.isBanned) redirect('/login?error=banned')

  let data: any = null
  try {
    data = await getDashboardData(user)
  } catch (err) {
    console.error('[DashboardPage] getDashboardData error:', err)
  }

  return (
    <Suspense fallback={
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    }>
      <DashboardShell data={data} />
    </Suspense>
  )
}
