'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Download, LogIn, Menu, X, Home, Newspaper, BookOpen, Users, Info, FileText, Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

/**
 * Global site header — renders on every page via layout.tsx.
 * Contains ONLY: Logo, desktop nav links, Login/Dashboard buttons, mobile hamburger.
 * Search/filters live in the Home page's Discover section (not here).
 */
export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-4 lg:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-lg font-black text-white shadow-lg shadow-blue-500/30">
            C
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-sm font-extrabold tracking-tight text-slate-900">
              Choutuppal
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">
              App v2.0
            </span>
          </span>
        </Link>

        {/* Desktop nav links */}
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

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-2 border-slate-200 bg-white/80 lg:inline-flex"
            onClick={() => {
              alert(
                'Install: tap your browser menu → "Add to Home screen" to install the Choutuppal App.',
              )
            }}
          >
            <Download className="h-4 w-4 text-blue-600" />
            <span className="hidden lg:inline">Install App</span>
          </Button>
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
          <Button
            asChild
            size="sm"
            variant="outline"
            className="hidden gap-2 border-slate-200 bg-white/80 md:inline-flex"
          >
            <Link href="/dashboard">
              Dashboard
            </Link>
          </Button>
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
          <MobileLink href="/dashboard" icon={Home} label="డాష్‌బోర్డ్" onClick={() => setMobileOpen(false)} />
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
