import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, isAgentRole } from '@/lib/session'
import { MessageSquare, ArrowLeft, User as UserIcon } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata = {
  title: 'WhatsApp Smart CRM | Choutuppal App',
  description: 'Interakt & AiSensy style WhatsApp CRM with AI Brain',
}

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && user.role !== 'AGENT')) {
    redirect('/login?callbackUrl=/crm')
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-gray-50 text-gray-900 font-sans">
      {/* Interakt-Style Clean Light Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 z-20 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-gray-900"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-600 text-white shadow-xs">
              <MessageSquare className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm text-gray-900 tracking-tight">WhatsApp CRM</span>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
              Interakt AI
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-gray-700">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-gray-100 border border-gray-200 px-3 py-1">
            <UserIcon className="h-3.5 w-3.5 text-blue-600" />
            <span className="font-medium text-gray-800">{user.name || user.email}</span>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
              {user.role}
            </span>
          </div>
        </div>
      </header>

      {/* Main CRM Body */}
      <main className="flex-1 overflow-hidden">{children}</main>
    </div>
  )
}
