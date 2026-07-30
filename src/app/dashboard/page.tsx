import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { getDashboardData } from '@/lib/dashboard-data'
import { DashboardShell } from '@/components/dashboard/dashboard-shell'

export const dynamic = 'force-dynamic'

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

  return <DashboardShell data={data} />
}
