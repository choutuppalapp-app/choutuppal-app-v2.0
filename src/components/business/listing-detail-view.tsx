'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Phone,
  PhoneCall,
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
  Loader2,
  CheckCircle2,
} from 'lucide-react'
import { cn, formatPhoneNumber } from '@/lib/utils'
import { getLogoUrl, getCoverUrl, getBusinessHours, getVillage, getServices } from '@/lib/listing-utils'
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
  const router = useRouter()
  const [claiming, setClaiming] = useState(false)

  async function handleClaim() {
    setClaiming(true)
    try {
      const res = await fetch('/api/listings/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId: listing.id }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed to claim business')
      toast.success(j.message || 'Business claimed successfully!')
      router.push('/dashboard?tab=listings')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to claim business')
    } finally {
      setClaiming(false)
    }
  }

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

  // Business Hours calculation
  const dayKeys = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1
  const todayKey = dayKeys[todayIndex]
  const todayHours = hours ? hours[todayKey] : null

  let isOpenNow = false
  if (todayHours?.open && todayHours?.close) {
    const now = new Date()
    const currentMin = now.getHours() * 60 + now.getMinutes()
    const [openH, openM] = todayHours.open.split(':').map(Number)
    const [closeH, closeM] = todayHours.close.split(':').map(Number)
    const openMin = openH * 60 + openM
    const closeMin = closeH * 60 + closeM
    isOpenNow = currentMin >= openMin && currentMin <= closeMin
  }

  const avgRatingDisplay = ((listing as any).avgRating ?? 4.5).toFixed(1)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-28 md:pb-12">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-3 sm:px-4">
          <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:bg-slate-50">
            <ChevronLeft className="h-4 w-4 text-slate-700" />
          </Link>
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-base font-black text-white shadow-md">
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

      {/* Main Container */}
      <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 lg:px-6">
        
        {/* 1. Header Section: Cover + Overlapping Logo + Info */}
        <div className="mb-6 overflow-hidden rounded-3xl glass">
          <div className="relative">
            {/* Cover Image (16:9 aspect ratio) */}
            <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-100">
              <img loading="lazy" decoding="async"
                src={getCoverUrl(listing)}
                alt={`${listing.title} cover`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              
              {/* Title Overlay */}
              <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 flex flex-col sm:flex-row sm:items-end gap-4">
                {/* Logo (1:1 aspect ratio) */}
                <div className="hidden sm:block h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-2xl border-4 border-white/20 bg-white shadow-2xl relative z-10">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={getLogoUrl(listing)}
                    alt={listing.title}
                    className="h-full w-full object-cover"
                  />
                </div>

                {/* Business Title, Category, Rating & Hours */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 sm:hidden mb-2">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border-2 border-white/20 bg-white shadow-lg">
                      <img
                        loading="lazy"
                        decoding="async"
                        src={getLogoUrl(listing)}
                        alt={listing.title}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-white leading-tight line-clamp-2">
                      {listing.title}
                    </h1>
                  </div>

                  <h1 className="hidden sm:block text-3xl font-black tracking-tight text-white sm:text-4xl drop-shadow-md mb-2">
                    {listing.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-2">
                    {listing.category ? (
                      <Badge className="bg-blue-600/90 text-white hover:bg-blue-600 border-none shadow-sm backdrop-blur-md">
                        {listing.category.name}
                      </Badge>
                    ) : null}
                    {listing.isFeatured ? (
                      <span className="flex items-center gap-1 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-bold text-amber-900 shadow-sm">
                        <BadgeCheck className="h-3.5 w-3.5" /> Featured
                      </span>
                    ) : null}
                    <div className="flex items-center gap-1 rounded-full bg-black/40 border border-white/20 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md shadow-sm">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span>{avgRatingDisplay} ⭐</span>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-black/40 border border-white/20 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md shadow-sm">
                      <Clock className="h-3.5 w-3.5 text-blue-200" />
                      <span>{getBusinessHours(listing)}</span>
                      <span className="ml-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold bg-green-500 text-white">
                        Open
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Claim Listing Banner */}
            <div className="px-5 pb-5">
              {!isOwner ? (
                <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50/90 px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2.5">
                    <BadgeCheck className="h-5 w-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-900">మీదే ఈ బిజినెస్ అయితే క్లెయిమ్ చేయండి</p>
                      <p className="text-[11px] text-amber-700">Is this your business? Claim ownership to update details.</p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={handleClaim}
                    disabled={claiming}
                    className="w-full sm:w-auto shrink-0 gap-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow"
                  >
                    {claiming ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Claim Business
                  </Button>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* 2 & 3. Desktop 2-Column (w-full md:w-2/3 and w-full md:w-1/3) & Mobile Single Column Stack */}
        <div className="flex flex-col md:flex-row gap-6">
          
          {/* Left Column (w-full md:w-2/3) */}
          <div className="w-full md:w-2/3 space-y-6">
            
            {/* Quick Info Tiles */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <InfoTile icon={Star} label="Rating" value={`${avgRatingDisplay} / 5`} accent="amber" />
              <InfoTile icon={Eye} label="Total Views" value={listing.views.toString()} accent="blue" />
              <InfoTile icon={Clock} label="Business Hours" value={getBusinessHours(listing)} accent="green" />
              <InfoTile icon={MapPin} label="Location" value={getVillage(listing)} accent="blue" />
            </div>

            {/* About Section */}
            <section className="rounded-3xl glass p-5">
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-slate-700">
                About Business
              </h2>
              <div
                className="prose prose-sm max-w-none text-slate-700 leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: listing.description.replace(/\n/g, '<br/>'),
                }}
              />
            </section>

            {/* Services Catalog (Clean cards layout) */}
            {services.length > 0 ? (
              <section className="rounded-3xl glass p-5">
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
                  Services Catalog
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {services.map((s, i) => {
                    const priceText = s.price ? s.price : 'వివరాలు అడగండి';
                    const waLink = `https://wa.me/919494348175?text=${encodeURIComponent("నమస్కారం, మీ " + listing.title + " లో " + s.name + " సర్వీస్ కావాలి. ధర: " + priceText + ". దయచేసి సమాచారం ఇవ్వండి.")}`;
                    
                    return (
                      <div key={i} className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm border border-slate-100 flex flex-col justify-between h-full">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{s.name}</h3>
                          {s.description ? (
                            <p className="mt-1 text-sm text-slate-500">{s.description}</p>
                          ) : null}
                          {s.price ? (
                            <div className="mt-3 text-xl font-extrabold text-green-600">
                              {s.price}
                            </div>
                          ) : null}
                        </div>
                        <div className="mt-4 flex justify-end">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-[#25D366] hover:bg-[#20bd5a] text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition"
                          >
                            <MessageCircle className="h-4 w-4" />
                            Product Enquiry
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {/* Customer to Business Owner Direct WhatsApp Button */}
            {(() => {
              const rawNum = (listing.whatsapp || listing.phone || '919494348175').replace(/\D/g, '')
              const cleanNum = rawNum.length >= 10 ? (rawNum.startsWith('91') ? rawNum : '91' + rawNum) : '919494348175'
              const textMsg = encodeURIComponent(`నమస్కారం ${listing.title}, మీ బిజినెస్ ను చౌటుప్పల్ యాప్ లో చూశాను. వివరాలు తెలుసుకోవాలనుకుంటున్నాను.`)
              const linkUrl = `https://wa.me/${cleanNum}?text=${textMsg}`
              return (
                <div className="flex justify-center">
                  <a
                    href={linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-yellow-500 px-5 py-3.5 text-sm font-bold text-white shadow-md transition active:scale-[0.98]"
                  >
                    <MessageCircle className="h-5 w-5 shrink-0 text-white" />
                    <span>WhatsApp లో వివరాలు అడగండి</span>
                  </a>
                </div>
              )
            })()}

            {/* Gallery Section */}
            {gallery.length > 0 ? (
              <section className="rounded-3xl glass p-5">
                <h2 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
                  <ImageIcon className="h-4 w-4 text-blue-600" /> Gallery
                </h2>
                <div className="no-scrollbar -mx-2 flex gap-3 overflow-x-auto px-2 pb-2">
                  {gallery.map((url, i) => (
                    <a
                      key={i}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative h-40 w-40 shrink-0 overflow-hidden rounded-2xl border border-white/50 bg-white/30 shadow-sm sm:h-44 sm:w-44"
                    >
                      <img loading="lazy" decoding="async"
                        src={url}
                        alt={`${listing.title} gallery image ${i + 1}`}
                        className="h-full w-full object-cover transition hover:scale-105"
                      />
                    </a>
                  ))}
                </div>
              </section>
            ) : null}

            {/* Address & Business Hours Detail */}
            <section className="grid gap-3 sm:grid-cols-2">
              {listing.address ? (
                <div className="rounded-3xl glass p-5">
                  <h3 className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                    <MapPin className="h-3.5 w-3.5 text-blue-600" /> Address
                  </h3>
                  <p className="text-sm text-slate-700">{listing.address}</p>
                  {listing.mapEmbed ? (
                    <a
                      href={listing.mapEmbed}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline"
                    >
                      Open in Google Maps <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : null}
                </div>
              ) : null}
              {listing.businessHours ? (
                <div className="rounded-3xl glass p-5">
                  <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-600">
                    <Clock className="h-3.5 w-3.5 text-amber-600" /> Business Hours
                  </h3>
                  {typeof listing.businessHours === 'string' || (listing.businessHours as any)?.raw ? (
                    <div className="flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-blue-50 to-amber-50 border border-blue-100 p-3.5 shadow-sm">
                      <Clock className="h-4 w-4 text-blue-600 shrink-0" />
                      <span className="text-xs font-bold text-slate-800">
                        {typeof listing.businessHours === 'string' ? listing.businessHours : (listing.businessHours as any)?.raw}
                      </span>
                    </div>
                  ) : hours ? (
                    <ul className="space-y-1 text-xs text-slate-700">
                      {dayKeys.map((d) => {
                        const h = hours[d]
                        return (
                          <li key={d} className="flex justify-between capitalize">
                            <span className="font-medium text-slate-500">{d}</span>
                            <span className="font-semibold text-slate-800">
                              {h && h.open && h.close ? `${h.open} – ${h.close}` : 'Closed'}
                            </span>
                          </li>
                        )
                      })}
                    </ul>
                  ) : null}
                </div>
              ) : null}
            </section>

            {/* Owner Social Media Links */}
            {((listing.owner as any).facebookUrl || (listing.owner as any).instagramUrl || (listing.owner as any).youtubeUrl || (listing.owner as any).twitterUrl) ? (
              <section className="rounded-3xl glass p-5">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-600">
                  Connect with Business Owner
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(listing.owner as any).facebookUrl ? (
                    <a href={(listing.owner as any).facebookUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100">
                      Facebook
                    </a>
                  ) : null}
                  {(listing.owner as any).instagramUrl ? (
                    <a href={(listing.owner as any).instagramUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-pink-200 bg-pink-50 px-3.5 py-1.5 text-xs font-bold text-pink-600 transition hover:bg-pink-100">
                      Instagram
                    </a>
                  ) : null}
                  {(listing.owner as any).youtubeUrl ? (
                    <a href={(listing.owner as any).youtubeUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-bold text-red-600 transition hover:bg-red-100">
                      YouTube
                    </a>
                  ) : null}
                  {(listing.owner as any).twitterUrl ? (
                    <a href={(listing.owner as any).twitterUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-200">
                      X / Twitter
                    </a>
                  ) : null}
                </div>
              </section>
            ) : null}

            {/* Ratings & Reviews */}
            <ListingReviewSection listingId={listing.id} initialAvgRating={(listing as any).avgRating ?? 4.5} />
          </div>

          {/* Right Column Desktop View (w-full md:w-1/3 sticky top-24 h-fit) */}
          <aside className="w-full md:w-1/3 hidden md:block">
            <div className="sticky top-24 h-fit rounded-3xl border border-white/30 bg-white/30 p-6 shadow-xl backdrop-blur-xl">
              <h3 className="mb-4 text-center text-sm font-black uppercase tracking-wider text-slate-800">
                GET IN TOUCH
              </h3>
              
              {/* Vertical Stacked Buttons */}
              <div className="flex flex-col gap-3">
                {/* 1. Call (Primary) */}
                <DesktopActionButton
                  icon={Phone} label={listing.secondaryPhone ? `Call 1 (${formatPhoneNumber(listing.phone)})` : "Call Now"} color="bg-emerald-500 hover:bg-emerald-600"
                  href={listing.phone ? `tel:${listing.phone}` : null}
                  onClick={() => !listing.phone && toast.error('No phone number provided')}
                />

                {/* 1b. Call (Secondary) */}
                {listing.secondaryPhone ? (
                  <DesktopActionButton
                    icon={PhoneCall} label={`Call 2 (${formatPhoneNumber(listing.secondaryPhone)})`} color="bg-teal-600 hover:bg-teal-700"
                    href={`tel:${listing.secondaryPhone}`}
                  />
                ) : null}
                
                {/* 2. WhatsApp */}
                <DesktopActionButton
                  icon={MessageCircle} label="WhatsApp" color="bg-green-600 hover:bg-green-700"
                  href={listing.whatsapp ? `https://wa.me/${listing.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`నమస్కారం ${listing.title}, ఈ బిజినెస్ గురించి సమాచారం కావాలి.`)}` : `https://wa.me/919494348175?text=${encodeURIComponent("నమస్కారం, ఈ బిజినెస్ గురించి సమాచారం కావాలి.")}`}
                />
                
                {/* 3. Share */}
                <button
                  onClick={() => shareListing(listing)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-yellow-500 py-3 text-sm font-bold text-white shadow transition hover:opacity-95 active:scale-[0.98]"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </button>
                
                {/* 4. Save Contact */}
                <DesktopActionButton
                  icon={UserPlus} label="Save Contact" color="bg-slate-700 hover:bg-slate-800"
                  onClick={() => downloadVcf(listing)}
                />
                
                {/* 5. Location */}
                <DesktopActionButton
                  icon={MapPin} label="Location" color="bg-amber-500 hover:bg-amber-600"
                  href={listing.mapEmbed ?? `https://maps.google.com/?q=${encodeURIComponent(listing.address ?? listing.title)}`}
                />
              </div>

              {/* Owner Info badge */}
              {listing.owner?.name ? (
                <div className="mt-5 rounded-2xl bg-white/50 p-3 text-center text-xs text-slate-500">
                  <p className="font-bold text-slate-800">{listing.owner.name}</p>
                  <p className="mt-0.5 text-[11px]">Responds promptly to inquiries</p>
                </div>
              ) : null}
            </div>
          </aside>

        </div>
      </div>

      {/* Related Listings — "ఇంకా ఇవి కూడా చూడండి" */}
      {related.length > 0 ? (
        <section className="mx-auto max-w-6xl px-3 mt-8 sm:px-4 lg:px-6">
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
                    <img loading="lazy" decoding="async" src={(r.coverImage || r.logo)!} alt={r.title} className="h-full w-full object-cover transition group-hover:scale-105" />
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

      {/* 3. Mobile View Sticky Bottom Bar (5 Buttons: Call, WhatsApp, Share FAB, Save, Location) */}
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
        onClick={() => shareListing(listing)}
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
  const mapLink = listing.mapEmbed ?? `https://maps.google.com/?q=${encodeURIComponent(listing.address ?? listing.title)}`
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white/95 backdrop-blur-md p-2 py-2.5 shadow-[0_-4px_16px_rgba(0,0,0,0.12)] border-t border-slate-100 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Listing actions"
    >
      {/* Call */}
      <MobileAction icon={Phone} label="Call" href={listing.phone ? `tel:${listing.phone}` : null} />
      {/* WhatsApp */}
      <MobileAction icon={MessageCircle} label="WhatsApp" href={listing.whatsapp ? `https://wa.me/${listing.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`నమస్కారం ${listing.title}, ఈ బిజినెస్ గురించి సమాచారం కావాలి.`)}` : `https://wa.me/919494348175?text=${encodeURIComponent("నమస్కారం, ఈ బిజినెస్ గురించి సమాచారం కావాలి.")}`} />
      {/* Share — Center FAB */}
      <div className="flex items-center justify-center">
        <button
          onClick={() => shareListing(listing)}
          aria-label="Share"
          className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-yellow-500 text-white shadow-lg transition active:scale-95"
        >
          <Share2 className="h-6 w-6" />
        </button>
      </div>
      {/* Save Contact */}
      <MobileAction icon={UserPlus} label="Save" onClick={() => downloadVcf(listing)} />
      {/* Location */}
      <MobileAction icon={MapPin} label="Location" href={mapLink} />
    </nav>
  )
}

function MobileAction({
  icon: Icon,
  label,
  href,
  onClick,
}: {
  icon: typeof Phone
  label: string
  href?: string | null
  onClick?: () => void
}) {
  const cls = 'flex flex-col items-center justify-center gap-1 text-slate-600'
  const inner = (
    <>
      <Icon className="h-6 w-6" />
      <span className="text-[10px] font-medium">{label}</span>
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

function DesktopActionButton({
  icon: Icon,
  label,
  color,
  href,
  onClick,
}: {
  icon: typeof Phone
  label: string
  color: string
  href?: string | null
  onClick?: () => void
}) {
  const cls = cn('flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition', color)
  const inner = (
    <>
      <Icon className="h-4 w-4" />
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
  const secondaryPhone = listing.secondaryPhone ?? ''
  const whatsapp = listing.whatsapp ?? ''
  const email = listing.email ?? ''
  const address = listing.address ?? ''
  const website = listing.website ?? ''

  const vcf = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name}`,
    `TEL;TYPE=CELL,PREF:${phone}`,
    secondaryPhone ? `TEL;TYPE=CELL,ALT:${secondaryPhone}` : '',
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

async function shareListing(listing: ListingDetailData['listing']) {
  const url = window.location.href
  const shareTitle = `చౌటుప్పల్ యాప్ - ${listing.title}`
  const shareText = `${listing.title} - ${listing.address ?? ''}. చౌటుప్పల్ యాప్ లో చూడండి!`
  if (navigator.share) {
    try {
      await navigator.share({ title: shareTitle, text: shareText, url })
    } catch {
      // user cancelled — no-op
    }
  } else {
    // Fallback to WhatsApp
    window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareText + ' ' + url)}`, '_blank')
  }
}

/* -------------------------------------------------------------------------- */
/* Star Rating & Review Component                                              */
/* -------------------------------------------------------------------------- */

function ListingReviewSection({
  listingId,
  initialAvgRating,
}: {
  listingId: string
  initialAvgRating: number
}) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [avgRating, setAvgRating] = useState(initialAvgRating)
  const [reviews, setReviews] = useState<Array<{ id: string; rating: number; comment: string | null; createdAt: string; user: { name: string | null; username: string | null } }>>([])

  useEffect(() => {
    fetch(`/api/listings/${listingId}/reviews`)
      .then((r) => r.json())
      .then((j) => {
        if (j.ok && Array.isArray(j.reviews)) setReviews(j.reviews)
      })
      .catch(() => {})
  }, [listingId])

  async function submitReview(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const res = await fetch(`/api/listings/${listingId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, comment }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to submit review')
      toast.success('Thank you for rating!')
      if (json.avgRating) setAvgRating(json.avgRating)
      setComment('')
      // Refresh reviews list
      const fresh = await fetch(`/api/listings/${listingId}/reviews`).then((r) => r.json())
      if (fresh.ok && Array.isArray(fresh.reviews)) setReviews(fresh.reviews)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Please log in to submit a rating')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="rounded-3xl glass p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
          Ratings & Reviews
        </h2>
        <div className="flex items-center gap-1 font-bold text-amber-600">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span>{avgRating.toFixed(1)} / 5</span>
        </div>
      </div>

      {/* Rating Form */}
      <form onSubmit={submitReview} className="mt-4 rounded-2xl bg-white/60 p-4 space-y-3">
        <p className="text-xs font-semibold text-slate-700">Rate this business:</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="p-1 transition hover:scale-110"
            >
              <Star
                className={`h-6 w-6 ${
                  star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-xs font-bold text-slate-600">{rating} Star{rating > 1 ? 's' : ''}</span>
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Write your review or experience (optional)…"
          rows={2}
          className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-amber-500 px-4 py-2 text-xs font-bold text-white shadow transition active:scale-95 disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit Review'}
        </button>
      </form>

      {/* Existing Reviews */}
      {reviews.length > 0 ? (
        <div className="mt-4 space-y-3">
          {reviews.map((rev) => (
            <div key={rev.id} className="rounded-xl border border-slate-100 bg-white/40 p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  {rev.user.name ?? rev.user.username ?? 'Anonymous User'}
                </span>
                <div className="flex items-center gap-0.5 text-xs font-bold text-amber-500">
                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                  <span>{rev.rating}</span>
                </div>
              </div>
              {rev.comment ? (
                <p className="mt-1 text-xs text-slate-600">{rev.comment}</p>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
