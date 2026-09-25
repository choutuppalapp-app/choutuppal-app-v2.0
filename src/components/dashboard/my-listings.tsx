'use client'
import Image from 'next/image';

import Link from 'next/link'
import { useState } from 'react'
import { Store, Plus, Trash2, Eye, MapPin, BadgeCheck, Clock, XCircle, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ListingQrCodeModal } from '@/components/business/listing-qr-code'
import type { Listing, Category, Village } from '@prisma/client'

type Item = Listing & {
  category: Category | null
  village: Village | null
}

export function MyListings({
  listings,
  onAdd,
  onEdit,
}: {
  listings: Item[]
  onAdd?: () => void
  onEdit?: (item: Item) => void
}) {
  const [items, setItems] = useState<Item[]>(listings)

  async function remove(id: string) {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/listings/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete')
      setItems((prev) => prev.filter((l) => l.id !== id))
      toast.success('Listing deleted')
    } catch {
      toast.error('Failed to delete listing')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Listings</h2>
          <p className="text-sm text-slate-500">{items.length} business/service listings</p>
        </div>
        {onAdd ? (
          <Button onClick={onAdd} size="sm" className="gap-1.5 gradient-brand text-white shadow-sm">
            <Plus className="h-4 w-4" /> Add Listing
          </Button>
        ) : (
          <Link href="/profile/listings/new">
            <Button size="sm" className="gap-1.5 gradient-brand text-white">
              <Plus className="h-4 w-4" /> Add Listing
            </Button>
          </Link>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No listings yet"
          desc="Add your first business or service listing to reach local customers."
          action={
            onAdd ? (
              <Button onClick={onAdd} className="gap-2 gradient-brand text-white shadow-sm">
                <Plus className="h-4 w-4" /> Add Listing
              </Button>
            ) : (
              <Link href="/profile/listings/new">
                <Button className="gap-2 gradient-brand text-white">
                  <Plus className="h-4 w-4" /> Add Listing
                </Button>
              </Link>
            )
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((l) => {
            const waBookingLink = `https://wa.me/919494348175?text=${encodeURIComponent(
              `Hi I want to book ${l.title} in Choutuppal`
            )}`

            return (
              <div key={l.id} className="hover-lift overflow-hidden rounded-2xl glass flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[16/9]">
                    {l.coverImage ? (
                      <Image
                        width={800}
                        height={800}
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        src={l.coverImage}
                        alt={l.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full w-full place-items-center gradient-brand text-3xl font-black text-white">
                        {l.title.charAt(0)}
                      </div>
                    )}
                    <StatusBadge status={l.status} className="absolute left-3 top-3" />
                    {l.isFeatured ? (
                      <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                        <BadgeCheck className="h-3 w-3 text-blue-600" /> Featured
                      </span>
                    ) : null}
                  </div>
                  <div className="p-3.5">
                    <h3 className="truncate font-bold text-slate-900">{l.title}</h3>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">{l.description}</p>
                    <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3 text-blue-500" /> {l.views}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-amber-500" /> {l.village?.name ?? '—'}
                      </span>
                      <span className="text-slate-400">{l.category?.name ?? 'Business'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 pt-0 space-y-2">
                  {/* WhatsApp Booking Link button */}
                  <a
                    href={waBookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                  >
                    <MessageSquare className="h-3.5 w-3.5" />
                    Book on WhatsApp
                  </a>

                  <div className="flex items-center gap-2">
                    <ListingQrCodeModal
                      listingId={l.id}
                      slug={l.slug}
                      title={l.title}
                      categoryName={l.category?.name}
                      villageName={l.village?.name}
                      logoUrl={l.logo}
                      phone={l.phone}
                      whatsapp={l.whatsapp}
                      address={l.address}
                      variant="button"
                      className="flex-1"
                    />
                    {onEdit && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(l)}
                        className="flex-1 gap-1.5 text-xs"
                      >
                        Edit
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => remove(l.id)}
                      className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status, className }: { status: string; className?: string }) {
  const map: Record<string, { label: string; cls: string; icon: typeof Clock }> = {
    APPROVED: { label: 'Approved', cls: 'bg-emerald-500 text-white', icon: BadgeCheck },
    PENDING: { label: 'Pending', cls: 'bg-amber-500 text-white', icon: Clock },
    REJECTED: { label: 'Rejected', cls: 'bg-red-500 text-white', icon: XCircle },
    EXPIRED: { label: 'Expired', cls: 'bg-slate-500 text-white', icon: XCircle },
  }
  const s = map[status] ?? map.PENDING
  const Icon = s.icon
  return (
    <Badge className={`${s.cls} ${className ?? ''} hover:${s.cls}`}>
      <Icon className="mr-1 h-3 w-3" /> {s.label}
    </Badge>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  desc,
  action,
}: {
  icon: typeof Store
  title: string
  desc: string
  action?: React.ReactNode
}) {
  return (
    <div className="rounded-3xl glass p-10 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-brand-soft text-blue-600">
        <Icon className="h-7 w-7" />
      </span>
      <h3 className="mt-3 font-bold text-slate-900">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">{desc}</p>
      {action ? <div className="mt-4 flex justify-center">{action}</div> : null}
    </div>
  )
}
