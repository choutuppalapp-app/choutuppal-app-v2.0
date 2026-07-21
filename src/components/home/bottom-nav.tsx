'use client'

import { Home, Play, Compass, Plus, User } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'Home', icon: Home, href: '/' },
  { label: 'Shorts', icon: Play, href: '/#shorts' },
  { label: 'Explore', icon: Compass, href: '/#explore' },
  { label: 'You', icon: User, href: '/login' },
]

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/50 bg-white/85 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Primary mobile navigation"
    >
      <div className="relative mx-auto grid max-w-md grid-cols-5 items-center px-2 py-1.5">
        {TABS.slice(0, 2).map((t) => (
          <TabLink key={t.label} {...t} />
        ))}

        {/* Center FAB */}
        <Link
          href="/login"
          aria-label="Add new listing"
          className="relative flex justify-center"
        >
          <span className="-mt-6 grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-white shadow-lg shadow-blue-500/40 transition active:scale-95">
            <Plus className="h-7 w-7" />
          </span>
        </Link>

        {TABS.slice(2).map((t) => (
          <TabLink key={t.label} {...t} />
        ))}
      </div>
    </nav>
  )
}

function TabLink({
  label,
  icon: Icon,
  href,
}: {
  label: string
  icon: typeof Home
  href: string
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium text-slate-500 transition hover:text-blue-600',
      )}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  )
}
