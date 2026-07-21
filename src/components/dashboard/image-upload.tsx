'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

interface ImageUploadProps {
  value: string | null | undefined
  onChange: (url: string | null) => void
  folder?: string
  aspect?: 'square' | 'video' | 'auto'
  label?: string
  className?: string
}

/**
 * Single-image uploader. Compresses + uploads to R2 via /api/upload and
 * surfaces the resulting URL. Shows a live preview and a remove button.
 */
export function ImageUpload({
  value,
  onChange,
  folder = 'uploads',
  aspect = 'square',
  label,
  className,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

  const aspectClass =
    aspect === 'square' ? 'aspect-square' : aspect === 'video' ? 'aspect-video' : 'aspect-auto'

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const file = files[0]
    setLoading(true)
    try {
      const form = new FormData()
      form.append('files', file)
      form.append('folder', folder)
      const res = await fetch('/api/upload', { method: 'POST', body: form })
      const json = await res.json()
      if (!res.ok || !json.ok) {
        throw new Error(json.error || 'Upload failed')
      }
      onChange(json.files[0].url)
      toast.success('Image uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setLoading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? <p className="text-xs font-semibold text-slate-600">{label}</p> : null}
      <div
        className={cn(
          'group relative overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-white/60 transition hover:border-blue-400',
          aspectClass,
        )}
      >
        {value ? (
          <>
            { }
            <img src={value} alt="preview" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white opacity-0 transition group-hover:opacity-100"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="grid h-full w-full place-items-center text-slate-400 hover:text-blue-600"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <ImagePlus className="h-6 w-6" />
                <span className="text-[11px] font-medium">Upload</span>
              </div>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
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

/** Multi-image gallery uploader (up to `max` images). */
export function GalleryUpload({
  value,
  onChange,
  folder = 'uploads',
  max = 5,
  label,
}: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="space-y-1.5">
      {label ? <p className="text-xs font-semibold text-slate-600">{label}</p> : null}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
        {value.map((url, i) => (
          <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200">
            { }
            <img src={url} alt={`gallery ${i + 1}`} className="h-full w-full object-cover" />
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
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="grid aspect-square place-items-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-blue-400 hover:text-blue-600"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin text-blue-500" /> : <ImagePlus className="h-5 w-5" />}
          </button>
        ) : null}
      </div>
      <p className="text-[11px] text-slate-400">{value.length}/{max} images · compressed to ~500KB</p>
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
