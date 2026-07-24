'use client'

import { useState, useRef } from 'react'
import { Plus, Loader2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/dashboard/image-upload'
import { RichTextEditor } from '@/components/agent/rich-text-editor'

interface AdminContentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'news' | 'blog'
  onCreated: () => void
}

export function AdminContentModal({ open, onOpenChange, type, onCreated }: AdminContentModalProps) {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [metaDesc, setMetaDesc] = useState('')
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)

  function reset() {
    setTitle(''); setSlug(''); setContent(''); setImage(null); setMetaDesc(''); setTags('')
  }

  async function submit() {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and Content are required')
      return
    }
    setSaving(true)
    try {
      const tagArr = tags.split(',').map((t) => t.trim()).filter(Boolean)
      const endpoint = type === 'news' ? '/api/admin/news' : '/api/admin/blogs'
      const body = type === 'news'
        ? { title, slug: slug || undefined, content, image, summary: metaDesc, metaDescription: metaDesc, tags: tagArr.length ? tagArr : undefined }
        : { title, slug: slug || undefined, content, coverImage: image, excerpt: metaDesc, tags: tagArr.length ? tagArr : undefined }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed')
      toast.success(`${type === 'news' ? 'News' : 'Blog'} published!`)
      reset()
      onOpenChange(false)
      onCreated()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-3xl p-0 fancy-scroll">
        <DialogHeader className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
          <DialogTitle className="text-lg font-black text-slate-900">
            Add New {type === 'news' ? 'News' : 'Blog'}
          </DialogTitle>
          <DialogDescription className="text-xs">Auto-published immediately.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 p-6">
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-600">Title *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter title…" />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-600">Slug (auto-gen if empty)</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-from-title" className="font-mono text-xs" />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-600">{type === 'news' ? 'Featured' : 'Cover'} Image</Label>
            <ImageUpload value={image} onChange={setImage} folder={type} aspect="video" />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-600">Content *</Label>
            <RichTextEditor value={content} onChange={setContent} placeholder="Write the article…" />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-600">{type === 'news' ? 'Summary' : 'Excerpt'} / Meta Description</Label>
            <Textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} placeholder="Short description…" rows={2} maxLength={160} />
          </div>
          <div>
            <Label className="mb-1 block text-xs font-semibold text-slate-600">Tags (comma-separated)</Label>
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="choutuppal, local, news" />
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={saving} className="gap-2 gradient-brand text-white">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Publish {type === 'news' ? 'News' : 'Blog'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
