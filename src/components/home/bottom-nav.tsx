'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Clapperboard, Compass, User, Plus, Users, Newspaper } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
  const pathname = usePathname()

  // Hide on admin/agent routes — they have dedicated panel layouts
  if (pathname.startsWith('/admin') || pathname.startsWith('/agent')) return null

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/shorts') return pathname === '/shorts'
    if (href === '/explore') return pathname === '/explore'
    if (href === '/community') return pathname === '/community'
    if (href === '/news') return pathname === '/news'
    if (href === '/dashboard') return pathname.startsWith('/dashboard')
    return false
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-gray-200 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:hidden px-1"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile bottom navigation"
    >
      {/* Home */}
      <Link href="/" className="flex flex-col items-center justify-center gap-0.5">
        <Home className={cn('h-5 w-5', isActive('/') ? 'text-blue-600' : 'text-gray-500')} />
        <span className={cn('text-[9px] font-medium', isActive('/') ? 'text-blue-600' : 'text-gray-500')}>Home</span>
      </Link>

      {/* Shorts */}
      <Link href="/shorts" className="flex flex-col items-center justify-center gap-0.5">
        <Clapperboard className={cn('h-5 w-5', isActive('/shorts') ? 'text-blue-600' : 'text-gray-500')} />
        <span className={cn('text-[9px] font-medium', isActive('/shorts') ? 'text-blue-600' : 'text-gray-500')}>Shorts</span>
      </Link>

      {/* Explore */}
      <Link href="/explore" className="flex flex-col items-center justify-center gap-0.5">
        <Compass className={cn('h-5 w-5', isActive('/explore') ? 'text-blue-600' : 'text-gray-500')} />
        <span className={cn('text-[9px] font-medium', isActive('/explore') ? 'text-blue-600' : 'text-gray-500')}>Explore</span>
      </Link>

      {/* Center FAB — Add */}
      <div className="flex items-center justify-center">
        <Link
          href="/dashboard?tab=add-listing"
          aria-label="Add new listing"
          className="-mt-7 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white shadow-lg transition active:scale-95"
        >
          <Plus className="h-7 w-7" />
        </Link>
      </div>

      {/* Community */}
      <Link href="/community" className="flex flex-col items-center justify-center gap-0.5">
        <Users className={cn('h-5 w-5', isActive('/community') ? 'text-blue-600' : 'text-gray-500')} />
        <span className={cn('text-[9px] font-medium', isActive('/community') ? 'text-blue-600' : 'text-gray-500')}>Community</span>
      </Link>

      {/* News */}
      <Link href="/news" className="flex flex-col items-center justify-center gap-0.5">
        <Newspaper className={cn('h-5 w-5', isActive('/news') ? 'text-blue-600' : 'text-gray-500')} />
        <span className={cn('text-[9px] font-medium', isActive('/news') ? 'text-blue-600' : 'text-gray-500')}>News</span>
      </Link>

      {/* You */}
      <Link href="/dashboard" className="flex flex-col items-center justify-center gap-0.5">
        <User className={cn('h-5 w-5', isActive('/dashboard') ? 'text-blue-600' : 'text-gray-500')} />
        <span className={cn('text-[9px] font-medium', isActive('/dashboard') ? 'text-blue-600' : 'text-gray-500')}>You</span>
      </Link>
    </nav>
  )
}
