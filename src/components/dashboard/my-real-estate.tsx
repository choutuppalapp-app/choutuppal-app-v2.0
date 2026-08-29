'use client'
import Image from 'next/image';

import { useState } from 'react'
import { Home, Plus, Trash2, MapPin, IndianRupee, BedDouble, Maximize } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { EmptyState } from './my-listings'
import type { RealEstate, Village } from '@prisma/client'

type Item = RealEstate & { village: Village | null }

function formatPrice(price: number, listingType: string) {
  const f = new Intl.NumberFormat('en-IN').format(price)
  return listingType === 'RENT' ? `₹${f}/mo` : `₹${f}`
}

export function MyRealEstate({
  realEstates,
  onAdd,
  onEdit,
}: {
  realEstates: Item[]
  onAdd: () => void
  onEdit: (item: Item) => void
}) {
  const [items, setItems] = useState<Item[]>(realEstates)

  async function remove(id: string) {
    if (!confirm('Delete this property?')) return
    try {
      const res = await fetch(`/api/real-estate/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      setItems((p) => p.filter((r) => r.id !== id))
      toast.success('Property deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">My Real Estate</h2>
          <p className="text-sm text-slate-500">{items.length} property listings</p>
        </div>
        <Button onClick={onAdd} size="sm" className="gap-1.5 gradient-brand text-white">
          <Plus className="h-4 w-4" /> Add
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={Home}
          title="No properties yet"
          desc="List a plot, house, apartment or commercial space for sale or rent."
          action={<Button onClick={onAdd} className="gap-2 gradient-brand text-white"><Plus className="h-4 w-4" /> Add Property</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {items.map((p) => (
            <div key={p.id} className="hover-lift overflow-hidden rounded-2xl glass">
              <div className="relative aspect-[16/10]">
                {p.coverImage ? (
                   
                  <Image width={800} height={800} loading="lazy" decoding="async" src={p.coverImage} alt={p.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-blue-500 to-amber-400" />
                )}
                <Badge
                  className={`absolute left-3 top-3 ${
                    p.listingType === 'SALE' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
                  }`}
                >
                  For {p.listingType === 'SALE' ? 'Sale' : 'Rent'}
                </Badge>
                <span className="absolute bottom-3 right-3 rounded-lg bg-white/90 px-2 py-1 text-[10px] font-bold uppercase text-blue-700">
                  {p.type}
                </span>
              </div>
              <div className="p-3.5">
                <h3 className="truncate font-bold text-slate-900">{p.title}</h3>
                <div className="mt-1 flex items-baseline gap-1 text-blue-700">
                  <IndianRupee className="h-4 w-4" />
                  <span className="text-lg font-black">
                    {formatPrice(p.price, p.listingType).replace('₹', '')}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-[11px] text-slate-500">
                  {p.bedrooms ? (
                    <span className="flex items-center gap-1"><BedDouble className="h-3 w-3" /> {p.bedrooms} BHK</span>
                  ) : null}
                  {p.areaSqft ? (
                    <span className="flex items-center gap-1"><Maximize className="h-3 w-3" /> {p.areaSqft} sqft</span>
                  ) : null}
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {p.village?.name ?? '—'}</span>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" onClick={() => onEdit(p)} variant="outline" className="flex-1 text-xs">Edit</Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => remove(p.id)}
                    className="gap-1.5 border-red-200 text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
