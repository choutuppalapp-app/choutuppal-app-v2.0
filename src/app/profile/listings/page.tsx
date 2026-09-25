import { Suspense } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { getDashboardData } from '@/lib/dashboard-data'
import {
  Plus,
  Store,
  MessageSquare,
  Phone,
  MapPin,
  ExternalLink,
  Building2,
  CheckCircle2,
  Clock,
  Home,
  Wrench,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ListingQrCodeModal } from '@/components/business/listing-qr-code'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'My Listings & Services | Choutuppal Dashboard',
  description: 'Manage your active business listings, service packages, and real estate properties in Choutuppal.',
}

export default async function MyListingsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login?callbackUrl=/profile/listings')

  const data = await getDashboardData(user).catch(() => null)
  const listings = data?.listings || []
  const realEstates = data?.realEstates || []
  const services = data?.services || []

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              My Listings &amp; Services
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500">
              View and manage all your active directory listings, service rate cards, and property posts.
            </p>
          </div>

          <Link
            href="/profile/listings/new"
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md hover:bg-blue-700 transition"
          >
            <Plus className="h-4 w-4" />
            Add New Listing
          </Link>
        </div>
      </div>

      {/* Business Listings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Store className="h-5 w-5 text-blue-600" />
            Business &amp; Shop Listings ({listings.length})
          </h2>
          <Link
            href="/profile/listings/new"
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            + New Shop
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <Store className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-2 text-sm font-bold text-slate-800">No business listings yet</h3>
            <p className="mt-1 text-xs text-slate-500">
              List your shop or company to appear in Choutuppal directory search.
            </p>
            <Link
              href="/profile/listings/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Business Listing
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listings.map((item: any) => {
              const cover =
                item.coverImage ||
                item.image ||
                'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80'
              const title = item.title || item.name || 'Local Business'
              const phone = item.phone || item.whatsapp || '9494348175'
              const waLink = `https://wa.me/919494348175?text=${encodeURIComponent(
                `Hi I want to book ${title} on Choutuppal App`
              )}`

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      <Image
                        src={cover}
                        alt={title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className="bg-emerald-50 text-emerald-700 text-[10px] font-bold"
                        >
                          {item.status || 'Active'}
                        </Badge>
                        <span className="text-[11px] text-slate-400">
                          {item.category?.name || 'Local Business'}
                        </span>
                      </div>
                      <h3 className="mt-1 font-bold text-slate-900 text-sm truncate">
                        {title}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{item.village?.name || item.address || 'Choutuppal'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Pre-filled WhatsApp Service & QR Standee Generator */}
                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    <ListingQrCodeModal
                      listingId={item.id}
                      slug={item.slug}
                      title={title}
                      categoryName={item.category?.name}
                      villageName={item.village?.name}
                      logoUrl={item.logo}
                      phone={phone}
                      whatsapp={item.whatsapp}
                      address={item.address}
                      variant="button"
                    />
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Book Service on WhatsApp
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Real Estate Section */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Home className="h-5 w-5 text-emerald-600" />
            Real Estate Properties ({realEstates.length})
          </h2>
          <Link
            href="/profile/listings/new"
            className="text-xs font-bold text-blue-600 hover:text-blue-700"
          >
            + Post Property
          </Link>
        </div>

        {realEstates.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-8 text-center">
            <Home className="mx-auto h-10 w-10 text-slate-300" />
            <h3 className="mt-2 text-sm font-bold text-slate-800">No properties listed yet</h3>
            <p className="mt-1 text-xs text-slate-500">
              List your open plots, farmland, commercial spaces, or homes for sale or rent.
            </p>
            <Link
              href="/profile/listings/new"
              className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition"
            >
              <Plus className="h-3.5 w-3.5" />
              Post Real Estate Ad
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {realEstates.map((item: any) => {
              const cover =
                item.coverImage ||
                'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80'
              const title = item.title || 'Choutuppal Property'
              const price = item.price ? `₹${Number(item.price).toLocaleString('en-IN')}` : 'Price on Request'
              const waLink = `https://wa.me/919494348175?text=${encodeURIComponent(
                `Hi I want to inquire about Real Estate property: ${title} (${price}) in Choutuppal`
              )}`

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div className="flex gap-4">
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      <Image
                        src={cover}
                        alt={title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-blue-50 text-blue-700 text-[10px] font-bold">
                          {item.type || 'PLOT'}
                        </Badge>
                        <span className="text-xs font-black text-emerald-600">{price}</span>
                      </div>
                      <h3 className="mt-1 font-bold text-slate-900 text-sm truncate">
                        {title}
                      </h3>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                        <span className="truncate">{item.village?.name || item.address || 'Choutuppal'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Pre-filled WhatsApp Booking / Inquire Deep Link */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">Direct WhatsApp:</span>
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      Inquire via WhatsApp
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
