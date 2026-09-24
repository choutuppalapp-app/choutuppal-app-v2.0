'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Building2,
  Wrench,
  Home,
  Save,
  Loader2,
  ArrowLeft,
  Link as LinkIcon,
  MessageSquare,
  Plus,
  Trash2,
  Sparkles,
  Info,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react'
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
import type { Village, Category } from '@prisma/client'

export type ListingType = 'business' | 'service' | 'realestate'

interface ServiceItem {
  name: string
  price: string
  description: string
}

interface AddListingFormProps {
  initialVillages?: Pick<Village, 'id' | 'name' | 'slug'>[]
  initialCategories?: Pick<Category, 'id' | 'name' | 'slug'>[]
  defaultType?: ListingType
}

export function AddListingForm({
  initialVillages = [],
  initialCategories = [],
  defaultType = 'business',
}: AddListingFormProps) {
  const router = useRouter()
  const [type, setType] = useState<ListingType>(defaultType)
  const [saving, setSaving] = useState(false)

  const [villages, setVillages] = useState(initialVillages)
  const [categories, setCategories] = useState(initialCategories)

  useEffect(() => {
    if (villages.length === 0) {
      fetch('/api/villages')
        .then((r) => r.json())
        .then((j) => {
          const list = j.villages || j.data || (Array.isArray(j) ? j : [])
          if (Array.isArray(list) && list.length > 0) setVillages(list)
        })
        .catch(() => {})
    }
  }, [villages.length])

  useEffect(() => {
    if (categories.length === 0) {
      fetch('/api/categories')
        .then((r) => r.json())
        .then((j) => {
          const list = j.categories || j.data || (Array.isArray(j) ? j : [])
          if (Array.isArray(list) && list.length > 0) setCategories(list)
        })
        .catch(() => {})
    }
  }, [categories.length])

  // Shared Form Fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [phone, setPhone] = useState('')
  const [secondaryPhone, setSecondaryPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('9494348175')
  const [address, setAddress] = useState('')
  const [mapLink, setMapLink] = useState('')
  const [businessHours, setBusinessHours] = useState('9:00 AM - 9:00 PM')
  const [hoursOpenStatus, setHoursOpenStatus] = useState<'OPEN' | 'CLOSED'>('OPEN')
  const [villageId, setVillageId] = useState('')
  const [categoryId, setCategoryId] = useState('')

  // URL-based Image Fields (Zero File Uploads to prevent storage bloat)
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [galleryUrls, setGalleryUrls] = useState<string[]>([''])

  // Business specific
  const [website, setWebsite] = useState('')
  const [establishedYear, setEstablishedYear] = useState('')

  // Service specific
  const [priceRange, setPriceRange] = useState('')
  const [servicesOffered, setServicesOffered] = useState<ServiceItem[]>([
    { name: 'General Consultation', price: '₹200', description: 'Standard service consultation' },
  ])

  // Real Estate specific
  const [propertyType, setPropertyType] = useState('PLOT')
  const [listingType, setListingType] = useState<'SALE' | 'RENT'>('SALE')
  const [price, setPrice] = useState('')
  const [negotiable, setNegotiable] = useState(true)
  const [areaSqft, setAreaSqft] = useState('')
  const [bedrooms, setBedrooms] = useState('')
  const [bathrooms, setBathrooms] = useState('')
  const [surveyNumber, setSurveyNumber] = useState('')
  const [facing, setFacing] = useState('East')

  const handleAddService = () => {
    setServicesOffered((prev) => [...prev, { name: '', price: '', description: '' }])
  }

  const handleRemoveService = (idx: number) => {
    setServicesOffered((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleServiceChange = (idx: number, field: keyof ServiceItem, value: string) => {
    setServicesOffered((prev) => {
      const next = [...prev]
      next[idx] = { ...next[idx], [field]: value }
      return next
    })
  }

  const handleAddGalleryUrl = () => {
    setGalleryUrls((prev) => [...prev, ''])
  }

  const handleGalleryUrlChange = (idx: number, val: string) => {
    setGalleryUrls((prev) => {
      const copy = [...prev]
      copy[idx] = val
      return copy
    })
  }

  const handleRemoveGalleryUrl = (idx: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim()) {
      toast.error('Please enter a title / business name')
      return
    }
    if (!phone.trim()) {
      toast.error('Please enter a primary phone number')
      return
    }

    setSaving(true)

    try {
      const cleanGallery = galleryUrls.filter((u) => u.trim().startsWith('http'))

      let endpoint = '/api/listings'
      let payload: Record<string, any> = {}

      if (type === 'business') {
        endpoint = '/api/listings'
        payload = {
          title,
          description,
          phone,
          secondaryPhone,
          whatsapp,
          address,
          mapLink,
          businessHours,
          hoursOpenStatus,
          villageId: villageId || null,
          categoryId: categoryId || null,
          website,
          establishedYear: establishedYear ? Number(establishedYear) : null,
          coverImage: coverImageUrl || null,
          logoImage: logoUrl || null,
          galleryImages: cleanGallery,
        }
      } else if (type === 'service') {
        endpoint = '/api/services'
        payload = {
          title,
          description,
          phone,
          whatsapp: whatsapp || phone,
          address,
          villageId: villageId || null,
          categoryId: categoryId || null,
          priceRange,
          servicesOffered,
          coverImage: coverImageUrl || null,
        }
      } else if (type === 'realestate') {
        endpoint = '/api/real-estate'
        payload = {
          title,
          description,
          type: propertyType,
          listingType,
          price: price ? Number(price) : null,
          negotiable,
          areaSqft: areaSqft ? Number(areaSqft) : null,
          bedrooms: bedrooms ? Number(bedrooms) : null,
          bathrooms: bathrooms ? Number(bathrooms) : null,
          facing,
          surveyNumber,
          address,
          villageId: villageId || null,
          contactPhone: phone,
          contactWhatsapp: whatsapp || phone,
          coverImage: coverImageUrl || null,
          galleryImages: cleanGallery,
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(json.error || `Failed to create listing (HTTP ${res.status})`)
      }

      toast.success('Listing created successfully! Submitted for review.')
      router.push('/profile/listings')
      router.refresh()
    } catch (err: any) {
      console.error('[AddListingForm] error:', err)
      toast.error(err?.message || 'Error saving listing. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Pre-filled WhatsApp link helper for demonstration/preview
  const whatsappPreviewUrl = `https://wa.me/919494348175?text=${encodeURIComponent(
    `Hi I want to book ${title || 'your service'} in Choutuppal`
  )}`

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/profile/listings"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-2 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to My Listings
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              Create New Listing
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Add your shop, business, service, or real estate property to reach 10,000+ local customers in Choutuppal.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="submit"
              disabled={saving}
              className="h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 shadow-md transition"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Publish Listing
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Listing Type Tabs */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">
            Select Listing Category
          </Label>
          <Tabs value={type} onValueChange={(v) => setType(v as ListingType)}>
            <TabsList className="grid grid-cols-3 w-full max-w-md h-12 bg-slate-100 p-1 rounded-2xl">
              <TabsTrigger
                value="business"
                className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs"
              >
                <Building2 className="h-4 w-4 mr-1.5" />
                Business / Shop
              </TabsTrigger>
              <TabsTrigger
                value="service"
                className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs"
              >
                <Wrench className="h-4 w-4 mr-1.5" />
                Service Provider
              </TabsTrigger>
              <TabsTrigger
                value="realestate"
                className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-xs"
              >
                <Home className="h-4 w-4 mr-1.5" />
                Real Estate
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Primary Information */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Info className="h-5 w-5 text-blue-600" />
          Basic Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="title" className="text-sm font-bold text-slate-800">
              {type === 'business' ? 'Business / Shop Name *' : type === 'service' ? 'Service Title / Profession *' : 'Property Headline *'}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                type === 'business'
                  ? 'e.g. Sri Lakshmi Supermarket'
                  : type === 'service'
                  ? 'e.g. Expert Electrical & AC Repair Services'
                  : 'e.g. 200 Sq. Yds Residential Open Plot in Panthangi'
              }
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-bold text-slate-800">Local Village / Area</Label>
            <Select value={villageId} onValueChange={setVillageId}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue placeholder="Select Village" />
              </SelectTrigger>
              <SelectContent>
                {villages.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {type !== 'realestate' && (
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-800">Business Category</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description" className="text-sm font-bold text-slate-800">
              Detailed Description
            </Label>
            <Textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your products, services, timings, landmarks, special offers..."
              className="rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Image URLs Section (Optimized URL-only mode to prevent storage limits) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <LinkIcon className="h-5 w-5 text-blue-600" />
            Media &amp; Image URLs
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Enter direct image URLs (e.g. from Cloudflare R2, Unsplash, or CDN). Zero file size upload bottlenecks.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="coverImageUrl" className="text-sm font-bold text-slate-800">
              Cover / Banner Image URL
            </Label>
            <Input
              id="coverImageUrl"
              type="url"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or https://media.choutuppal.in/..."
              className="h-11 rounded-xl font-mono text-xs"
            />
            {coverImageUrl && (
              <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                URL Set
              </div>
            )}
          </div>

          {type === 'business' && (
            <div className="space-y-2">
              <Label htmlFor="logoUrl" className="text-sm font-bold text-slate-800">
                Logo / Profile Image URL
              </Label>
              <Input
                id="logoUrl"
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://media.choutuppal.in/logos/shop.png"
                className="h-11 rounded-xl font-mono text-xs"
              />
            </div>
          )}

          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-bold text-slate-800">
                Additional Gallery Image URLs
              </Label>
              <button
                type="button"
                onClick={handleAddGalleryUrl}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Another URL
              </button>
            </div>

            {galleryUrls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => handleGalleryUrlChange(idx, e.target.value)}
                  placeholder={`https://media.choutuppal.in/gallery/photo_${idx + 1}.jpg`}
                  className="h-10 rounded-xl font-mono text-xs flex-1"
                />
                {galleryUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryUrl(idx)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Real Estate Specific Options */}
      {type === 'realestate' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Home className="h-5 w-5 text-blue-600" />
            Property Specifications
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-800">Property Type</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLOT">Open Plot / Land</SelectItem>
                  <SelectItem value="COMMERCIAL">Commercial Building</SelectItem>
                  <SelectItem value="HOUSE">Individual House / Villa</SelectItem>
                  <SelectItem value="FLAT">Apartment / Flat</SelectItem>
                  <SelectItem value="AGRICULTURE">Agricultural Land</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-800">Listing Purpose</Label>
              <Select value={listingType} onValueChange={(v) => setListingType(v as 'SALE' | 'RENT')}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SALE">For Sale</SelectItem>
                  <SelectItem value="RENT">For Rent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price" className="text-sm font-bold text-slate-800">
                Price (in ₹)
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. 2500000"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="areaSqft" className="text-sm font-bold text-slate-800">
                Area (Sq. Yards / Sq. Ft)
              </Label>
              <Input
                id="areaSqft"
                type="number"
                value={areaSqft}
                onChange={(e) => setAreaSqft(e.target.value)}
                placeholder="e.g. 200"
                className="h-11 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facing" className="text-sm font-bold text-slate-800">
                Facing
              </Label>
              <Select value={facing} onValueChange={setFacing}>
                <SelectTrigger className="h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="East">East</SelectItem>
                  <SelectItem value="West">West</SelectItem>
                  <SelectItem value="North">North</SelectItem>
                  <SelectItem value="South">South</SelectItem>
                  <SelectItem value="North-East">North-East</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="surveyNumber" className="text-sm font-bold text-slate-800">
                Survey Number / LP Number
              </Label>
              <Input
                id="surveyNumber"
                value={surveyNumber}
                onChange={(e) => setSurveyNumber(e.target.value)}
                placeholder="e.g. Sy. No 142/A"
                className="h-11 rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Service Specific: Sub Services and Pricing */}
      {type === 'service' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-blue-600" />
                Service Pricing &amp; Menu
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add rate cards and standard packages. Customers will book directly on WhatsApp.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddService}
              className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Package
            </Button>
          </div>

          <div className="space-y-3">
            {servicesOffered.map((svc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 relative"
              >
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-xs font-bold text-slate-700">Service Name</Label>
                  <Input
                    value={svc.name}
                    onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                    placeholder="e.g. AC Gas Refill & Service"
                    className="h-9 rounded-lg bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs font-bold text-slate-700">Estimated Price</Label>
                  <Input
                    value={svc.price}
                    onChange={(e) => handleServiceChange(idx, 'price', e.target.value)}
                    placeholder="e.g. ₹799 onwards"
                    className="h-9 rounded-lg bg-white"
                  />
                </div>
                {servicesOffered.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveService(idx)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contact & WhatsApp Integration */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div>
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-600" />
            Contact &amp; WhatsApp Booking Configuration
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Buttons on your listing page will automatically trigger WhatsApp prefilled links to your number.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-bold text-slate-800">
              Primary Phone Number *
            </Label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 9494348175"
              required
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-sm font-bold text-slate-800">
              WhatsApp Number (for Direct Orders) *
            </Label>
            <Input
              id="whatsapp"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="e.g. 9494348175"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="address" className="text-sm font-bold text-slate-800">
              Physical Address / Landmark
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Main Road, Opp Bus Stand, Choutuppal"
              className="h-11 rounded-xl"
            />
          </div>
        </div>

        {/* WhatsApp Preview Bar */}
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Direct WhatsApp Booking will be activated: <code className="bg-emerald-100 px-1 py-0.5 rounded font-mono text-[11px]">https://wa.me/919494348175?text=Hi%20I%20want%20to%20book...</code>
            </span>
          </div>
          <a
            href={whatsappPreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            Test Booking Link
          </a>
        </div>
      </div>

      {/* Bottom Submit Actions */}
      <div className="flex items-center justify-end gap-3 pt-4">
        <Link
          href="/profile/listings"
          className="px-5 py-3 rounded-xl border border-slate-200 bg-white font-bold text-sm text-slate-700 hover:bg-slate-50 transition"
        >
          Cancel
        </Link>
        <Button
          type="submit"
          disabled={saving}
          className="h-12 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 shadow-lg shadow-blue-500/20 transition"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Publishing...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Publish Listing
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
