'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import {
  Store,
  Wrench,
  Building2,
  Star,
  MapPin,
  Phone,
  MessageCircle,
  Crown,
  Sparkles,
  BadgeCheck,
  Flame,
  Layers,
  ExternalLink,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react'

export interface ListingPreviewData {
  title: string
  phone: string
  whatsapp: string
  type: string
  categoryId: string
  villageId: string
  address: string
  description: string
  coverImage: string
  status: string
  isPremium: boolean
  isFeatured: boolean
}

interface ListingPreviewCardProps {
  formData: ListingPreviewData
  categories: Array<{ id?: string; name: string; slug?: string }>
  villages: Array<{ id?: string; name: string; slug?: string }>
  onSelectCoverPreset?: (url: string) => void
}

const PRESET_COVERS = [
  { label: 'Shop / Retail', url: 'https://images.unsplash.com/photo-1582650625119-3a31f8fa2699?w=600&auto=format&fit=crop&q=80' },
  { label: 'Hardware / Electric', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80' },
  { label: 'Restaurant / Food', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80' },
  { label: 'Medical / Clinic', url: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600&auto=format&fit=crop&q=80' },
  { label: 'Real Estate / Land', url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&auto=format&fit=crop&q=80' },
  { label: 'Service / Auto', url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&auto=format&fit=crop&q=80' },
]

export function ListingPreviewCard({
  formData,
  categories,
  villages,
  onSelectCoverPreset,
}: ListingPreviewCardProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'featured' | 'detail'>('grid')
  const [imgError, setImgError] = useState(false)

  // Find Category and Village labels
  const selectedCategory = categories.find(
    (c) => c.id === formData.categoryId || c.slug === formData.categoryId
  )
  const categoryName = selectedCategory?.name || 'Local Business'

  const selectedVillage = villages.find(
    (v) => v.id === formData.villageId || v.slug === formData.villageId
  )
  const villageName = selectedVillage?.name || 'Choutuppal'

  const displayTitle = formData.title.trim() || 'Your Business Name (మీ వ్యాపారం)'
  const displayAddress = formData.address.trim() || 'Main Road, Choutuppal, Telangana'
  const displayPhone = formData.phone.trim() || '+91 98765 43210'
  const displayCover =
    !imgError && formData.coverImage.trim()
      ? formData.coverImage.trim()
      : PRESET_COVERS[0].url

  const listingType = (formData.type || 'BUSINESS').toUpperCase()

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl border border-slate-800 p-4 text-white shadow-inner">
      {/* Top Bar / Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <h4 className="text-xs font-bold tracking-wide uppercase text-slate-300">
            Instant Live Preview
          </h4>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/50 text-[11px]">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            className={`px-2 py-1 rounded-md font-semibold transition ${
              viewMode === 'grid'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Grid Card
          </button>
          <button
            type="button"
            onClick={() => setViewMode('featured')}
            className={`px-2 py-1 rounded-md font-semibold transition ${
              viewMode === 'featured'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Home Rail
          </button>
          <button
            type="button"
            onClick={() => setViewMode('detail')}
            className={`px-2 py-1 rounded-md font-semibold transition ${
              viewMode === 'detail'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Detail View
          </button>
        </div>
      </div>

      {/* Live Preview Container (Simulates Live Site) */}
      <div className="flex-1 py-4 flex flex-col justify-center items-center">
        {/* Sub-label */}
        <div className="w-full mb-3 flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span>Simulation on choutuppal.in</span>
          <span className="flex items-center gap-1">
            {formData.status === 'APPROVED' ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Approved
              </span>
            ) : formData.status === 'PENDING' ? (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <Clock className="h-3 w-3" /> Pending Review
              </span>
            ) : (
              <span className="text-rose-400 font-bold flex items-center gap-1">
                <XCircle className="h-3 w-3" /> Rejected
              </span>
            )}
          </span>
        </div>

        {/* View Mode 1: Directory & Explore Grid Card */}
        {viewMode === 'grid' && (
          <div className="w-full max-w-[320px] bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200 transition-all duration-300">
            {/* Card Image */}
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
              <Image
                src={displayCover}
                alt={displayTitle}
                fill
                sizes="320px"
                className="object-cover"
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 pointer-events-none" />

              {/* Badges Overlay */}
              <div className="absolute top-2 left-2 flex flex-wrap gap-1 z-10">
                {formData.isPremium && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500 text-white font-bold text-[10px] px-2 py-0.5 shadow-md">
                    <Crown className="h-2.5 w-2.5" /> Premium
                  </span>
                )}
                {formData.isFeatured && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-600 text-white font-bold text-[10px] px-2 py-0.5 shadow-md">
                    <Flame className="h-2.5 w-2.5" /> Featured
                  </span>
                )}
                {listingType === 'SERVICE' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-purple-600 text-white font-bold text-[10px] px-2 py-0.5 shadow-md">
                    <Wrench className="h-2.5 w-2.5" /> Service
                  </span>
                )}
                {listingType === 'REAL_ESTATE' && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 shadow-md">
                    <Building2 className="h-2.5 w-2.5" /> Real Estate
                  </span>
                )}
              </div>
            </div>

            {/* Card Body */}
            <div className="p-3.5 space-y-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                  {displayTitle}
                </h3>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="flex items-center gap-0.5 font-bold text-amber-600">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" /> 4.9
                  </span>
                  <span>·</span>
                  <span className="truncate font-medium text-slate-600">{categoryName}</span>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs text-slate-500 truncate">
                <MapPin className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                <span className="truncate">{villageName}</span>
              </div>

              {formData.description && (
                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                  {formData.description}
                </p>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <a
                  href={`tel:${formData.phone || ''}`}
                  onClick={(e) => e.preventDefault()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-700 py-1.5 text-xs font-bold text-white shadow-xs"
                >
                  <Phone className="h-3 w-3" />
                  <span>Call Now</span>
                </a>
                {formData.whatsapp && (
                  <a
                    href={`https://wa.me/91${formData.whatsapp}`}
                    onClick={(e) => e.preventDefault()}
                    className="inline-flex items-center justify-center rounded-lg bg-emerald-600 p-1.5 text-white shadow-xs"
                    title="WhatsApp"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

        {/* View Mode 2: Home Rail Card */}
        {viewMode === 'featured' && (
          <div className="w-full max-w-[280px] bg-white text-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-200">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
              <Image
                src={displayCover}
                alt={displayTitle}
                fill
                sizes="280px"
                className="object-cover"
                onError={() => setImgError(true)}
              />
              <span className="absolute left-2.5 top-2.5 z-10 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-amber-700 backdrop-blur shadow-xs">
                <BadgeCheck className="h-3 w-3 text-blue-600" />
                Top Rated
              </span>
            </div>

            <div className="p-3">
              <h3 className="truncate font-bold text-slate-900 text-sm">{displayTitle}</h3>
              <div className="mt-1 flex items-center gap-1 text-xs text-amber-500">
                <Star className="h-3.5 w-3.5 fill-amber-400" />
                <span className="font-semibold text-slate-700">4.9</span>
                <span className="text-slate-300">·</span>
                <span className="truncate text-slate-500">{categoryName}</span>
              </div>
              <p className="mt-1.5 flex items-center gap-1 text-xs text-slate-500">
                <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                <span className="truncate">{villageName}</span>
              </p>
            </div>
          </div>
        )}

        {/* View Mode 3: Detail Header Banner */}
        {viewMode === 'detail' && (
          <div className="w-full max-w-[340px] bg-slate-950 text-white rounded-2xl overflow-hidden shadow-2xl border border-slate-700 p-3 space-y-3">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden">
              <Image
                src={displayCover}
                alt={displayTitle}
                fill
                sizes="340px"
                className="object-cover"
                onError={() => setImgError(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 right-2">
                <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">
                  {categoryName} • {villageName}
                </span>
                <h2 className="text-sm font-black text-white truncate">{displayTitle}</h2>
              </div>
            </div>

            <div className="text-xs text-slate-300 space-y-1">
              <p className="flex items-center gap-1 text-[11px] text-slate-400">
                <MapPin className="h-3 w-3 text-blue-400 shrink-0" /> {displayAddress}
              </p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                <span className="text-slate-400">Contact: {displayPhone}</span>
                {formData.whatsapp && (
                  <span className="text-emerald-400 font-semibold">WA: {formData.whatsapp}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Image Presets Selector */}
      {onSelectCoverPreset && (
        <div className="pt-3 border-t border-slate-800">
          <p className="text-[11px] font-semibold text-slate-400 mb-2 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-400" />
            1-Click Sample Cover Images:
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESET_COVERS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setImgError(false)
                  onSelectCoverPreset(preset.url)
                }}
                className={`text-[10px] px-2 py-1 rounded-md text-left truncate font-medium border transition ${
                  formData.coverImage === preset.url
                    ? 'bg-blue-900/60 border-blue-500 text-blue-200'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
