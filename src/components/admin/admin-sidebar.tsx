'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Store,
  Users,
  Newspaper,
  Image as ImageIcon,
  Video,
  Megaphone,
  ShieldCheck,
  ExternalLink,
  Menu,
  X,
  ChevronRight,
  LogOut,
  Sparkles,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { signOut } from 'next-auth/react'

export interface AdminNavProps {
  user: {
    id: string
    name?: string | null
    email?: string | null
    username?: string | null
    role?: string
    image?: string | null
  }
}

export const ADMIN_NAV_LINKS = [
  {
    title: 'Dashboard',
    telugu: 'డాష్‌బోర్డ్',
    href: '/admin',
    icon: LayoutDashboard,
    badge: null,
  },
  {
    title: 'Listings',
    telugu: 'షాపులు & సేవలు',
    href: '/admin/listings',
    icon: Store,
    badge: 'Real-time',
  },
  {
    title: 'Users',
    telugu: 'యూజర్లు',
    href: '/admin/users',
    icon: Users,
    badge: null,
  },
  {
    title: 'News & Blogs',
    telugu: 'వార్తలు & బ్లాగులు',
    href: '/admin/news',
    icon: Newspaper,
    badge: 'AI Ready',
  },
  {
    title: 'Stories & Banners',
    telugu: 'స్టోరీస్ & బ్యానర్లు',
    href: '/admin/stories-banners',
    icon: ImageIcon,
    badge: '₹99 Ads',
  },
  {
    title: 'Shorts & Social',
    telugu: 'షార్ట్స్ & సోషల్',
    href: '/admin/shorts',
    icon: Video,
    badge: null,
  },
  {
    title: 'Ticker',
    telugu: 'లైవ్ టిక్కర్',
    href: '/admin/ticker',
    icon: Megaphone,
    badge: 'Live',
  },
]

export function AdminSidebar({ user }: AdminNavProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isLinkActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  const NavContent = (
    <div className="flex h-full flex-col justify-between bg-white">
      <div>
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <Link href="/admin" className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-700 text-white shadow-sm shadow-blue-500/20">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 tracking-tight text-base">Choutuppal</span>
                <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">చౌటుప్పల్ సూపర్ యాప్</p>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Navigation Menu
          </div>
          {ADMIN_NAV_LINKS.map((link) => {
            const Icon = link.icon
            const active = isLinkActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150',
                  active
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs border border-blue-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-5 w-5 transition-colors',
                      active ? 'text-blue-700' : 'text-slate-400 group-hover:text-slate-600'
                    )}
                  />
                  <span>{link.title}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {link.badge && (
                    <span
                      className={cn(
                        'rounded-md px-1.5 py-0.5 text-[10px] font-semibold',
                        link.badge === 'Live'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : link.badge === '₹99 Ads'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      )}
                    >
                      {link.badge}
                    </span>
                  )}
                  {active && <ChevronRight className="h-4 w-4 text-blue-700 opacity-80" />}
                </div>
              </Link>
            )
          })}
        </div>

        {/* Quick Tools & Web Link */}
        <div className="px-3 pt-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex items-center gap-2 mb-1 text-xs font-semibold text-slate-900">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>Light Theme Pro</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Super Admin panel with real-time sync & AI generators.
            </p>
            <div className="mt-2.5 pt-2.5 border-t border-slate-200/80 flex items-center justify-between">
              <Link
                href="/"
                target="_blank"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-800"
              >
                <span>Live Website</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
              <Link
                href="/dashboard"
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                User Portal
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* User Profile & Logout Bottom Bar */}
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2.5 border border-slate-200/80">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-blue-700 font-bold text-white text-sm uppercase">
              {user.name?.charAt(0) || user.username?.charAt(0) || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-slate-900">
                {user.name || user.username || 'Administrator'}
              </p>
              <p className="truncate text-[10px] text-slate-500">{user.email || user.role}</p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            title="Sign Out"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-rose-600 hover:shadow-xs border border-transparent hover:border-slate-200 transition"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30 border-r border-slate-200 bg-white">
        {NavContent}
      </aside>

      {/* Mobile Sidebar Trigger & Drawer */}
      <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-blue-700 text-white font-bold text-xs">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <span className="font-bold text-slate-900 text-sm">Choutuppal Admin</span>
          </div>
        </div>
        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-lg"
        >
          <span>Live Site</span>
          <ExternalLink className="h-3 w-3" />
        </Link>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white shadow-xl">
            {NavContent}
          </div>
        </div>
      )}
    </>
  )
}
