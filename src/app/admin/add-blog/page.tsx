'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { ChevronLeft, LogOut, Save, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import dynamic from 'next/dynamic'
import { ImageUpload } from '@/components/dashboard/image-upload'

const RichTextEditor = dynamic(
  () => import('@/components/agent/rich-text-editor').then((m) => m.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="h-48 w-full rounded-xl border border-slate-200 bg-slate-50 animate-pulse" />
    ),
  },
)

export default function AddBlogPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [metaDesc, setMetaDesc] = useState('')
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState('ప్రభుత్వ పథకాలు')
  const [isPublished, setIsPublished] = useState(true)
  const [saving, setSaving] = useState(false)

  // Auth Guard
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.replace('/')
    }
  }, [status, session, router])

  // Auto-slug from title
  useEffect(() => {
    if (!slug && title) {
      setSlug(
        title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .slice(0, 100)
      )
    }
  }, [title, slug])

  if (status === 'loading') {
    return (
      <div className="grid h-screen place-items-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'ADMIN') {
    return null // Will redirect
  }

  async function submit() {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and Content are required')
      return
    }
    setSaving(true)
    try {
      const tagArr = tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)

      const res = await fetch('/api/admin/blogs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          slug: slug || undefined,
          content,
          coverImage: image,
          category,
          excerpt: metaDesc,
          tags: tagArr.length ? tagArr : undefined,
          isPublished,
        }),
      })

      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed to publish')

      toast.success('Blog post published successfully!')
      router.push('/admin')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to publish')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-16">
      {/* Panel Header: Back, Title, Logout */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push('/admin')}
              className="h-9 w-9 border border-slate-200"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-base font-black text-slate-900">Add Blog</h1>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Admin Panel Editor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={() => signOut({ callbackUrl: '/' })}
              variant="ghost"
              size="sm"
              className="gap-1.5 text-red-500 hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Editor Content Area */}
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-6 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-semibold text-slate-600">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog post title…"
              className="text-sm font-medium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category" className="text-xs font-semibold text-slate-600">
              Blog Category *
            </Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-900 focus:border-blue-500 focus:outline-none"
            >
              <option value="ప్రభుత్వ పథకాలు">ప్రభుత్వ పథకాలు</option>
              <option value="తెలంగాణ వార్తలు">తెలంగాణ వార్తలు</option>
              <option value="ఉద్యోగ సమాచారం">ఉద్యోగ సమాచారం</option>
              <option value="విద్యా సమాచారం">విద్యా సమాచారం</option>
              <option value="వ్యాపార చిట్కాలు">వ్యాపార చిట్కాలు</option>
              <option value="పట్టణ సమాచారం">పట్టణ సమాచారం</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="text-xs font-semibold text-slate-600">
              Slug (auto-generated)
            </Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="auto-from-title"
              className="font-mono text-xs"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-600">Cover Image</Label>
            <ImageUpload value={image} onChange={setImage} folder="blog" aspect="video" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-600">Content *</Label>
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="Write the blog post content here…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="excerpt" className="text-xs font-semibold text-slate-600">
              Excerpt / Meta Description
            </Label>
            <Textarea
              id="excerpt"
              value={metaDesc}
              onChange={(e) => setMetaDesc(e.target.value)}
              placeholder="Short excerpt summarizing the blog post…"
              rows={3}
              maxLength={160}
            />
            <p className="text-right text-[10px] text-slate-400">{metaDesc.length}/160</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-xs font-semibold text-slate-600">
              Tags (comma-separated)
            </Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="blog, choutuppal, updates"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="isPublished"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <Label htmlFor="isPublished" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Publish immediately (Set status to PUBLISHED)
            </Label>
          </div>

          <div className="flex gap-3 border-t border-slate-100 pt-6">
            <Button
              variant="outline"
              onClick={() => router.push('/admin')}
              className="flex-1"
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={submit}
              disabled={saving}
              className="flex-1 gap-2 gradient-brand text-white shadow-md shadow-blue-500/20"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Publish Post
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
