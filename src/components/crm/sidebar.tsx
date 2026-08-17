'use client'

import Link from 'next/link'
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  FileText,
  Megaphone,
  Brain,
  Settings,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type CrmView =
  | 'dashboard'
  | 'conversations'
  | 'contacts'
  | 'templates'
  | 'campaigns'
  | 'ai_brain'
  | 'settings'

interface SidebarProps {
  currentView: CrmView
  onSelectView: (view: CrmView) => void
  userRole?: string
}

export function CrmSidebar({ currentView, onSelectView, userRole }: SidebarProps) {
  const NAV_ITEMS: Array<{ id: CrmView; label: string; icon: any; badge?: string }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'conversations', label: 'Conversations', icon: MessageSquare, badge: 'Live' },
    { id: 'contacts', label: 'Contacts & Leads', icon: Users },
    { id: 'templates', label: 'Templates Library', icon: FileText },
    { id: 'campaigns', label: 'Bulk Campaigns', icon: Megaphone },
    { id: 'ai_brain', label: 'AI Brain (Rules)', icon: Brain, badge: 'AI' },
    { id: 'settings', label: 'Settings & Meta API', icon: Settings },
  ]

  return (
    <aside className="w-[250px] shrink-0 flex flex-col border-r border-gray-200 bg-white font-sans text-gray-900 h-full select-none">
      {/* Sidebar Brand Header */}
      <div className="flex h-14 items-center justify-between border-b border-gray-200 px-4 bg-gray-50/50">
        <div className="flex items-center gap-2.5">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-600 text-white font-black shadow-xs">
            C
          </div>
          <div>
            <h1 className="text-sm font-extrabold text-gray-900 leading-tight">Choutuppal CRM</h1>
            <p className="text-[10px] text-gray-500 font-medium">WhatsApp Console</p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1 fancy-scroll">
        <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Navigation
        </div>

        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = currentView === item.id

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-150',
                isActive
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={cn('h-4 w-4', isActive ? 'text-emerald-600' : 'text-gray-400')} />
                <span>{item.label}</span>
              </div>

              {item.badge ? (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[9px] font-extrabold uppercase',
                    isActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-gray-100 text-gray-600 border border-gray-200',
                  )}
                >
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-300 opacity-0 group-hover:opacity-100" />
              )}
            </button>
          )
        })}
      </div>

      {/* Footer Meta Status */}
      <div className="p-3 border-t border-gray-200 bg-gray-50/60">
        <div className="flex items-center gap-2 rounded-xl bg-white p-2.5 border border-gray-200 shadow-2xs">
          <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
          <div className="overflow-hidden text-[11px]">
            <p className="font-bold text-gray-900 truncate">Meta API Connected</p>
            <p className="text-[10px] text-gray-500">Choutuppal Webhook Live</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
