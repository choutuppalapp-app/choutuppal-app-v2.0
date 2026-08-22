'use client'

import { useRef, useState } from 'react'
import { Loader2, UploadCloud, X, Send, Image as ImageIcon } from 'lucide-react'
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
import { ImageUploader } from '@/components/ui/image-uploader'

interface BannerCreatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: () => void
}

export function BannerCreator({ open, onOpenChange, onCreated }: BannerCreatorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [link, setLink] = useState('')
  const [position, setPosition] = useState('HOME_TOP')
  const [uploading, setUploading] = useState(false)
  const [posting, setPosting] = useState(false)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('files', file)
      form.append('folder', 'banners')
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      let j;
        try {
          j = await res.json()
        } catch (err) {
          console.error("API Parse Error:", err);
          throw new Error("Failed to submit. Please check all required fields and try again.")
        }
      if (!res.ok || !j.ok) throw new Error(j.error || 'Upload failed')
      setImageUrl(j.files[0].url)
      toast.success('Image uploaded')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function postBanner() {
    if (!imageUrl) {
      toast.error('Please upload a 16:9 banner image first')
      return
    }
    setPosting(true)
    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl,
          title: title.trim() || undefined,
          link: link.trim() || undefined,
          position,
        }),
      })
      let j;
        try {
          j = await res.json()
        } catch (err) {
          console.error("API Parse Error:", err);
          throw new Error("Failed to submit. Please check all required fields and try again.")
        }
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed to create banner')
      toast.success('Banner created! It will auto-expire in 24 hours.')
      reset()
      onOpenChange(false)
      onCreated()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create banner')
    } finally {
      setPosting(false)
    }
  }

  function reset() {
    setImageUrl(null)
    setTitle('')
    setLink('')
    setPosition('HOME_TOP')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg font-black text-slate-900">
            Promote Your Business
          </DialogTitle>
          <DialogDescription className="text-xs">
            Upload a 16:9 banner ad. Runs for 24 hours. ₹99/day — Early Bird FREE.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6 pt-2">
          {/* Upload zone / preview (16:9) */}
          <ImageUploader
            value={imageUrl}
            onChange={(url) => setImageUrl(url || null)}
            folder="banners"
            aspect="video"
            label="Banner Ad Image (16:9)"
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />

          {/* Title */}
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-slate-600">Title (optional)</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Monsoon Mega Sale" />
          </div>

          {/* Link */}
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-slate-600">Link (optional)</Label>
            <Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://… or /business/your-slug" />
          </div>

          {/* Position */}
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-slate-600">Position</Label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="HOME_TOP">Home Top</SelectItem>
                <SelectItem value="HOME_MIDDLE">Home Middle</SelectItem>
                <SelectItem value="SIDEBAR">Sidebar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={postBanner} disabled={!imageUrl || posting} className="w-full gap-2 gradient-brand text-white">
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Promote Now (24h)
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
