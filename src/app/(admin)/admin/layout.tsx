import React from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser, isAdminRole } from '@/lib/session'
import { AdminSidebar } from '@/components/admin/admin-sidebar'

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
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login?callbackUrl=/admin')
  }

  if (!isAdminRole(user.role)) {
    redirect('/')
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
