'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Phone,
  MessageCircle,
  UserPlus,
  MapPin,
  Share2,
  Star,
  Eye,
  Clock,
  BadgeCheck,
  ChevronLeft,
  ExternalLink,
  Image as ImageIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import type { Listing, Category, Village, User } from '@prisma/client'

interface ListingDetailData {
  listing: Listing & {
    category: Category | null
    village: Village | null
    owner: Pick<User, 'id' | 'name' | 'username' | 'phone' | 'image'>
  }
  isOwner: boolean
  isAdmin: boolean
}

export interface RelatedListing {
  id: string
  slug: string
  title: string
  coverImage: string | null
  logo: string | null
  views: number
  isFeatured: boolean
  village: { name: string } | null
}

export function ListingDetailView({
  data,
  related = [],
}: {
  data: ListingDetailData
  related?: RelatedListing[]
}) {
  const { listing, isOwner, isAdmin } = data
  const gallery = (listing.gallery as string[] | null) ?? []
  const services = (listing.servicesCatalog as Array<{
    name: string
    price?: string
    description?: string
    image?: string
  }> | null) ?? []
  const hours = listing.businessHours as Record<
    string,
    { open: string; close: string }
  > | null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-28 lg:pb-0">
      {/* Top nav */}
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-3 sm:px-4">
          <Link href="/" className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-base font-black text-white">
            C
          </span>
          <span className="truncate text-sm font-bold text-slate-900">
            {listing.title}
          </span>
          {isOwner || isAdmin ? (
            <Badge className="ml-auto bg-amber-100 text-amber-700 hover:bg-amber-100">
              {isOwner ? 'Your Listing' : `Admin · ${listing.status}`}
            </Badge>
          ) : null}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Main column */}
          <div className="min-w-0 flex-1 space-y-6">
            {/* Cover + Logo */}
            <div className="overflow-hidden rounded-3xl glass">
              <div className="relative">
                <div className="relative aspect-[16/9] w-full">
                  {listing.coverImage ? (
                     
                    <img
                      src={listing.coverImage}
                      alt={`${listing.title} cover`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full gradient-brand" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                </div>

                {/* Overlapping logo */}
                <div className="px-5 pb-5">
                  <div className="-mt-12 flex items-end gap-4">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-4 border-white bg-white shadow-lg sm:h-28 sm:w-28">
                      {listing.logo ? (
                         
                        <img src={listing.logo} alt={listing.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="grid h-full w-full place-items-center gradient-brand text-3xl font-black text-white sm:text-4xl">
                          {listing.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 pb-1">
                      <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
                        {listing.title}
                      </h1>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {listing.category ? (
                          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                            {listing.category.name}
                          </Badge>
                        ) : null}
                        {listing.isFeatured ? (
                          <span className="flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            <BadgeCheck className="h-3 w-3 text-blue-600" /> Featured
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Info row */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <InfoTile icon={Star} label="Rating" value="4.5" accent="amber" />
              <InfoTile icon={Eye} label="Views" value={listing.views.toString()} accent="blue" />
              <InfoTile icon={Clock} label="Open" value="9–9" accent="green" />
              <InfoTile icon={MapPin} label="Area" value={listing.village?.name ?? 'Choutuppal'} accent="blue" />
            </div>

            {/* About */}
            <section className="rounded-3xl glass p-5">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-700">
                About
              </h2>
              <div
                className="prose prose-sm max-w-none text-slate-700"
                dangerouslySetInnerHTML={{
                  __html: listing.description
                    .replace(/\n/g, '<br/>'),
                }}
              />
            </section>

            {/* Services catalog */}
            {services.length > 0 ? (
              <section>
                <h2 className="mb-3 px-1 text-sm font-bold uppercase tracking-wide text-slate-700">
                  Services Catalog
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((s, i) => (
                    <div key={i} className="hover-lift rounded-2xl glass p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-slate-900">{s.name}</h3>
                        {s.price ? (
                          <span className="shrink-0 rounded-full gradient-brand px-2.5 py-0.5 text-xs font-bold text-white">
                            {s.price}
                          </span>
                        ) : null}
                      </div>
                      {s.description ? (
                        <p className="mt-1 text-xs text-slate-500">{s.description}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Gallery */}
            {gallery.length > 0 ? (
              <section>
                <h2 className="mb-3 flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-wide text-slate-700">
                  <ImageIcon className="h-4 w-4 text-blue-500" /> Gallery
                </h2>
                <div className="no-scrollbar -mx-3 flex gap-3 overflow-x-auto px-3 pb-2">
                  {gallery.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl glass sm:h-44 sm:w-44"
                    >
                      { }
                      <img
                        src={url}
                        alt={`${listing.title} gallery ${i + 1}`}
                        className="h-full w-full object-cover transition hover:scale-105"
                      />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Address + Hours */}
            <section className="grid gap-3 sm:grid-cols-2">
              {listing.address ? (
                <div className="rounded-2xl glass p-4">
                  <h3 className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-blue-500" /> Address
                  </h3>
                  <p className="text-sm text-slate-700">{listing.address}</p>
                  {listing.mapEmbed ? (
                    <a
                      href={listing.mapEmbed}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Open in Google Maps <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>
              ) : null}
              {hours ? (
                <div className="rounded-2xl glass p-4">
                  <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                    <Clock className="h-3.5 w-3.5 text-amber-500" /> Business Hours
                  </h3>
                  <ul className="space-y-1 text-xs text-slate-700">
                    {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map((d) => {
                      const h = hours[d]
                      return (
                        <li key={d} className="flex justify-between capitalize">
                          <span>{d}</span>
                          <span className="font-medium">
                            {h ? `${h.open} – ${h.close}` : 'Closed'}
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ) : null}
            </section>
          </div>

          {/* Desktop sticky sidebar */}
          <aside className="hidden w-72 shrink-0 lg:block">
            <div className="sticky top-20 space-y-3">
              <div className="rounded-3xl glass-strong p-5">
                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
                  Get in Touch
                </h3>
                <ActionBar
                  listing={listing}
                  vertical
                />
              </div>
              {listing.phone || listing.whatsapp ? (
                <div className="rounded-3xl glass p-4 text-center text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">{listing.owner.name ?? 'Business Owner'}</p>
                  <p className="mt-1">Responds within a few hours</p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>

      {/* Related Listings — "ఇంకా ఇవి కూడా చూడండి" */}
      {related.length > 0 ? (
        <section className="mx-auto max-w-6xl px-3 sm:px-4 lg:px-6">
          <h2 className="font-telugu mb-3 text-lg font-bold text-slate-900">
            ఇంకా ఇవి కూడా చూడండి
          </h2>
          <div className="no-scrollbar -mx-3 flex gap-4 overflow-x-auto px-3 pb-2">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/business/${r.slug}`}
                className="hover-lift group w-[200px] shrink-0 overflow-hidden rounded-2xl glass"
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  {r.coverImage || r.logo ? (
                    <img src={(r.coverImage || r.logo)!} alt={r.title} className="h-full w-full object-cover transition group-hover:scale-105" />
                  ) : (
                    <div className="grid h-full w-full place-items-center gradient-brand text-2xl font-black text-white">
                      {r.title.charAt(0)}
                    </div>
                  )}
                  {r.isFeatured ? (
                    <span className="absolute right-2 top-2 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">
                      Premium
                    </span>
                  ) : null}
                </div>
                <div className="p-3">
                  <h3 className="truncate text-sm font-bold text-slate-900">{r.title}</h3>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    {r.village?.name ?? 'Choutuppal'} · {r.views} views
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {/* Sticky mobile action bar */}
      <MobileActionBar listing={listing} />
    </div>
  )
}

/* -------------------------------------------------------------------------- */

function InfoTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Star
  label: string
  value: string
  accent: 'blue' | 'amber' | 'green'
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-400',
    amber: 'from-amber-500 to-amber-400',
    green: 'from-emerald-500 to-emerald-400',
  }[accent]
  return (
    <div className="rounded-2xl glass p-3">
      <div className={cn('mb-1.5 grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br text-white', colors)}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-sm font-bold text-slate-900">{value}</div>
      <div className="text-[10px] text-slate-500">{label}</div>
    </div>
  )
}

function ActionBar({
  listing,
  vertical = false,
}: {
  listing: ListingDetailData['listing']
  vertical?: boolean
}) {
  const phone = listing.phone
  const whatsapp = listing.whatsapp
  const name = listing.title
  const address = listing.address ?? ''
  const mapLink = listing.mapEmbed ?? `https://maps.google.com/?q=${encodeURIComponent(address || name)}`

  return (
    <div className={cn('gap-2', vertical ? 'flex flex-col' : 'grid grid-cols-5')}>
      <ActionButton
        vertical={vertical}
        icon={Phone}
        label="Call"
        href={phone ? `tel:${phone}` : null}
        onClick={() => !phone && toast.error('No phone number provided')}
        accent="bg-emerald-500"
      />
      <ActionButton
        vertical={vertical}
        icon={MessageCircle}
        label="WhatsApp"
        href={whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, '')}` : null}
        onClick={() => !whatsapp && toast.error('No WhatsApp number provided')}
        accent="bg-green-500"
      />
      <ActionButton
        vertical={vertical}
        icon={UserPlus}
        label="Save Contact"
        onClick={() => downloadVcf(listing)}
        accent="bg-blue-500"
      />
      <ActionButton
        vertical={vertical}
        icon={MapPin}
        label="Location"
        href={mapLink}
        accent="bg-amber-500"
      />
      <ActionButton
        vertical={vertical}
        icon={Share2}
        label="Share"
        onClick={shareListing}
        accent="gradient-brand"
      />
    </div>
  )
}

function ActionButton({
  icon: Icon,
  label,
  href,
  onClick,
  accent,
  vertical,
}: {
  icon: typeof Phone
  label: string
  href?: string | null
  onClick?: () => void
  accent: string
  vertical: boolean
}) {
  const inner = (
    <>
      <span className={cn('grid h-9 w-9 place-items-center rounded-xl text-white shadow', accent)}>
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-[11px] font-semibold text-slate-700">{label}</span>
    </>
  )
  const cls = cn(
    'flex items-center justify-center gap-1.5',
    vertical
      ? 'w-full rounded-xl border border-slate-200 bg-white/70 py-2.5 hover:bg-white'
      : 'flex-col gap-1',
  )

  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}

function MobileActionBar({ listing }: { listing: ListingDetailData['listing'] }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/50 bg-white/90 backdrop-blur-xl lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Listing actions"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1 px-2 py-2">
        <MobileAction icon={Phone} label="Call" href={listing.phone ? `tel:${listing.phone}` : null} accent="bg-emerald-500" />
        <MobileAction icon={MessageCircle} label="WhatsApp" href={listing.whatsapp ? `https://wa.me/${listing.whatsapp.replace(/\D/g, '')}` : null} accent="bg-green-500" />
        <MobileAction icon={UserPlus} label="Save" onClick={() => downloadVcf(listing)} accent="bg-blue-500" />
        <MobileAction icon={MapPin} label="Map" href={listing.mapEmbed ?? `https://maps.google.com/?q=${encodeURIComponent(listing.address ?? listing.title)}`} accent="bg-amber-500" />
        <MobileAction icon={Share2} label="Share" onClick={shareListing} accent="gradient-brand" />
      </div>
    </nav>
  )
}

function MobileAction({
  icon: Icon,
  label,
  href,
  onClick,
  accent,
}: {
  icon: typeof Phone
  label: string
  href?: string | null
  onClick?: () => void
  accent: string
}) {
  const cls = 'flex flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold text-slate-600'
  const inner = (
    <>
      <span className={cn('grid h-10 w-10 place-items-center rounded-xl text-white shadow', accent)}>
        <Icon className="h-4 w-4" />
      </span>
      {label}
    </>
  )
  if (href) {
    return (
      <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={cls}>
        {inner}
      </a>
    )
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  )
}

/* -------------------------------------------------------------------------- */
/* Save Contact (.vcf) + Share                                                 */
/* -------------------------------------------------------------------------- */

function downloadVcf(listing: ListingDetailData['listing']) {
  const name = listing.title
  const phone = listing.phone ?? ''
  const whatsapp = listing.whatsapp ?? ''
  const email = listing.email ?? ''
  const address = listing.address ?? ''
  const website = listing.website ?? ''

  const vcf = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name}`,
    `TEL;TYPE=CELL:${phone}`,
    whatsapp ? `TEL;TYPE=WHATsApp:${whatsapp}` : '',
    email ? `EMAIL:${email}` : '',
    address ? `ADR:;;${address};;;;` : '',
    website ? `URL:${website}` : '',
    'END:VCARD',
  ]
    .filter(Boolean)
    .join('\r\n')

  const blob = new Blob([vcf], { type: 'text/vcard' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${name.replace(/[^a-z0-9]/gi, '_')}.vcf`
  a.click()
  URL.revokeObjectURL(url)
  toast.success('Contact saved')
}

async function shareListing() {
  const url = window.location.href
  const title = document.title
  if (navigator.share) {
    try {
      await navigator.share({ title, url })
    } catch {
      // user cancelled — no-op
    }
  } else {
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
    } catch {
      toast.error('Share not supported')
    }
  }
}
