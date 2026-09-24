import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { Bookmark, Store, MessageSquare, Phone, MapPin, Sparkles, Compass } from 'lucide-react'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Saved Listings & Bookmarks | Choutuppal Dashboard',
  description: 'View and manage your favorite and bookmarked local listings in Choutuppal.',
}

export default async function SavedListingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=/profile/saved')

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Saved &amp; Bookmarks
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              Access your bookmarked business listings, emergency contacts, and saved properties.
            </p>
          </div>

          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            <Compass className="h-4 w-4" />
            Explore Directory
          </Link>
        </div>
      </div>

      {/* Saved Directory List */}
      <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
        <Bookmark className="mx-auto h-12 w-12 text-slate-300" />
        <h3 className="mt-3 text-base font-bold text-slate-800">
          No saved bookmarks yet
        </h3>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
          Tap the bookmark icon on any business, emergency service, or real estate property to save it here for quick access.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/explore"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
          >
            Browse Choutuppal Directory
          </Link>
          <a
            href="https://wa.me/919494348175?text=Hi%20Choutuppal%2C%20I%20am%20looking%20for%20a%20local%20service"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
          >
            <MessageSquare className="h-4 w-4" />
            WhatsApp Inquiries
          </a>
        </div>
      </div>
    </div>
  )
}
