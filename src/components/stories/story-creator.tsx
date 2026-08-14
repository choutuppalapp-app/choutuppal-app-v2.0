'use client'

import { useRef, useState } from 'react'
import { Loader2, UploadCloud, X, Send, Image as ImageIcon, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ImageUploader } from '@/components/ui/image-uploader'

interface StoryCreatorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (story: {
    id: string
    mediaUrl: string
    mediaType: string
    caption: string | null
    views: number
    expiresAt: string
    createdAt: string
    owner: { id: string; name: string | null; username: string | null; image: string | null }
  }) => void
}

export function StoryCreator({ open, onOpenChange, onCreated }: StoryCreatorProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO'>('IMAGE')
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [posting, setPosting] = useState(false)

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const form = new FormData()
      form.append('files', file)
      form.append('folder', 'stories')
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Upload failed')
      setMediaUrl(j.files[0].url)
      setMediaType(file.type.startsWith('video/') ? 'VIDEO' : 'IMAGE')
      toast.success('Media uploaded')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  async function postStory() {
    if (!mediaUrl) {
      toast.error('Please upload a photo or video first')
      return
    }
    setPosting(true)
    try {
      const res = await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mediaUrl, mediaType, caption: caption.trim() || undefined }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || j.message || 'Failed to post')
      toast.success('Story posted! It will auto-expire in 24h.')
      onCreated(j.story)
      reset()
      onOpenChange(false)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to post'
      if (msg === 'PREMIUM_REQUIRED') {
        toast.error('స్టోరీలు పోస్ట్ చేయడం కేవలం ప్రీమియం యూజర్లకే. ఇప్పుడే అప్‌గ్రేడ్ చేయండి!')
      } else {
        toast.error(msg)
      }
    } finally {
      setPosting(false)
    }
  }

  function reset() {
    setMediaUrl(null)
    setCaption('')
    setMediaType('IMAGE')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-3xl p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="text-lg font-black text-slate-900">Create Story</DialogTitle>
          <DialogDescription className="text-xs">
            Upload a photo or video. Stories auto-delete after 24 hours.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6 pt-2">
          {/* Upload zone / preview */}
          <ImageUploader
            value={mediaUrl}
            onChange={(url) => {
              setMediaUrl(url || null)
              if (url?.match(/\.(mp4|webm|ogg|mov)$/i)) {
                setMediaType('VIDEO')
              } else {
                setMediaType('IMAGE')
              }
            }}
            folder="stories"
            aspect="square"
            label="Story Media (Photo or Video URL)"
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) handleFile(f)
            }}
          />

          {/* Caption */}
          <div>
            <Label className="mb-1.5 block text-xs font-semibold text-slate-600">Caption (optional)</Label>
            <Textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption…"
              rows={2}
              maxLength={500}
            />
            <p className="mt-1 text-right text-[10px] text-slate-400">{caption.length}/500</p>
          </div>

          {/* Post */}
          <Button
            onClick={postStory}
            disabled={!mediaUrl || posting}
            className="w-full gap-2 gradient-brand text-white"
          >
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Post Story
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
