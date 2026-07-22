import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { isAdminRole } from '@/lib/session'
import { AdminPanel } from '@/components/admin/admin-panel'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (user.isBanned) redirect('/')
  if (!isAdminRole(user.role)) redirect('/')

  return <AdminPanel adminName={user.name ?? user.username ?? 'Admin'} />
}
