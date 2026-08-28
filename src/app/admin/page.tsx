import { getCurrentUser, isAdminRole } from '@/lib/session'
import { AdminPanel } from '@/components/admin/admin-panel'
import { AdminLoginForm } from '@/components/admin/admin-login-form'

export const revalidate = 3600

export default async function AdminPage() {
  const user = await getCurrentUser()
  if (!user || user.isBanned || !isAdminRole(user.role)) {
    return <AdminLoginForm />
  }

  return <AdminPanel adminName={user.name ?? user.username ?? 'Admin'} />
}
