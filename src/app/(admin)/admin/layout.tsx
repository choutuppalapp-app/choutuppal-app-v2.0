import React from 'react'
import { getCurrentUser, isAdminRole } from '@/lib/session'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminAccessGate } from '@/components/admin/admin-access-gate'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Admin Control Center | Choutuppal Super App',
  description: 'Manage listings, users, news, banners, stories, and tickers for Choutuppal.',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let user = null
  try {
    user = await getCurrentUser()
  } catch (err) {
    console.error('[AdminLayout] Failed to read current session:', err)
  }

  // If user is not authenticated or not an admin, render the elegant Admin Access Gate directly
  if (!user || !isAdminRole(user.role)) {
    return (
      <AdminAccessGate
        currentUser={
          user
            ? {
                name: user.name,
                email: user.email,
                role: user.role,
              }
            : null
        }
      />
    )
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    username: user.username,
    role: user.role,
    image: user.image,
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      <AdminSidebar user={safeUser} />
      <div className="flex-1 md:pl-64 flex flex-col min-w-0">
        <main className="flex-1 pb-16">
          {children}
        </main>
      </div>
    </div>
  )
}
