'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LogIn, LogOut, Menu, X, Home, Newspaper, BookOpen, Users, Info, FileText, Shield } from 'lucide-react'
import { signOut, useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { NotificationBell } from '@/components/home/notification-bell'

/**
 * Global site header — renders on every page via layout.tsx.
 * Hidden on /admin, /agent, and /dashboard (those have dedicated panel headers).
 */
export function SiteHeader() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Hide on admin/agent/dashboard routes — they have dedicated panel headers
  if (pathname.startsWith('/admin') || pathname.startsWith('/agent') || pathname.startsWith('/dashboard')) return null

  const isLoggedIn = !!session?.user

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-4 lg:px-6">
        {/* Left: Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <img src="/logo.png" alt="Choutuppal App" className="h-10 w-auto" />
        </Link>

        {/* Center: Desktop nav links */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/" className="text-sm font-semibold text-slate-600 transition hover:text-blue-600">
            Home
          </Link>
          <Link href="/news" className="text-sm font-semibold text-slate-600 transition hover:text-blue-600">
            News
          </Link>
          <Link href="/blog" className="text-sm font-semibold text-slate-600 transition hover:text-blue-600">
            Blog
          </Link>
          <Link href="/community" className="text-sm font-semibold text-slate-600 transition hover:text-blue-600">
            Community
          </Link>
          <Link href="/about" className="text-sm font-semibold text-slate-600 transition hover:text-blue-600">
            About
          </Link>
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            /* Logged in: Dashboard + Logout side by side (desktop only) */
            <>
              <Button
                asChild
                size="sm"
                className="hidden gap-2 gradient-brand text-white shadow-md shadow-blue-500/30 md:inline-flex"
              >
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button
                onClick={() => signOut({ callbackUrl: '/' })}
                size="sm"
                variant="ghost"
                className="hidden gap-1.5 text-red-500 hover:bg-red-50 md:inline-flex"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:inline">Logout</span>
              </Button>
            </>
          ) : (
            /* Logged out: Login button only */
            <Button
              asChild
              size="sm"
              className="gap-2 gradient-brand text-white shadow-md shadow-blue-500/30"
            >
              <Link href="/login">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
            </Button>
          )}

          {/* Notification bell — only when logged in */}
          {isLoggedIn ? <NotificationBell /> : null}

          {/* Mobile hamburger — md:hidden so it only shows on mobile */}
          <button
            aria-label="Toggle menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white/80 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      <div
        className={cn(
          'border-t border-white/40 bg-white/80 px-3 py-3 backdrop-blur-xl md:hidden',
          mobileOpen ? 'block' : 'hidden',
        )}
      >
        <nav className="grid grid-cols-2 gap-1.5">
          <MobileLink href="/" icon={Home} label="హోమ్" onClick={() => setMobileOpen(false)} />
          <MobileLink href="/news" icon={Newspaper} label="న్యూస్" onClick={() => setMobileOpen(false)} />
          <MobileLink href="/blog" icon={BookOpen} label="బ్లాగ్స్" onClick={() => setMobileOpen(false)} />
          <MobileLink href="/community" icon={Users} label="కమ్యూనిటీ" onClick={() => setMobileOpen(false)} />
          <MobileLink href="/about" icon={Info} label="అబౌట్ అస్" onClick={() => setMobileOpen(false)} />
          <MobileLink href="/terms" icon={FileText} label="టర్మ్స్" onClick={() => setMobileOpen(false)} />
          <MobileLink href="/privacy" icon={Shield} label="ప్రైవసీ" onClick={() => setMobileOpen(false)} />
          {isLoggedIn ? (
            <>
              <MobileLink href="/dashboard" icon={Home} label="డాష్‌బోర్డ్" onClick={() => setMobileOpen(false)} />
              <button
                onClick={() => { signOut({ callbackUrl: '/' }); setMobileOpen(false) }}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                <LogOut className="h-4 w-4 text-red-500" />
                <span className="font-telugu">లాగౌట్</span>
              </button>
            </>
          ) : (
            <MobileLink href="/login" icon={LogIn} label="లాగిన్" onClick={() => setMobileOpen(false)} />
          )}
        </nav>
      </div>
    </header>
  )
}

function MobileLink({
  href,
  icon: Icon,
  label,
  onClick,
}: {
  href: string
  icon: typeof Home
  label: string
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
    >
      <Icon className="h-4 w-4 text-blue-500" />
      <span className="font-telugu">{label}</span>
    </Link>
  )
}
