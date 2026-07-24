'use client'

import { useState } from 'react'
import { Loader2, Plus, Trash2, Save, Building2, Wrench, Home, Star } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ImageUpload, GalleryUpload } from './image-upload'
import type { Village, Category } from '@prisma/client'

type ListingType = 'business' | 'service' | 'realestate'

interface ServiceItem {
  name: string
  price: string
  description: string
}

interface AddListingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  villages: Pick<Village, 'id' | 'name' | 'slug'>[]
  categories: Pick<Category, 'id' | 'name' | 'slug'>[]
}

export function AddListingModal({
  open,
  onOpenChange,
  villages,
  categories,
}: AddListingModalProps) {
  const [type, setType] = useState<ListingType>('business')
  const [saving, setSaving] = useState(false)

  // shared
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [address, setAddress] = useState('')
  const [mapLink, setMapLink] = useState('')
  const [villageId, setVillageId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [rating, setRating] = useState('')
  const [logo, setLogo] = useState<string | null>(null)
  const [cover, setCover] = useState<string | null>(null)
  const [gallery, setGallery] = useState<string[]>([])

  // real estate
  const [reType, setReType] = useState('HOUSE')
  const [listingType, setListingType] = useState('SALE')
  const [price, setPrice] = useState('')
  const [areaSqft, setAreaSqft] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [negotiable, setNegotiable] = useState(false)

  // services catalog
  const [services, setServices] = useState<ServiceItem[]>([
    { name: '', price: '', description: '' },
  ])

  function reset() {
    setTitle(''); setDescription(''); setPhone(''); setWhatsapp(''); setAddress('')
    setMapLink(''); setVillageId(''); setCategoryId(''); setRating('')
    setLogo(null); setCover(null); setGallery([])
    setReType('HOUSE'); setListingType('SALE'); setPrice(''); setAreaSqft('')
    setBedrooms(''); setBathrooms(''); setNegotiable(false)
    setServices([{ name: '', price: '', description: '' }])
    setType('business')
  }

  async function submit() {
    if (!title.trim() || !description.trim()) {
      toast.error('Name and About are required')
      return
    }
    setSaving(true)
    try {
      if (type === 'realestate') {
        if (!price || !address) {
          toast.error('Price and Address are required for real estate')
          setSaving(false)
          return
        }
        const res = await fetch('/api/real-estate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            type: reType,
            listingType,
            price: Number(price),
            negotiable,
            areaSqft: areaSqft ? Number(areaSqft) : undefined,
            bedrooms: bedrooms ? Number(bedrooms) : undefined,
            bathrooms: bathrooms ? Number(bathrooms) : undefined,
            coverImage: cover,
            images: gallery.length ? gallery : undefined,
            address,
            mapEmbed: mapLink,
            contactPhone: phone,
            contactWhatsapp: whatsapp,
            villageId: villageId || undefined,
          }),
        })
        const json = await res.json()
        if (!res.ok || !json.ok) throw new Error(json.error || 'Failed')
        toast.success('Property submitted for approval!')
        onOpenChange(false)
        reset()
      } else {
        // business or service → listing
        const cleanServices = services
          .filter((s) => s.name.trim())
          .map((s) => ({ name: s.name, price: s.price || undefined, description: s.description || undefined }))
        const res = await fetch('/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            coverImage: cover,
            logo,
            gallery: gallery.length ? gallery : undefined,
            phone,
            whatsapp,
            address,
            mapEmbed: mapLink,
            servicesCatalog: cleanServices.length ? cleanServices : undefined,
            categoryId: categoryId || undefined,
            villageId: villageId || undefined,
          }),
        })
        const json = await res.json()
        if (!res.ok || !json.ok) throw new Error(json.error || 'Failed')
        toast.success(`${type === 'business' ? 'Business' : 'Service'} submitted for approval!`)
        onOpenChange(false)
        reset()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Submission failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-3xl p-0 fancy-scroll">
        <DialogHeader className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
          <DialogTitle className="text-lg font-black text-slate-900">
            Add New Listing
          </DialogTitle>
          <DialogDescription className="text-xs">
            List a business, service or property. Images are compressed to ~500KB before upload.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 px-6 py-5">
          {/* Type selector */}
          <div>
            <Label className="mb-2 block text-xs font-semibold text-slate-600">Category Type</Label>
            <Tabs value={type} onValueChange={(v) => setType(v as ListingType)}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="business" className="gap-1.5 text-xs">
                  <Building2 className="h-3.5 w-3.5" /> Business
                </TabsTrigger>
                <TabsTrigger value="service" className="gap-1.5 text-xs">
                  <Wrench className="h-3.5 w-3.5" /> Service
                </TabsTrigger>
                <TabsTrigger value="realestate" className="gap-1.5 text-xs">
                  <Home className="h-3.5 w-3.5" /> Real Estate
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Media uploads */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <ImageUpload value={logo} onChange={setLogo} folder="logos" aspect="square" label="Logo (1:1)" />
            <ImageUpload value={cover} onChange={setCover} folder="covers" aspect="video" label="Cover (16:9)" className="col-span-1 sm:col-span-3" />
          </div>
          <GalleryUpload value={gallery} onChange={setGallery} folder="gallery" max={5} label="Gallery (max 5, 1:1)" />

          {/* Basic fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={`${type === 'realestate' ? 'Property' : 'Business'} Name *`}>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sri Lakshmi Tiffin Center" />
            </Field>
            {type !== 'realestate' ? (
              <Field label="Category">
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ) : (
              <Field label="Property Type">
                <Select value={reType} onValueChange={setReType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PLOT">Plot</SelectItem>
                    <SelectItem value="HOUSE">House</SelectItem>
                    <SelectItem value="APARTMENT">Apartment</SelectItem>
                    <SelectItem value="COMMERCIAL">Commercial</SelectItem>
                    <SelectItem value="FARM">Farm Land</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
            <Field label="Phone">
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9441348175" />
            </Field>
            <Field label="WhatsApp">
              <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="919441348175" />
            </Field>
            <Field label="Village">
              <Select value={villageId} onValueChange={setVillageId}>
                <SelectTrigger><SelectValue placeholder="Select village" /></SelectTrigger>
                <SelectContent>
                  {villages.map((v) => (
                    <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Address *">
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Main Road, Choutuppal" />
            </Field>
            <Field label="Google Map Link">
              <Input value={mapLink} onChange={(e) => setMapLink(e.target.value)} placeholder="https://maps.google.com/…" />
            </Field>
            {type !== 'realestate' ? (
              <Field label="Rating (out of 5)">
                <div className="relative">
                  <Star className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 fill-amber-400 text-amber-400" />
                  <Input value={rating} onChange={(e) => setRating(e.target.value)} placeholder="4.5" className="pl-8" inputMode="decimal" />
                </div>
              </Field>
            ) : null}
          </div>

          <Field label="About / Description *">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your business / property…" rows={3} />
          </Field>

          {/* Dynamic: Real Estate fields */}
          {type === 'realestate' ? (
            <div className="space-y-3 rounded-2xl gradient-brand-soft p-4">
              <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700">
                <Home className="h-4 w-4 text-blue-600" /> Property Details
              </h4>
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label="Listing Type">
                  <Select value={listingType} onValueChange={setListingType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SALE">Sale</SelectItem>
                      <SelectItem value="RENT">Rent</SelectItem>
                      <SelectItem value="LEASE">Lease</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Price (₹) *">
                  <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="4500000" inputMode="numeric" />
                </Field>
                <Field label="Area (sqft)">
                  <Input value={areaSqft} onChange={(e) => setAreaSqft(e.target.value)} placeholder="1450" inputMode="numeric" />
                </Field>
                <Field label="Bedrooms (BHK)">
                  <Input value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="3" inputMode="numeric" />
                </Field>
                <Field label="Bathrooms">
                  <Input value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="2" inputMode="numeric" />
                </Field>
                <Field label="Negotiable">
                  <div className="flex h-9 items-center gap-2">
                    <input type="checkbox" id="neg" checked={negotiable} onChange={(e) => setNegotiable(e.target.checked)} className="h-4 w-4 accent-blue-600" />
                    <label htmlFor="neg" className="text-sm text-slate-600">Price negotiable</label>
                  </div>
                </Field>
              </div>
            </div>
          ) : null}

          {/* Dynamic: Services catalog */}
          {type !== 'realestate' ? (
            <div className="space-y-3 rounded-2xl gradient-brand-soft p-4">
              <div className="flex items-center justify-between">
                <h4 className="flex items-center gap-2 text-sm font-bold text-slate-700">
                  <Wrench className="h-4 w-4 text-amber-600" /> Services Catalog
                </h4>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs"
                  onClick={() => setServices((s) => [...s, { name: '', price: '', description: '' }])}
                >
                  <Plus className="h-3 w-3" /> Add Service
                </Button>
              </div>
              <div className="space-y-2">
                {services.map((s, i) => (
                  <div key={i} className="grid gap-2 sm:grid-cols-[1fr_100px_28px]">
                    <Input
                      value={s.name}
                      onChange={(e) => setServices((arr) => arr.map((x, idx) => idx === i ? { ...x, name: e.target.value } : x))}
                      placeholder="Service name (e.g. Idli Sambar)"
                    />
                    <Input
                      value={s.price}
                      onChange={(e) => setServices((arr) => arr.map((x, idx) => idx === i ? { ...x, price: e.target.value } : x))}
                      placeholder="₹ price"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                      onClick={() => setServices((arr) => arr.filter((_, idx) => idx !== i))}
                      disabled={services.length === 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer actions */}
        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={saving} className="gap-2 gradient-brand text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Submit for Approval
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  label,
  children,
  className,
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</Label>
      {children}
    </div>
  )
}
