'use client'

import { Home, Play, Compass, Plus, User } from 'lucide-react'
import Link from 'next/link'

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 grid h-16 grid-cols-5 border-t border-gray-200 bg-white shadow-md md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary mobile navigation"
    >
      {/* Home */}
      <Link
        href="/"
        className="flex flex-col items-center justify-center gap-0.5 text-slate-500 transition hover:text-blue-600"
      >
        <Home className="h-5 w-5" />
        <span className="text-[10px] font-medium">Home</span>
      </Link>

      {/* Shorts */}
      <Link
        href="/#shorts"
        className="flex flex-col items-center justify-center gap-0.5 text-slate-500 transition hover:text-blue-600"
      >
        <Play className="h-5 w-5" />
        <span className="text-[10px] font-medium">Shorts</span>
      </Link>

      {/* Center FAB — Add */}
      <Link
        href="/dashboard"
        aria-label="Add new listing"
        className="relative flex items-start justify-center"
      >
        <span className="-mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white shadow-lg">
          <Plus className="h-7 w-7" />
        </span>
      </Link>

      {/* Explore */}
      <Link
        href="/#explore"
        className="flex flex-col items-center justify-center gap-0.5 text-slate-500 transition hover:text-blue-600"
      >
        <Compass className="h-5 w-5" />
        <span className="text-[10px] font-medium">Explore</span>
      </Link>

      {/* You */}
      <Link
        href="/dashboard"
        className="flex flex-col items-center justify-center gap-0.5 text-slate-500 transition hover:text-blue-600"
      >
        <User className="h-5 w-5" />
        <span className="text-[10px] font-medium">You</span>
      </Link>
    </nav>
  )
}
