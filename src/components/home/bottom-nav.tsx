'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Play, Compass, User, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()

  // Determine active state for each tab
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/explore') return pathname === '/explore'
    if (href === '/dashboard') return pathname.startsWith('/dashboard')
    return false
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 grid h-16 grid-cols-5 border-t border-gray-200 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile bottom navigation"
    >
      {/* Home */}
      <Link
        href="/"
        className="flex flex-col items-center justify-center gap-1"
      >
        <Home className={cn('h-6 w-6', isActive('/') ? 'text-blue-600' : 'text-gray-500')} />
        <span className={cn('text-[10px] font-medium', isActive('/') ? 'text-blue-600' : 'text-gray-500')}>
          Home
        </span>
      </Link>

      {/* Shorts */}
      <Link
        href="/#shorts"
        className="flex flex-col items-center justify-center gap-1"
      >
        <Play className="h-6 w-6 text-gray-500" />
        <span className="text-[10px] font-medium text-gray-500">Shorts</span>
      </Link>

      {/* Center FAB — Add */}
      <div className="flex items-center justify-center">
        <Link
          href="/dashboard"
          aria-label="Add new listing"
          className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white shadow-lg transition active:scale-95"
        >
          <Plus className="h-8 w-8" />
        </Link>
      </div>

      {/* Explore */}
      <Link
        href="/explore"
        className="flex flex-col items-center justify-center gap-1"
      >
        <Compass className={cn('h-6 w-6', isActive('/explore') ? 'text-blue-600' : 'text-gray-500')} />
        <span className={cn('text-[10px] font-medium', isActive('/explore') ? 'text-blue-600' : 'text-gray-500')}>
          Explore
        </span>
      </Link>

      {/* You */}
      <Link
        href="/dashboard"
        className="flex flex-col items-center justify-center gap-1"
      >
        <User className={cn('h-6 w-6', isActive('/dashboard') ? 'text-blue-600' : 'text-gray-500')} />
        <span className={cn('text-[10px] font-medium', isActive('/dashboard') ? 'text-blue-600' : 'text-gray-500')}>
          You
        </span>
      </Link>
    </nav>
  )
}
