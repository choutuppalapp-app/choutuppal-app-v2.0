'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, Clapperboard, Compass, User, Plus, Users, Bell } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useEffect, useState } from 'react'

export function BottomNav() {
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)

  // Hide on admin/agent routes — they have dedicated panel layouts
  if (pathname.startsWith('/admin') || pathname.startsWith('/agent')) return null

  useEffect(() => {
    let active = true
    fetch('/api/notifications?limit=1')
      .then((r) => r.json())
      .then((j) => { if (active && j.ok) setUnread(j.unreadCount) })
      .catch(() => {})
    const interval = setInterval(() => {
      fetch('/api/notifications?limit=1')
        .then((r) => r.json())
        .then((j) => { if (active && j.ok) setUnread(j.unreadCount) })
        .catch(() => {})
    }, 30000)
    return () => { active = false; clearInterval(interval) }
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/shorts') return pathname === '/shorts'
    if (href === '/explore') return pathname === '/explore'
    if (href === '/community') return pathname === '/community'
    if (href === '/dashboard') return pathname.startsWith('/dashboard')
    return false
  }

  const items = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Clapperboard, label: 'Shorts', href: '/shorts' },
    { icon: Compass, label: 'Explore', href: '/explore' },
    { icon: Users, label: 'Community', href: '/community' },
    { icon: User, label: 'You', href: '/dashboard' },
  ]

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex h-16 items-center justify-around border-t border-gray-200 bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Mobile bottom navigation"
    >
      {/* Home */}
      <Link href="/" className="flex flex-col items-center justify-center gap-1">
        <Home className={cn('h-6 w-6', isActive('/') ? 'text-blue-600' : 'text-gray-500')} />
        <span className={cn('text-[10px] font-medium', isActive('/') ? 'text-blue-600' : 'text-gray-500')}>Home</span>
      </Link>

      {/* Shorts */}
      <Link href="/shorts" className="flex flex-col items-center justify-center gap-1">
        <Clapperboard className={cn('h-6 w-6', isActive('/shorts') ? 'text-blue-600' : 'text-gray-500')} />
        <span className={cn('text-[10px] font-medium', isActive('/shorts') ? 'text-blue-600' : 'text-gray-500')}>Shorts</span>
      </Link>

      {/* Explore */}
      <Link href="/explore" className="flex flex-col items-center justify-center gap-1">
        <Compass className={cn('h-6 w-6', isActive('/explore') ? 'text-blue-600' : 'text-gray-500')} />
        <span className={cn('text-[10px] font-medium', isActive('/explore') ? 'text-blue-600' : 'text-gray-500')}>Explore</span>
      </Link>

      {/* Center FAB — Add */}
      <div className="flex items-center justify-center">
        <Link
          href="/dashboard?tab=add-listing"
          aria-label="Add new listing"
          className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white shadow-lg transition active:scale-95"
        >
          <Plus className="h-8 w-8" />
        </Link>
      </div>

      {/* Community */}
      <Link href="/community" className="flex flex-col items-center justify-center gap-1">
        <Users className={cn('h-6 w-6', isActive('/community') ? 'text-blue-600' : 'text-gray-500')} />
        <span className={cn('text-[10px] font-medium', isActive('/community') ? 'text-blue-600' : 'text-gray-500')}>Community</span>
      </Link>

      {/* Updates */}
      <Link href="/dashboard?tab=notifications" className="relative flex flex-col items-center justify-center gap-1">
        <Bell className={cn('h-6 w-6', pathname.includes('notifications') ? 'text-blue-600' : 'text-gray-500')} />
        {unread > 0 ? (
          <span className="absolute right-2 top-0 h-2 w-2 rounded-full bg-red-500" />
        ) : null}
        <span className={cn('text-[10px] font-medium', pathname.includes('notifications') ? 'text-blue-600' : 'text-gray-500')}>Updates</span>
      </Link>

      {/* You */}
      <Link href="/dashboard" className="flex flex-col items-center justify-center gap-1">
        <User className={cn('h-6 w-6', isActive('/dashboard') ? 'text-blue-600' : 'text-gray-500')} />
        <span className={cn('text-[10px] font-medium', isActive('/dashboard') ? 'text-blue-600' : 'text-gray-500')}>You</span>
      </Link>
    </nav>
  )
}
