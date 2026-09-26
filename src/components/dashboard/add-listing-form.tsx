'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
  Phone,
  PhoneCall,
  MapPin,
  Clock,
  ExternalLink,
  Layers,
  Image as ImageIcon,
  Check,
  ShieldCheck,
  Zap,
  AlertCircle,
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
import { cn } from '@/lib/utils'
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

// Curated high-resolution instant sample URLs for fast 1-click testing & styling
const SAMPLE_COVER_PRESETS = [
  {
    name: 'Auto & Garage',
    url: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Hospital / Clinic',
    url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Restaurant / Hotel',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Shopping / Retail',
    url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Electrical / Hardware',
    url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Real Estate / Land',
    url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80',
  },
]

const SAMPLE_LOGO_PRESETS = [
  {
    name: 'Store Badge',
    url: 'https://images.unsplash.com/photo-1534452203293-494d7ddbf7e0?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    name: 'Medical Cross',
    url: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=300&h=300&q=80',
  },
  {
    name: 'Auto Wrench',
    url: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=300&h=300&q=80',
  },
]

export function AddListingForm({
  initialVillages = [],
  initialCategories = [],
  defaultType = 'business',
}: AddListingFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const rawType = searchParams?.get('type') as ListingType | null

  const [type, setType] = useState<ListingType>(
    rawType === 'service' || rawType === 'realestate' || rawType === 'business'
      ? rawType
      : defaultType
  )
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
  const [whatsapp, setWhatsapp] = useState('')
  const [address, setAddress] = useState('')
  const [mapLink, setMapLink] = useState('')
  const [businessHours, setBusinessHours] = useState('9:00 AM - 9:00 PM (All Days)')
  const [villageId, setVillageId] = useState('')
  const [categoryId, setCategoryId] = useState('')

  // URL-Only Media Fields (No File Uploads to ensure zero server bottlenecks)
  const [coverImageUrl, setCoverImageUrl] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [galleryUrls, setGalleryUrls] = useState<string[]>([''])

  // Business specific
  const [website, setWebsite] = useState('')

  // Service specific
  const [priceRange, setPriceRange] = useState('')
  const [servicesOffered, setServicesOffered] = useState<ServiceItem[]>([
    { name: 'General Consultation & Service', price: '₹200', description: 'Standard visit and inspection' },
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

  // Validation errors & touched state
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    validateSingleField(field)
  }

  const clearError = (field: string) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  const validateSingleField = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev }
      if (field === 'title') {
        if (!title.trim()) {
          next.title = 'వ్యాపారం / షాప్ పేరు నమోదు చేయడం తప్పనిసరి (Title is mandatory)'
        } else if (title.trim().length < 2) {
          next.title = 'పేరు కనీసం 2 అక్షరాలు ఉండాలి (Title must be at least 2 characters)'
        } else {
          delete next.title
        }
      }
      if (field === 'phone') {
        const cleanPhone = phone.replace(/\D/g, '')
        if (!phone.trim()) {
          next.phone = 'ప్రధాన ఫోన్ నంబర్ నమోదు చేయడం తప్పనిసరి (Phone number is mandatory)'
        } else if (cleanPhone.length < 10) {
          next.phone = 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి (Enter a valid 10-digit phone number)'
        } else {
          delete next.phone
        }
      }
      if (field === 'villageId') {
        if (!villageId) {
          next.villageId = 'దయచేసి స్థానిక గ్రామం / ప్రాంతం ఎంచుకోండి (Please select a village/area)'
        } else {
          delete next.villageId
        }
      }
      if (field === 'categoryId' && type !== 'realestate') {
        if (!categoryId) {
          next.categoryId = 'దయచేసి కేటగిరీని ఎంచుకోండి (Please select a category)'
        } else {
          delete next.categoryId
        }
      }
      if (field === 'price' && type === 'realestate') {
        if (!price || Number(price) <= 0) {
          next.price = 'దయచేసి ప్రాపర్టీ ధర నమోదు చేయండి (Please enter a valid property price)'
        } else {
          delete next.price
        }
      }
      return next
    })
  }

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

  const handleRemoveGalleryUrl = (idx: number) => {
    setGalleryUrls((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleGalleryUrlChange = (idx: number, val: string) => {
    setGalleryUrls((prev) => {
      const copy = [...prev]
      copy[idx] = val
      return copy
    })
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // 1. Mandatory Title Validation
    if (!title.trim()) {
      newErrors.title = 'వ్యాపారం / షాప్ పేరు నమోదు చేయడం తప్పనిసరి (Title is mandatory)'
    } else if (title.trim().length < 2) {
      newErrors.title = 'పేరు కనీసం 2 అక్షరాలు ఉండాలి (Title must be at least 2 characters)'
    }

    // 2. Mandatory Phone Validation
    const cleanPhone = phone.replace(/\D/g, '')
    if (!phone.trim()) {
      newErrors.phone = 'ప్రధాన ఫోన్ నంబర్ నమోదు చేయడం తప్పనిసరి (Phone number is mandatory)'
    } else if (cleanPhone.length < 10) {
      newErrors.phone = 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి (Enter a valid 10-digit phone number)'
    }

    // 3. Mandatory Village / Area Validation
    if (!villageId) {
      newErrors.villageId = 'దయచేసి స్థానిక గ్రామం / ప్రాంతం ఎంచుకోండి (Please select a village/area)'
    }

    // 4. Mandatory Category Validation (for Business & Services)
    if (type !== 'realestate' && !categoryId) {
      newErrors.categoryId = 'దయచేసి కేటగిరీని ఎంచుకోండి (Please select a category)'
    }

    // 5. Mandatory Real Estate Price & Property Type
    if (type === 'realestate') {
      if (!price || Number(price) <= 0) {
        newErrors.price = 'దయచేసి ప్రాపర్టీ ధర నమోదు చేయండి (Please enter a valid property price)'
      }
    }

    // 6. Image URL format validation (if entered)
    if (coverImageUrl.trim() && !coverImageUrl.trim().startsWith('http://') && !coverImageUrl.trim().startsWith('https://')) {
      newErrors.coverImageUrl = 'కవర్ ఇమేజ్ URL తప్పనిసరిగా https:// తో ప్రారంభం కావాలి (URL must start with http:// or https://)'
    }

    if (logoUrl.trim() && !logoUrl.trim().startsWith('http://') && !logoUrl.trim().startsWith('https://')) {
      newErrors.logoUrl = 'లోగో URL తప్పనిసరిగా https:// తో ప్రారంభం కావాలి (URL must start with http:// or https://)'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      const firstKey = Object.keys(newErrors)[0]
      const firstErrorMessage = newErrors[firstKey]
      toast.error(firstErrorMessage)

      // Auto-focus first invalid input element
      setTimeout(() => {
        const el = document.getElementById(firstKey) || document.querySelector(`[name="${firstKey}"]`)
        if (el && 'focus' in el) {
          (el as HTMLElement).focus()
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 50)
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Run client-side form validation before sending request
    if (!validateForm()) {
      return
    }

    setSaving(true)

    try {
      const cleanGallery = galleryUrls.map((u) => u.trim()).filter((u) => u.startsWith('http'))

      let endpoint = '/api/listings'
      let payload: Record<string, any> = {}

      const finalPhone = phone.trim()
      const finalWhatsapp = (whatsapp.trim() || finalPhone)

      if (type === 'business') {
        endpoint = '/api/listings'
        payload = {
          title: title.trim(),
          description: description.trim(),
          phone: finalPhone,
          secondaryPhone: secondaryPhone.trim() || null,
          whatsapp: finalWhatsapp,
          address: address.trim(),
          mapLink: mapLink.trim() || null,
          businessHours,
          villageId: villageId || null,
          categoryId: categoryId || null,
          website: website.trim() || null,
          coverImage: coverImageUrl.trim() || null,
          logoImage: logoUrl.trim() || null,
          galleryImages: cleanGallery,
          servicesCatalog: servicesOffered.filter((s) => s.name.trim()),
          status: 'APPROVED',
          is_approved: true,
          isApproved: true,
        }
      } else if (type === 'service') {
        endpoint = '/api/listings'
        payload = {
          title: title.trim(),
          description: description.trim(),
          type: 'SERVICE',
          phone: finalPhone,
          secondaryPhone: secondaryPhone.trim() || null,
          whatsapp: finalWhatsapp,
          address: address.trim(),
          mapLink: mapLink.trim() || null,
          villageId: villageId || null,
          categoryId: categoryId || null,
          coverImage: coverImageUrl.trim() || null,
          logoImage: logoUrl.trim() || null,
          galleryImages: cleanGallery,
          servicesCatalog: servicesOffered.filter((s) => s.name.trim()),
          priceRange: priceRange.trim() || null,
          status: 'APPROVED',
          is_approved: true,
          isApproved: true,
        }
      } else if (type === 'realestate') {
        endpoint = '/api/real-estate'
        payload = {
          title: title.trim(),
          description: description.trim(),
          type: propertyType,
          listingType,
          price: price ? Number(price) : 0,
          negotiable,
          areaSqft: areaSqft ? Number(areaSqft) : null,
          bedrooms: bedrooms ? Number(bedrooms) : null,
          bathrooms: bathrooms ? Number(bathrooms) : null,
          facing,
          surveyNumber: surveyNumber.trim() || null,
          address: address.trim() || 'Choutuppal',
          villageId: villageId || null,
          contactPhone: finalPhone,
          contactWhatsapp: finalWhatsapp,
          coverImage: coverImageUrl.trim() || null,
          galleryImages: cleanGallery,
          status: 'APPROVED',
          is_approved: true,
          isApproved: true,
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

      toast.success('లిస్టింగ్ విజయవంతంగా పబ్లిష్ అయింది! (Listing published successfully!)')
      router.push('/dashboard?tab=listings')
      router.refresh()
    } catch (err: any) {
      console.error('[AddListingForm] error:', err)
      toast.error(err?.message || 'Error saving listing. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  // Live WhatsApp formatted booking preview
  const previewWaNumber = (whatsapp.trim() || phone.trim() || '9494348175').replace(/\D/g, '')
  const whatsappPreviewUrl = `https://wa.me/91${previewWaNumber}?text=${encodeURIComponent(
    `నమస్కారం, మీ ${title || 'వ్యాపారం'} గురించి చౌటుప్పల్ యాప్ లో చూశాను. వివరాలు కావాలి.`
  )}`

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Header Card with Category Toggle */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard?tab=listings"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 mb-2.5 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              డ్యాష్‌బోర్డ్‌కు తిరిగి వెళ్లండి (Back to Dashboard)
            </Link>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Add New Listing / కొత్త లిస్టింగ్ జోడించండి
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Publish your business, shop, service or property across Choutuppal with instant WhatsApp leads &amp; QR standee generation.
            </p>
          </div>

          <Button
            type="submit"
            disabled={saving}
            className="h-11 rounded-2xl gradient-brand text-white font-bold px-6 shadow-md transition active:scale-95"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                పబ్లిష్ అవుతోంది...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Publish Listing
              </>
            )}
          </Button>
        </div>

        {/* Listing Type Tabs */}
        <div className="mt-6 border-t border-slate-100 pt-6">
          <Label className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2.5 block">
            1. Select Listing Type / లిస్టింగ్ రకం ఎంచుకోండి
          </Label>
          <Tabs value={type} onValueChange={(v) => setType(v as ListingType)}>
            <TabsList className="grid grid-cols-3 w-full max-w-lg h-12 bg-slate-100/90 p-1 rounded-2xl">
              <TabsTrigger
                value="business"
                className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-xs"
              >
                <Building2 className="h-4 w-4 mr-1.5 text-blue-600" />
                Shop / Business
              </TabsTrigger>
              <TabsTrigger
                value="service"
                className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-amber-700 data-[state=active]:shadow-xs"
              >
                <Wrench className="h-4 w-4 mr-1.5 text-amber-600" />
                Service Provider
              </TabsTrigger>
              <TabsTrigger
                value="realestate"
                className="rounded-xl font-bold text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-xs"
              >
                <Home className="h-4 w-4 mr-1.5 text-emerald-600" />
                Real Estate
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* 2. Visual Listing Blueprint Guide (Interactive) */}
      <div className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 p-5 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10 pointer-events-none">
          <Sparkles className="h-40 w-40 text-white" />
        </div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-0.5 text-[10px] font-extrabold text-blue-200 border border-blue-400/30 mb-2">
            <Layers className="h-3 w-3" />
            <span>Listing Creation Blueprint / లిస్టింగ్ గైడ్</span>
          </div>
          <h3 className="text-base font-black text-white">
            పూర్తి లిస్టింగ్ కోసం అవసరమైన వివరాల బ్లూప్రింట్ (Required Blueprint)
          </h3>
          <p className="text-xs text-blue-100/80 mt-1 max-w-2xl leading-relaxed">
            మీ లిస్టింగ్‌ను వేగంగా మరియు అద్భుతంగా పబ్లిష్ చేయడానికి క్రింది స్టెప్స్ పూర్తి చేయండి. ఇమేజ్ అప్‌లోడ్ వెయిటింగ్ లేకుండా నేరుగా CDN/Web Image URL లను మాత్రమే ఉపయోగించవచ్చు.
          </p>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="rounded-2xl bg-white/10 p-2.5 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] font-black text-blue-300">STEP 1</span>
              <p className="font-bold mt-0.5">Basic Details</p>
              <p className="text-[10px] text-slate-300">Name, Category &amp; Village</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-2.5 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] font-black text-amber-300">STEP 2</span>
              <p className="font-bold mt-0.5">URL Images Only</p>
              <p className="text-[10px] text-slate-300">Cover &amp; Logo direct links</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-2.5 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] font-black text-emerald-300">STEP 3</span>
              <p className="font-bold mt-0.5">Contact &amp; WhatsApp</p>
              <p className="text-[10px] text-slate-300">Call &amp; Direct WhatsApp lead</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-2.5 backdrop-blur-xs border border-white/10">
              <span className="text-[10px] font-black text-purple-300">STEP 4</span>
              <p className="font-bold mt-0.5">Services / Property</p>
              <p className="text-[10px] text-slate-300">Rates, Timings &amp; Standee</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Basic Information Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
        <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
          <Info className="h-4 w-4 text-blue-600" />
          2. Basic Information (ప్రాథమిక వివరాలు)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title" className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                {type === 'business'
                  ? 'Business / Shop Name (వ్యాపారం లేదా షాప్ పేరు)'
                  : type === 'service'
                  ? 'Service Title / Profession (సర్వీస్ లేదా వృత్తి పేరు)'
                  : 'Property Title (ప్లాట్ లేదా ప్రాపర్టీ పేరు)'} <span className="text-red-500">*</span>
                {touched.title && !errors.title && title.trim().length >= 2 && (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                )}
              </span>
              {errors.title && (
                <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.title}
                </span>
              )}
            </Label>
            <Input
              id="title"
              value={title}
              onBlur={() => markTouched('title')}
              onChange={(e) => {
                setTitle(e.target.value)
                if (touched.title) {
                  validateSingleField('title')
                } else {
                  clearError('title')
                }
              }}
              placeholder={
                type === 'business'
                  ? 'e.g. శ్రీ లక్ష్మి సూపర్ మార్కెట్ / Sri Lakshmi Supermarket'
                  : type === 'service'
                  ? 'e.g. సాయి ఎలక్ట్రికల్ & ప్లంబింగ్ వర్క్స్'
                  : 'e.g. 200 Sq. Yds Open Plot in Panthangi, Choutuppal'
              }
              aria-invalid={!!errors.title}
              className={cn(
                'h-11 rounded-xl text-sm transition',
                errors.title && 'border-red-500 ring-1 ring-red-500 bg-red-50/20',
                touched.title && !errors.title && title.trim().length >= 2 && 'border-emerald-500/50'
              )}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="villageId" className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Local Village / Area (గ్రామం / ప్రాంతం) <span className="text-red-500">*</span></span>
              {errors.villageId && (
                <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Required
                </span>
              )}
            </Label>
            <Select
              value={villageId}
              onValueChange={(val) => {
                setVillageId(val)
                clearError('villageId')
              }}
            >
              <SelectTrigger
                id="villageId"
                aria-invalid={!!errors.villageId}
                className={cn(
                  'h-11 rounded-xl text-sm transition',
                  errors.villageId && 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                )}
              >
                <SelectValue placeholder="గ్రామం ఎంచుకోండి (Select Village)" />
              </SelectTrigger>
              <SelectContent>
                {villages.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.villageId && (
              <p className="text-[11px] font-medium text-red-600 flex items-center gap-1 mt-0.5">
                <AlertCircle className="h-3 w-3" /> {errors.villageId}
              </p>
            )}
          </div>

          {type !== 'realestate' && (
            <div className="space-y-1.5">
              <Label htmlFor="categoryId" className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Category (వర్గం) <span className="text-red-500">*</span></span>
                {errors.categoryId && (
                  <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Required
                  </span>
                )}
              </Label>
              <Select
                value={categoryId}
                onValueChange={(val) => {
                  setCategoryId(val)
                  clearError('categoryId')
                }}
              >
                <SelectTrigger
                  id="categoryId"
                  aria-invalid={!!errors.categoryId}
                  className={cn(
                    'h-11 rounded-xl text-sm transition',
                    errors.categoryId && 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                  )}
                >
                  <SelectValue placeholder="వర్గం ఎంచుకోండి (Select Category)" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-[11px] font-medium text-red-600 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="h-3 w-3" /> {errors.categoryId}
                </p>
              )}
            </div>
          )}

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description" className="text-xs font-bold text-slate-800">
              Detailed Description (వ్యాపార పూర్తి వివరాలు, ఆఫర్లు, ప్రత్యేకతలు)
            </Label>
            <Textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="మా వద్ద లభించు వస్తువులు, నాణ్యమైన సర్వీస్ మరియు ఆఫర్ల వివరాలు..."
              className="rounded-xl text-sm"
            />
          </div>
        </div>
      </div>

      {/* 4. Pure URL-Only Media Section (No File Uploads) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-blue-600" />
              3. Image URLs Only (ఇమేజ్ లింక్‌లు మాత్రమే - నో ఫైల్ అప్‌లోడ్)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Paste direct image URLs. High resolution, ultra-fast loading &amp; zero file storage limits.
            </p>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <Zap className="h-3 w-3" />
            100% Direct URL Mode
          </span>
        </div>

        {/* Cover Image URL */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="coverImageUrl" className="text-xs font-bold text-slate-800 flex items-center justify-between w-full">
              <span>Cover Banner Image URL (కవర్ ఫోటో లింక్)</span>
              {errors.coverImageUrl && (
                <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.coverImageUrl}
                </span>
              )}
            </Label>
          </div>

          <div className="flex items-center gap-2">
            <Input
              id="coverImageUrl"
              type="url"
              value={coverImageUrl}
              onChange={(e) => {
                setCoverImageUrl(e.target.value)
                clearError('coverImageUrl')
              }}
              placeholder="https://images.unsplash.com/photo-... or https://media.choutuppal.in/..."
              aria-invalid={!!errors.coverImageUrl}
              className={cn(
                'h-11 rounded-xl font-mono text-xs flex-1 transition',
                errors.coverImageUrl && 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
              )}
            />
          </div>

          {/* Preset Samples */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 mb-1.5">
              1-Click Sample Images (నమూనా ఫోటోలు క్లిక్ చేయండి):
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_COVER_PRESETS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setCoverImageUrl(p.url)
                    clearError('coverImageUrl')
                  }}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition"
                >
                  + {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* Live Cover Preview */}
          {coverImageUrl && (
            <div className="mt-3 relative aspect-[16/9] max-h-48 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
              <Image
                fill
                unoptimized
                src={coverImageUrl}
                alt="Cover Preview"
                className="object-cover"
                onError={() => {
                  toast.error('Image URL could not be loaded. Please check the link.')
                }}
              />
              <span className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                Live Cover Preview
              </span>
            </div>
          )}
        </div>

        {/* Logo / Profile Image URL */}
        {type !== 'realestate' && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <Label htmlFor="logoUrl" className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>Logo / Shop Avatar Image URL (లోగో లేదా ప్రొఫైల్ ఫోటో లింక్)</span>
              {errors.logoUrl && (
                <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {errors.logoUrl}
                </span>
              )}
            </Label>
            <Input
              id="logoUrl"
              type="url"
              value={logoUrl}
              onChange={(e) => {
                setLogoUrl(e.target.value)
                clearError('logoUrl')
              }}
              placeholder="https://images.unsplash.com/photo-... or https://media.choutuppal.in/..."
              aria-invalid={!!errors.logoUrl}
              className={cn(
                'h-11 rounded-xl font-mono text-xs transition',
                errors.logoUrl && 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
              )}
            />

            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_LOGO_PRESETS.map((l, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setLogoUrl(l.url)
                    clearError('logoUrl')
                  }}
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition"
                >
                  + Sample {l.name}
                </button>
              ))}
            </div>

            {logoUrl && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-white shadow-xs bg-white shrink-0">
                  <Image fill unoptimized src={logoUrl} alt="Logo Preview" className="object-cover" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800">Logo Live Preview</p>
                  <p className="text-[10px] text-slate-500">Will appear in standee QR codes and listing cards.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Gallery Image URLs (Dynamic list) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-bold text-slate-800">
              Additional Gallery Image URLs (గ్యాలరీ ఫోటోల లింక్‌లు)
            </Label>
            <button
              type="button"
              onClick={handleAddGalleryUrl}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Plus className="h-3.5 w-3.5" />
              + Add URL
            </button>
          </div>

          <div className="space-y-2">
            {galleryUrls.map((gUrl, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  type="url"
                  value={gUrl}
                  onChange={(e) => handleGalleryUrlChange(idx, e.target.value)}
                  placeholder={`https://images.unsplash.com/photo-example-${idx + 1}...`}
                  className="h-10 rounded-xl font-mono text-xs flex-1"
                />
                {galleryUrls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryUrl(idx)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition"
                    aria-label="Remove URL"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Contact & WhatsApp Configuration */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-emerald-600" />
            4. Contact &amp; Direct WhatsApp Connect (సంప్రదింపు వివరాలు)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Customers will receive direct 1-tap WhatsApp chats and instant phone calling from your listing.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="phone" className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                Primary Phone Number (ప్రధాన ఫోన్ నంబర్) <span className="text-red-500">*</span>
                {touched.phone && !errors.phone && phone.replace(/\D/g, '').length >= 10 && (
                  <Check className="h-3.5 w-3.5 text-emerald-600" />
                )}
              </span>
              {errors.phone && (
                <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> Required
                </span>
              )}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onBlur={() => markTouched('phone')}
              onChange={(e) => {
                setPhone(e.target.value)
                if (touched.phone) {
                  validateSingleField('phone')
                } else {
                  clearError('phone')
                }
              }}
              placeholder="e.g. 9494348175"
              aria-invalid={!!errors.phone}
              className={cn(
                'h-11 rounded-xl text-sm transition',
                errors.phone && 'border-red-500 ring-1 ring-red-500 bg-red-50/20',
                touched.phone && !errors.phone && phone.replace(/\D/g, '').length >= 10 && 'border-emerald-500/50'
              )}
            />
            {errors.phone && (
              <p className="text-[11px] font-medium text-red-600 flex items-center gap-1 mt-0.5">
                <AlertCircle className="h-3 w-3" /> {errors.phone}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="secondaryPhone" className="text-xs font-bold text-slate-800">
              Secondary / Alternate Phone (ద్వితీయ ఫోన్ నంబర్)
            </Label>
            <Input
              id="secondaryPhone"
              type="tel"
              value={secondaryPhone}
              onChange={(e) => setSecondaryPhone(e.target.value)}
              placeholder="e.g. 9876543210 (Optional)"
              className="h-11 rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="whatsapp" className="text-xs font-bold text-slate-800">
              WhatsApp Number (వాట్సాప్ నంబర్)
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="e.g. 9494348175 (Defaults to Primary Phone)"
              className="h-11 rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="businessHours" className="text-xs font-bold text-slate-800">
              Working Hours / Timings (పని వేళలు)
            </Label>
            <Input
              id="businessHours"
              value={businessHours}
              onChange={(e) => setBusinessHours(e.target.value)}
              placeholder="e.g. 9:00 AM - 9:00 PM (All Days)"
              className="h-11 rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address" className="text-xs font-bold text-slate-800">
              Full Physical Address / Landmark (చిరునామా &amp; ల్యాండ్‌మార్క్)
            </Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Main Road, Beside Bus Stand, Choutuppal"
              className="h-11 rounded-xl text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="mapLink" className="text-xs font-bold text-slate-800">
              Google Maps Link or Location URL (గూగుల్ మ్యాప్స్ లింక్)
            </Label>
            <Input
              id="mapLink"
              value={mapLink}
              onChange={(e) => setMapLink(e.target.value)}
              placeholder="https://maps.app.goo.gl/... or https://maps.google.com/..."
              className="h-11 rounded-xl text-sm font-mono"
            />
          </div>
        </div>

        {/* WhatsApp Preview Indicator */}
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>
              Real-time WhatsApp notifications &amp; direct customer booking enabled.
            </span>
          </div>
          <a
            href={whatsappPreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
          >
            <MessageSquare className="h-3 w-3" />
            Test Link
          </a>
        </div>
      </div>

      {/* 6. Real Estate Specifications (Only shown if Real Estate selected) */}
      {type === 'realestate' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-5">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Home className="h-4 w-4 text-emerald-600" />
            5. Real Estate Details (రియల్ ఎస్టేట్ &amp; స్థల వివరాలు)
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">Property Type (ప్రాపర్టీ రకం)</Label>
              <Select value={propertyType} onValueChange={setPropertyType}>
                <SelectTrigger className="h-11 rounded-xl text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PLOT">Open Plot / Land (ఓపెన్ ప్లాట్)</SelectItem>
                  <SelectItem value="COMMERCIAL">Commercial Building (కమర్షియల్ షాప్)</SelectItem>
                  <SelectItem value="HOUSE">Individual House / Villa (ఇల్లు)</SelectItem>
                  <SelectItem value="FLAT">Apartment / Flat (ఫ్లాట్)</SelectItem>
                  <SelectItem value="AGRICULTURE">Agricultural Land (వ్యవసాయ భూమి)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">Listing Purpose (అమ్మకం / అద్దె)</Label>
              <Select value={listingType} onValueChange={(v) => setListingType(v as 'SALE' | 'RENT')}>
                <SelectTrigger className="h-11 rounded-xl text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SALE">For Sale (అమ్మకానికి)</SelectItem>
                  <SelectItem value="RENT">For Rent / Lease (అద్దెకు)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="price" className="text-xs font-bold text-slate-800 flex items-center justify-between">
                <span>Price in ₹ (మొత్తం ధర) <span className="text-red-500">*</span></span>
                {errors.price && (
                  <span className="text-[11px] font-semibold text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" /> Required
                  </span>
                )}
              </Label>
              <Input
                id="price"
                type="number"
                value={price}
                onChange={(e) => {
                  setPrice(e.target.value)
                  clearError('price')
                }}
                placeholder="e.g. 2500000"
                aria-invalid={!!errors.price}
                className={cn(
                  'h-11 rounded-xl text-sm transition',
                  errors.price && 'border-red-500 ring-1 ring-red-500 bg-red-50/20'
                )}
              />
              {errors.price && (
                <p className="text-[11px] font-medium text-red-600 flex items-center gap-1 mt-0.5">
                  <AlertCircle className="h-3 w-3" /> {errors.price}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="areaSqft" className="text-xs font-bold text-slate-800">
                Area in Sq. Yards / Sq. Ft (వైశాల్యం)
              </Label>
              <Input
                id="areaSqft"
                type="number"
                value={areaSqft}
                onChange={(e) => setAreaSqft(e.target.value)}
                placeholder="e.g. 200"
                className="h-11 rounded-xl text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-800">Facing (దిశ)</Label>
              <Select value={facing} onValueChange={setFacing}>
                <SelectTrigger className="h-11 rounded-xl text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="East">East (తూర్పు)</SelectItem>
                  <SelectItem value="West">West (పడమర)</SelectItem>
                  <SelectItem value="North">North (ఉత్తరం)</SelectItem>
                  <SelectItem value="South">South (దక్షిణం)</SelectItem>
                  <SelectItem value="North-East">North-East (ఈశాన్యం)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="surveyNumber" className="text-xs font-bold text-slate-800">
                Survey / LP No (సర్వే నంబర్)
              </Label>
              <Input
                id="surveyNumber"
                value={surveyNumber}
                onChange={(e) => setSurveyNumber(e.target.value)}
                placeholder="e.g. Sy. No 142/A"
                className="h-11 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* 7. Services Catalog (Only shown for Business & Services) */}
      {type !== 'realestate' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Wrench className="h-4 w-4 text-blue-600" />
                5. Services &amp; Products Menu (సర్వీసులు మరియు రేట్ కార్డు)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                List popular items or packages. Customers can order them directly on WhatsApp.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddService}
              className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 text-xs font-bold h-9"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              + Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {servicesOffered.map((svc, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-3 gap-3 relative"
              >
                <div className="space-y-1 sm:col-span-2">
                  <Label className="text-[11px] font-bold text-slate-700">Service / Product Name</Label>
                  <Input
                    value={svc.name}
                    onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                    placeholder="e.g. Oil Change / AC Servicing / Item Name"
                    className="h-9 rounded-lg bg-white text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-bold text-slate-700">Estimated Price</Label>
                  <Input
                    value={svc.price}
                    onChange={(e) => handleServiceChange(idx, 'price', e.target.value)}
                    placeholder="e.g. ₹500"
                    className="h-9 rounded-lg bg-white text-xs"
                  />
                </div>
                {servicesOffered.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveService(idx)}
                    className="absolute top-2 right-2 text-slate-400 hover:text-red-500 p-1"
                    aria-label="Delete service"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 8. Live Interactive Card Preview (What customers see) */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl space-y-4 border border-slate-700/80">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-base font-black text-white">
              6. Live Public Preview / పబ్లిక్ ప్రివ్యూ
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-300 bg-white/10 px-2.5 py-1 rounded-full border border-white/10">
            Realtime Preview
          </span>
        </div>

        <p className="text-xs text-slate-300">
          This is exactly how your listing will be displayed to thousands of local residents in Choutuppal:
        </p>

        <div className="max-w-md mx-auto rounded-2xl overflow-hidden bg-white text-slate-900 shadow-2xl border border-slate-100">
          {/* Preview Image */}
          <div className="relative aspect-[16/9] bg-slate-100">
            {coverImageUrl ? (
              <Image
                fill
                unoptimized
                src={coverImageUrl}
                alt="Preview Cover"
                className="object-cover"
              />
            ) : (
              <div className="h-full w-full gradient-brand grid place-items-center text-white font-black text-3xl">
                {(title || 'C').charAt(0).toUpperCase()}
              </div>
            )}
            <span className="absolute left-3 top-3 rounded-full bg-emerald-600 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
              {type === 'business' ? '🏪 Business' : type === 'service' ? '🔧 Service' : '🏠 Real Estate'}
            </span>
            {villageId && (
              <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-xs flex items-center gap-1">
                <MapPin className="h-3 w-3 text-amber-400" />
                {villages.find((v) => v.id === villageId)?.name || 'Choutuppal'}
              </span>
            )}
          </div>

          {/* Preview Details */}
          <div className="p-4 space-y-3">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 line-clamp-1">
                {title || 'మీ వ్యాపారం లేదా షాప్ పేరు (Business Name)'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {description || 'నాణ్యమైన సేవలు మరియు ఉత్తమ ఉత్పత్తులు అందుబాటులో ఉన్నాయి...'}
              </p>
            </div>

            {/* Quick Action Preview Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div className="h-9 rounded-xl bg-green-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                <MessageSquare className="h-3.5 w-3.5" />
                WhatsApp Chat
              </div>
              <div className="h-9 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                <Phone className="h-3.5 w-3.5" />
                Call Now
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Summary Banner (Shown if errors exist) */}
      {Object.keys(errors).length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50/90 p-4 text-red-800 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="flex items-center gap-2 font-bold text-sm text-red-700 mb-1.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>దయచేసి క్రింది తప్పనిసరి వివరాలను సరిచూసుకోండి (Please complete required fields):</span>
          </div>
          <ul className="list-disc list-inside text-xs space-y-1 text-red-600 pl-1">
            {Object.entries(errors).map(([key, msg]) => (
              <li key={key}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* 9. Bottom Sticky Submit & Cancel Bar */}
      <div className="flex items-center justify-end gap-3 pt-2 pb-6">
        <Link
          href="/dashboard?tab=listings"
          className="px-6 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-xs sm:text-sm text-slate-700 hover:bg-slate-50 transition"
        >
          Cancel / రద్దు చేయండి
        </Link>
        <Button
          type="submit"
          disabled={saving}
          className="h-12 rounded-2xl gradient-brand text-white font-bold px-8 shadow-lg shadow-blue-500/20 text-xs sm:text-sm transition active:scale-95"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              పబ్లిష్ అవుతోంది...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Publish Listing (లిస్టింగ్ పబ్లిష్ చేయండి)
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
