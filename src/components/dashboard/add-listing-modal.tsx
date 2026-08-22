'use client'

import { useState, useEffect } from 'react'
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
  defaultType?: ListingType
  editingItem?: any
  onSuccess?: () => void
}

export function AddListingModal({
  open,
  onOpenChange,
  villages,
  categories,
  defaultType,
  editingItem,
  onSuccess,
}: AddListingModalProps) {
  const [type, setType] = useState<ListingType>(defaultType ?? 'business')
  const [saving, setSaving] = useState(false)

  const [localVillages, setLocalVillages] = useState(villages || [])
  const [localCategories, setLocalCategories] = useState(categories || [])

  useEffect(() => {
    if (villages && villages.length > 0) {
      setLocalVillages(villages)
    } else {
      fetch('/api/villages')
        .then((r) => r.json())
        .then((j) => {
          const list = j.villages || j.data || (Array.isArray(j) ? j : [])
          if (Array.isArray(list) && list.length > 0) setLocalVillages(list)
        })
        .catch(() => {})
    }
  }, [villages])

  useEffect(() => {
    if (categories && categories.length > 0) {
      setLocalCategories(categories)
    } else {
      fetch('/api/categories')
        .then((r) => r.json())
        .then((j) => {
          const list = j.categories || j.data || (Array.isArray(j) ? j : [])
          if (Array.isArray(list) && list.length > 0) setLocalCategories(list)
        })
        .catch(() => {})
    }
  }, [categories])

  // shared
  // shared
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [secondaryPhone, setSecondaryPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [address, setAddress] = useState('')
  const [mapLink, setMapLink] = useState('')
  const [businessHours, setBusinessHours] = useState('')
  const [hoursOpenStatus, setHoursOpenStatus] = useState<'OPEN' | 'CLOSED'>('OPEN')
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

  // Reset type when open or defaultType/editingItem changes
  useEffect(() => {
    if (open) {
      if (editingItem) {
        setTitle(editingItem.title ?? '')
        setDescription(editingItem.description ?? '')
        setPhone(editingItem.phone ?? editingItem.contactPhone ?? '')
        setSecondaryPhone(editingItem.secondaryPhone ?? '')
        setWhatsapp(editingItem.whatsapp ?? editingItem.contactWhatsapp ?? '')
        setAddress(editingItem.address ?? '')
        setMapLink(editingItem.mapEmbed ?? '')
        setVillageId(editingItem.villageId ?? '')
        
        if ('listingType' in editingItem || 'contactPhone' in editingItem || editingItem.type === 'PLOT' || editingItem.type === 'HOUSE') {
          setType('realestate')
          setReType(editingItem.type ?? 'HOUSE')
          setListingType(editingItem.listingType ?? 'SALE')
          setPrice(editingItem.price ? String(editingItem.price) : '')
          setAreaSqft(editingItem.areaSqft ? String(editingItem.areaSqft) : '')
          setBedrooms(editingItem.bedrooms ? String(editingItem.bedrooms) : '')
          setBathrooms(editingItem.bathrooms ? String(editingItem.bathrooms) : '')
          setNegotiable(editingItem.negotiable ?? false)
          setCover(editingItem.coverImage ?? null)
          setGallery(Array.isArray(editingItem.images) ? editingItem.images : [])
        } else {
          setType(editingItem.categoryId ? 'business' : 'service')
          setCategoryId(editingItem.categoryId ?? '')
          setLogo(editingItem.logo ?? null)
          setCover(editingItem.coverImage ?? null)
          setGallery(Array.isArray(editingItem.gallery) ? editingItem.gallery : [])
          setServices(Array.isArray(editingItem.servicesCatalog) ? editingItem.servicesCatalog : [{ name: '', price: '', description: '' }])
          const rawHours = typeof editingItem.businessHours === 'string'
            ? editingItem.businessHours
            : (editingItem.businessHours?.raw ?? '')
          setBusinessHours(rawHours)
          if (rawHours === 'Closed') setHoursOpenStatus('CLOSED')
          else setHoursOpenStatus('OPEN')
        }
      } else {
        reset()
      }
    }
  }, [open, editingItem, defaultType])

  function reset() {
    setTitle(''); setDescription(''); setPhone(''); setSecondaryPhone(''); setWhatsapp(''); setAddress('')
    setMapLink(''); setBusinessHours(''); setHoursOpenStatus('OPEN'); setVillageId(''); setCategoryId(''); setRating('')
    setLogo(null); setCover(null); setGallery([])
    setReType('HOUSE'); setListingType('SALE'); setPrice(''); setAreaSqft('')
    setBedrooms(''); setBathrooms(''); setNegotiable(false)
    setServices([{ name: '', price: '', description: '' }])
    setType(defaultType ?? 'business')
  }

  async function submit() {
    if (!title.trim() || !description.trim()) {
      toast.error(`${type === 'realestate' ? 'Property Title' : 'Name'} and About/Description are required`)
      return
    }
    setSaving(true)
    try {
      if (editingItem) {
        if (type === 'realestate') {
          const res = await fetch(`/api/real-estate/${editingItem.id}`, {
            method: 'PATCH',
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
              images: gallery,
              address,
              mapEmbed: mapLink,
              contactPhone: phone,
              contactWhatsapp: whatsapp,
              villageId: villageId || undefined,
            }),
          })
          let json;
            try {
              json = await res.json()
            } catch (err) {
              console.error("API Parse Error:", err);
              throw new Error("Failed to submit listing. Please check all required fields.")
            }
            if (!res.ok || !json?.ok) throw new Error(json?.error || 'Failed')
          toast.success('Property updated!')
        } else {
          const cleanServices = services
            .filter((s) => s.name.trim())
            .map((s) => ({ name: s.name, price: s.price || undefined, description: s.description || undefined }))
          const finalHours = hoursOpenStatus === 'CLOSED' ? 'Closed' : (businessHours.trim() ? businessHours.trim() : 'Mon-Sat: 9:00 AM - 9:00 PM')
          const res = await fetch(`/api/listings/${editingItem.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title, description, coverImage: cover, logo, gallery, phone, secondaryPhone: secondaryPhone || undefined, whatsapp, address, mapEmbed: mapLink, servicesCatalog: cleanServices.length ? cleanServices : undefined, businessHours: finalHours, categoryId: categoryId || undefined, villageId: villageId || undefined,
            }),
          })
          let json;
            try {
              json = await res.json()
            } catch (err) {
              console.error("API Parse Error:", err);
              throw new Error("Failed to submit listing. Please check all required fields.")
            }
            if (!res.ok || !json?.ok) throw new Error(json?.error || 'Failed')
          toast.success('Listing updated!')
        }
        if (onSuccess) onSuccess()
        onOpenChange(false)
        reset()
      } else {
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
              title, description, type: reType, listingType, price: Number(price), negotiable, areaSqft: areaSqft ? Number(areaSqft) : undefined, bedrooms: bedrooms ? Number(bedrooms) : undefined, bathrooms: bathrooms ? Number(bathrooms) : undefined, coverImage: cover, images: gallery.length ? gallery : undefined, address, mapEmbed: mapLink, contactPhone: phone, secondaryPhone: secondaryPhone || undefined, contactWhatsapp: whatsapp, villageId: villageId || undefined,
            }),
          })
          let json;
            try {
              json = await res.json()
            } catch (err) {
              console.error("API Parse Error:", err);
              throw new Error("Failed to submit listing. Please check all required fields.")
            }
            if (!res.ok || !json?.ok) throw new Error(json?.error || 'Failed')
          toast.success('Property submitted for approval!')
          if (onSuccess) onSuccess()
          onOpenChange(false)
          reset()
        } else {
          const cleanServices = services.filter((s) => s.name.trim()).map((s) => ({ name: s.name, price: s.price || undefined, description: s.description || undefined }))
          const finalHours = hoursOpenStatus === 'CLOSED' ? 'Closed' : (businessHours.trim() ? businessHours.trim() : 'Mon-Sat: 9:00 AM - 9:00 PM')
          const res = await fetch('/api/listings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title, description, coverImage: cover, logo, gallery: gallery.length ? gallery : undefined, phone, secondaryPhone: secondaryPhone || undefined, whatsapp, address, mapEmbed: mapLink, servicesCatalog: cleanServices.length ? cleanServices : undefined, businessHours: finalHours, categoryId: categoryId || undefined, villageId: villageId || undefined,
            }),
          })
          let json;
            try {
              json = await res.json()
            } catch (err) {
              console.error("API Parse Error:", err);
              throw new Error("Failed to submit listing. Please check all required fields.")
            }
            if (!res.ok || !json?.ok) throw new Error(json?.error || 'Failed')
          toast.success('Submitted for admin approval!')
          if (onSuccess) onSuccess()
          onOpenChange(false)
          reset()
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl fancy-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900">
            {type === 'business' ? <Building2 className="h-5 w-5 text-blue-600" /> : type === 'service' ? <Wrench className="h-5 w-5 text-amber-600" /> : <Home className="h-5 w-5 text-emerald-600" />}
            {editingItem ? 'Edit Item' : type === 'business' ? 'Add Business Listing' : type === 'service' ? 'Add Service Listing' : 'List Real Estate Property'}
          </DialogTitle>
          <DialogDescription>
            {editingItem ? 'Update details below.' : 'Fill in the details below. Admin will review before publishing.'}
          </DialogDescription>
        </DialogHeader>

        {/* Listing Type Switcher Tabs (when creating new) */}
        {!editingItem ? (
          <Tabs value={type} onValueChange={(val) => setType(val as ListingType)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="business" className="gap-1.5 text-xs font-bold">
                <Building2 className="h-3.5 w-3.5" /> Business
              </TabsTrigger>
              <TabsTrigger value="service" className="gap-1.5 text-xs font-bold">
                <Wrench className="h-3.5 w-3.5" /> Service
              </TabsTrigger>
              <TabsTrigger value="realestate" className="gap-1.5 text-xs font-bold">
                <Home className="h-3.5 w-3.5" /> Real Estate
              </TabsTrigger>
            </TabsList>
          </Tabs>
        ) : null}

        <div className="space-y-4 py-2 font-sans">
          {/* Media uploads */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {type !== 'realestate' ? (
              <ImageUpload value={logo} onChange={setLogo} folder="logos" aspect="square" label="Logo (1:1)" />
            ) : null}
            <ImageUpload value={cover} onChange={setCover} folder="covers" aspect="video" label="Cover Photo (16:9)" className={type !== 'realestate' ? 'col-span-1 sm:col-span-3' : 'col-span-2 sm:col-span-4'} />
          </div>
          <GalleryUpload value={gallery} onChange={setGallery} folder="gallery" max={5} label="Gallery Photos (max 5)" />

          {/* Form fields based on Type */}
          {type === 'realestate' ? (
            /* REAL ESTATE ONLY FORM */
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Property Title *">
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. 200 Sq Yds Open Plot near NH-65" />
                </Field>
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
                <Field label="Listing Type">
                  <Select value={listingType} onValueChange={setListingType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SALE">For Sale</SelectItem>
                      <SelectItem value="RENT">For Rent</SelectItem>
                      <SelectItem value="LEASE">For Lease</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Price (₹) *">
                  <Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 4500000" inputMode="numeric" />
                </Field>
                <Field label="Area (sqft / sq yds)">
                  <Input value={areaSqft} onChange={(e) => setAreaSqft(e.target.value)} placeholder="e.g. 1800" inputMode="numeric" />
                </Field>
                <Field label="Bedrooms (BHK)">
                  <Input value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} placeholder="e.g. 3" inputMode="numeric" />
                </Field>
                <Field label="Bathrooms">
                  <Input value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} placeholder="e.g. 2" inputMode="numeric" />
                </Field>
                <Field label="Village">
                  <Select value={villageId} onValueChange={setVillageId}>
                    <SelectTrigger><SelectValue placeholder="Select village" /></SelectTrigger>
                    <SelectContent>
                      {localVillages.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Contact Phone *">
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="9494348175" />
                </Field>
                <Field label="WhatsApp">
                  <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="919494348175" />
                </Field>
              </div>

              <Field label="Address *">
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Near Bus Stand, Choutuppal" />
              </Field>

              <Field label="Google Map Link">
                <Input value={mapLink} onChange={(e) => setMapLink(e.target.value)} placeholder="https://maps.google.com/…" />
              </Field>

              <Field label="About / Description *">
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the property details, features, location landmarks..." rows={3} />
              </Field>
            </div>
          ) : (
            /* BUSINESS / SERVICE FORM */
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Business Name *">
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Sri Lakshmi Tiffin Center" />
                </Field>
                <Field label="Category">
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {localCategories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Phone">
                  <Input
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value
                      setPhone(val)
                      if (!whatsapp && val) {
                        setWhatsapp(val.length === 10 ? `91${val}` : val)
                      }
                    }}
                    placeholder="9494348175"
                  />
                </Field>
                <Field label="Secondary Phone (Optional)">
                  <Input value={secondaryPhone} onChange={(e) => setSecondaryPhone(e.target.value)} placeholder="9876543210" />
                </Field>
                <Field label="WhatsApp">
                  <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="919494348175" />
                </Field>
                <Field label="Business Hours">
                  <div className="flex items-center gap-2">
                    <Select value={hoursOpenStatus} onValueChange={(val) => setHoursOpenStatus(val as 'OPEN' | 'CLOSED')}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="OPEN">Open</SelectItem>
                        <SelectItem value="CLOSED">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    {hoursOpenStatus === 'OPEN' ? (
                      <Input
                        value={businessHours}
                        onChange={(e) => setBusinessHours(e.target.value)}
                        placeholder="e.g. 9:00 AM - 9:00 PM (Mon-Sat)"
                        className="flex-1"
                      />
                    ) : (
                      <div className="flex-1 rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-500">
                        Closed for Business
                      </div>
                    )}
                  </div>
                </Field>
                <Field label="Village">
                  <Select value={villageId} onValueChange={setVillageId}>
                    <SelectTrigger><SelectValue placeholder="Select village" /></SelectTrigger>
                    <SelectContent>
                      {localVillages.map((v) => (
                        <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Address *">
                  <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Main Road, Choutuppal" />
                </Field>
              </div>

              <Field label="Google Map Link">
                <Input value={mapLink} onChange={(e) => setMapLink(e.target.value)} placeholder="https://maps.google.com/…" />
              </Field>

              <Field label="About / Description *">
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe your business, products, services offered..." rows={3} />
              </Field>

              {/* Services catalog */}
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
                        placeholder="Service name"
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
            </div>
          )}
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
