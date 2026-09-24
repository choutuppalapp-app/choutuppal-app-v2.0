import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import {
  LayoutDashboard,
  Store,
  PlusCircle,
  Bookmark,
  BarChart3,
  User,
  LogOut,
  ExternalLink,
  MessageCircle,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  Headphones,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export const dynamic = 'force-dynamic'

interface ProfileLayoutProps {
  children: React.ReactNode
}

export default async function ProfileLayout({ children }: ProfileLayoutProps) {
  let user: any = null
  try {
    user = await getCurrentUser()
  } catch (err) {
    console.error('[ProfileLayout] getCurrentUser error:', err)
  }

  if (!user) {
    redirect('/login?callbackUrl=/profile')
  }

  if (user.isBanned) {
    redirect('/login?error=banned')
  }

  const navItems = [
    {
      href: '/profile',
      label: 'Overview & Profile',
      icon: LayoutDashboard,
      description: 'Account status & details',
    },
    {
      href: '/profile/listings',
      label: 'My Listings & Services',
      icon: Store,
      description: 'Manage shops, services, plots',
    },
    {
      href: '/profile/listings/new',
      label: 'Add New Listing',
      icon: PlusCircle,
      description: 'Full-page creation form',
      highlight: true,
    },
    {
      href: '/profile/saved',
      label: 'Saved & Bookmarks',
      icon: Bookmark,
      description: 'Favorite local listings',
    },
    {
      href: '/profile/analytics',
      label: 'Analytics & Traffic',
      icon: BarChart3,
      description: 'Views, leads, and clicks',
    },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Banner / Mobile Nav Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 transition"
            >
              ← Back to Portal
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-sm font-black text-slate-900">
              User Dashboard
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/profile/listings/new"
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Add Listing</span>
              <span className="sm:hidden">Add</span>
            </Link>

            <a
              href="https://wa.me/919494348175?text=Hi%20Choutuppal%20Support%2C%20I%20need%20help%20with%20my%20Dashboard%20account"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span className="hidden md:inline">WhatsApp Help</span>
            </a>
          </div>
        </div>

        {/* Mobile Horizontal Sub-Navigation Scrollbar */}
        <div className="lg:hidden border-t border-slate-100 overflow-x-auto py-2 px-4 flex gap-2 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                  item.highlight
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Desktop Left Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* User Identity Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 font-black text-white text-lg shadow-sm">
                    {user.name ? user.name.slice(0, 2).toUpperCase() : 'CU'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-black text-slate-900">
                      {user.name || 'Choutuppal User'}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {user.phone || user.email || '@' + (user.username || 'member')}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-600">
                  <span className="flex items-center gap-1 text-emerald-600">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Verified User
                  </span>
                  <Badge variant="secondary" className="text-[11px] font-bold">
                    {user.role || 'MEMBER'}
                  </Badge>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="rounded-3xl border border-slate-200 bg-white p-3 shadow-xs space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`group flex items-center justify-between rounded-2xl p-3 text-xs font-bold transition ${
                        item.highlight
                          ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-xl transition ${
                            item.highlight
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <div>{item.label}</div>
                          <div className="text-[10px] font-normal text-slate-400">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition" />
                    </Link>
                  )
                })}
              </nav>

              {/* Help & Support Widget */}
              <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-teal-50 p-5 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-800 text-xs font-black uppercase tracking-wider">
                  <Headphones className="h-4 w-4 text-emerald-600" />
                  Need Help?
                </div>
                <p className="mt-1 text-xs text-emerald-700">
                  Connect with Choutuppal local business concierge for premium verification or banner ads.
                </p>
                <a
                  href="https://wa.me/919494348175?text=Hi%20Choutuppal%20Team%2C%20I%20need%20help%20with%20my%20Business%20Listing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp +91 9494348175
                </a>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-3 min-h-[600px]">{children}</main>
        </div>
      </div>
    </div>
  )
}
