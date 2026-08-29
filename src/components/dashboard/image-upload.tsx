'use client'
import Image from 'next/image';

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X, Link as LinkIcon, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { ImageUploader } from '@/components/ui/image-uploader'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ImageUploadProps {
  value: string | null | undefined
  onChange: (url: string | null) => void
  folder?: string
  aspect?: 'square' | 'video' | 'auto'
  label?: string
  className?: string
}

/**
 * Single-image uploader with dual File Upload and Image URL paste modes.
 */
export function ImageUpload({
  value,
  onChange,
  folder = 'uploads',
  aspect = 'square',
  label,
  className,
}: ImageUploadProps) {
  return (
    <ImageUploader
      value={value}
      onChange={(url) => onChange(url || null)}
      folder={folder}
      aspect={aspect}
      label={label}
      className={className}
    />
  )
}

/* -------------------------------------------------------------------------- */

interface GalleryUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  folder?: string
  max?: number
  label?: string
}

/** Multi-image gallery uploader supporting File Upload and URL Entry. */
export function GalleryUpload({
  value,
  onChange,
  folder = 'uploads',
  max = 5,
  label,
}: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const remaining = max - value.length
    const toUpload = Array.from(files).slice(0, remaining)
    if (toUpload.length === 0) {
      toast.error(`Max ${max} images`)
      return
    }
    setLoading(true)
    try {
      const form = new FormData()
      for (const f of toUpload) form.append('files', f)
      form.append('folder', folder)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Upload failed')
      onChange([...value, ...json.files.map((f: { url: string }) => f.url)])
      toast.success(`${json.files.length} image(s) uploaded`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleAddUrl() {
    if (!urlInput.trim()) return
    if (value.length >= max) {
      toast.error(`Max ${max} images`)
      return
    }
    onChange([...value, urlInput.trim()])
    setUrlInput('')
    setShowUrlInput(false)
    toast.success('Gallery image URL added')
  }

  return (
    <div className="space-y-2">
      {label ? <p className="text-xs font-semibold text-slate-600">{label}</p> : null}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {value.map((url, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
            <Image width={800} height={800} loading="lazy" decoding="async" src={url} alt={`gallery ${i + 1}`} className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(value.filter((_, idx) => idx !== i))}
              className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
              aria-label="Remove"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}

        {value.length < max ? (
          <div className="flex flex-col gap-1 aspect-square">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={loading}
              className="flex-1 grid place-items-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-blue-400 hover:text-blue-600"
              title="Upload File"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin text-blue-500" /> : <ImagePlus className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-[10px] py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 font-medium text-center flex items-center justify-center gap-0.5"
            >
              <LinkIcon className="h-3 w-3" />
              +URL
            </button>
          </div>
        ) : null}
      </div>

      {showUrlInput && (
        <div className="flex items-center gap-2 pt-1">
          <Input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL..."
            className="text-xs h-8"
          />
          <Button size="sm" type="button" onClick={handleAddUrl} disabled={!urlInput.trim()} className="h-8 text-xs gap-1">
            <Check className="h-3 w-3" /> Add
          </Button>
        </div>
      )}

      <p className="text-[11px] text-slate-400">{value.length}/{max} images · File upload or image URL supported</p>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
