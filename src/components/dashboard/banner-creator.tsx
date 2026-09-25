'use client'

import { useState } from 'react'
import { Loader2, Send, Image as ImageIcon, Link as LinkIcon, MessageCircle, Sparkles, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import Image from 'next/image'

interface BannerCreatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

const SAMPLE_BANNER_LINKS = [
  {
    name: 'Mega Sale Banner',
    url: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Shop Promo Banner',
    url: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=1200&q=80',
  },
  {
    name: 'Business Offer',
    url: 'https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80',
  },
]

export function BannerCreator({ open, onOpenChange, onCreated }: BannerCreatorProps) {
  const [imageUrl, setImageUrl] = useState('')
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [position, setPosition] = useState('HOME_TOP')
  const [posting, setPosting] = useState(false)

  async function postBanner() {
    if (!imageUrl.trim()) {
      toast.error('దయచేసి బ్యానర్ ఇమేజ్ లింక్ (Image URL) ఎంటర్ చేయండి')
      return
    }

    setPosting(true)
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: imageUrl.trim(),
          title: title.trim() || undefined,
          link: link.trim() || undefined,
          position,
        }),
      })

      const j = await res.json().catch(() => ({}))
      if (!res.ok || !j.ok) {
        throw new Error(j.error || 'Failed to create banner')
      }

      toast.success('బ్యానర్ విజయవంతంగా పోస్ట్ చేయబడింది! 24 గంటలు లైవ్ లో ఉంటుంది.')
      reset()
      onOpenChange(false)
      onCreated()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to create banner')
    } finally {
      setPosting(false)
    }
  }

  function reset() {
    setImageUrl('')
    setTitle('')
    setLink('')
    setPosition('HOME_TOP')
  }

  const waPrefillMessage = `నమస్కారం చౌటుప్పల్ యాప్, నా బిజినెస్ కోసం బ్యానర్ ప్రమోషన్ అడ్ ఇవ్వాలనుకుంటున్నాను: ${title || 'హోమ్‌పేజ్ బ్యానర్'}`
  const waUrl = `https://wa.me/919494348175?text=${encodeURIComponent(waPrefillMessage)}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-3xl p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl gradient-brand text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <DialogTitle className="text-lg font-black text-slate-900">
                Promote Business Banner (లింక్ ద్వారా పోస్ట్ చేయండి)
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                ఇమేజ్ లింక్ (URL) ఎంటర్ చేయండి. హోమ్‌పేజీలో 24 గంటలు లైవ్ లో ఉంటుంది.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 p-6 pt-2 max-h-[80vh] overflow-y-auto fancy-scroll">
          {/* Direct Media Link Input */}
          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LinkIcon className="h-3.5 w-3.5 text-blue-600" /> Banner Image Link / URL (16:9)
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Direct Link Only</span>
            </Label>
            <Input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/... or https://i.imgur.com/..."
              className="rounded-xl text-xs"
            />
            <p className="text-[11px] text-slate-500">
              గమనిక: ఫోటో అప్‌లోడ్ అవసరం లేదు. కేవలం ఏదైనా వెబ్‌సైట్ / క్లౌడ్ ఇమేజ్ లింక్ ఇస్తే సరిపోతుంది.
            </p>
          </div>

          {/* Preset Sample Links */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-3 space-y-2">
            <p className="text-[11px] font-bold text-slate-700">శాంపిల్ ఇమేజ్ లింక్స్ (క్లిక్ చేసి వాడవచ్చు):</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_BANNER_LINKS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageUrl(sample.url)}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition"
                >
                  + {sample.name}
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview */}
          {imageUrl ? (
            <div className="space-y-1">
              <Label className="text-[11px] font-bold text-slate-600">లైవ్ ప్రివ్యూ (16:9):</Label>
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-inner">
                <Image
                  src={imageUrl}
                  alt="Banner preview"
                  fill
                  className="object-cover"
                  onError={() => {
                    toast.error('ఇమేజ్ లింక్ చెల్లదు. దయచేసి సరైన పబ్లిక్ ఇమేజ్ URL ఇవ్వండి.')
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-8 text-center">
              <ImageIcon className="h-8 w-8 text-slate-400" />
              <p className="mt-2 text-xs font-semibold text-slate-600">ఇమేజ్ లింక్ ఎంటర్ చేయగానే ఇక్కడ ప్రివ్యూ కనిపిస్తుంది</p>
            </div>
          )}

          {/* Title */}
          <div>
            <Label className="mb-1.5 block text-xs font-bold text-slate-700">బ్యానర్ టైటిల్ / ఆఫర్ పేరు (ఆప్షనల్)</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ఉదాహరణ: దీపావళి గ్రాండ్ సేల్ 20% డిస్కౌంట్"
              className="rounded-xl text-xs"
            />
          </div>

          {/* Link */}
          <div>
            <Label className="mb-1.5 block text-xs font-bold text-slate-700">టార్గెట్ లింక్ (ఆప్షనల్)</Label>
            <Input
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://... లేదా /business/your-shop"
              className="rounded-xl text-xs"
            />
          </div>

          {/* Position */}
          <div>
            <Label className="mb-1.5 block text-xs font-bold text-slate-700">ప్లేస్‌మెంట్ స్థానం</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger className="rounded-xl text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HOME_TOP">Home Top (హోమ్‌పేజీ పైభాగం)</SelectItem>
                <SelectItem value="HOME_MIDDLE">Home Middle (హోమ్‌పేజీ మధ్యభాగం)</SelectItem>
                <SelectItem value="SIDEBAR">Sidebar (సైడ్‌బార్)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* WhatsApp Direct Help Button */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3 flex items-center justify-between gap-2">
            <div className="text-[11px] text-emerald-950">
              <p className="font-bold">WhatsApp లో కస్టమ్ డిజైన్ కావాలా?</p>
              <p className="text-emerald-700">మా టీమ్ మీకు బ్యానర్ డిజైన్ చేసి ఇస్తుంది.</p>
            </div>
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp Help
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl text-xs"
            >
              రద్దు చేయండి
            </Button>
            <Button
              type="button"
              onClick={postBanner}
              disabled={posting || !imageUrl.trim()}
              className="flex-1 gap-2 rounded-xl gradient-brand text-white shadow-md text-xs font-bold"
            >
              {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {posting ? 'పోస్ట్ అవుతోంది...' : 'Publish Banner Now'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
