import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, isAgentRole } from '@/lib/session'
import { MessageSquare, ArrowLeft, Bot, Sparkles, User as UserIcon } from 'lucide-react'

export const metadata = {
  title: 'WhatsApp Smart CRM | Choutuppal App',
  description: 'AiSensy & Interakt-style WhatsApp CRM with Self-Learning AI Brain',
}

export default async function CrmLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user || !isAgentRole(user.role)) {
    redirect('/login?callbackUrl=/crm')
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Minimal Top Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 backdrop-blur z-20">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg gradient-brand text-white shadow-xs">
              <MessageSquare className="h-4 w-4" />
            </div>
            <span className="font-bold text-sm text-white tracking-wide">WhatsApp CRM</span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
              AI Powered
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-300">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-slate-800 border border-slate-700 px-3 py-1">
            <UserIcon className="h-3.5 w-3.5 text-blue-400" />
            <span className="font-medium">{user.name || user.email}</span>
            <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded">
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
