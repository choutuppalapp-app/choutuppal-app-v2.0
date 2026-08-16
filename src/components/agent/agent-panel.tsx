'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import {
  UploadCloud,
  FileSpreadsheet,
  TrendingUp,
  Newspaper,
  ChevronLeft,
  Loader2,
  Check,
  FileText,
  Trash2,
  Eye,
  MessageCircle,
  MousePointerClick,
  Download,
  Home,
  LogOut,
  Store,
  ImageIcon,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/dashboard/image-upload'
import { RichTextEditor } from './rich-text-editor'
import { AgentMyListingsTab } from './my-listings-tab'
import { AgentMyRealEstateTab } from './my-real-estate-tab'
import { AgentBannersTab } from './banners-tab'

const CSV_TEMPLATE = `name,category,phone,whatsapp,address,village,description,website
Sai Bhavan,Restaurants & Tiffin,9912345600,919912345600,Main Road,Choutuppal,Andhra meals & tiffin,
Anjali Medical,Medical & Pharmacy,9912345601,919912345601,Hospital Road,Choutuppal,24x7 pharmacy,
`

export function AgentPanel({ agentName }: { agentName: string }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('csv')

  const navItems = [
    { value: 'csv', label: 'CSV Import', icon: UploadCloud },
    { value: 'listings', label: 'My Listings', icon: Store },
    { value: 'realestate', label: 'My Real Estate', icon: Home },
    { value: 'banners', label: 'Banners', icon: ImageIcon },
    { value: 'leads', label: 'Leads', icon: TrendingUp },
    { value: 'editor', label: 'News & Blog', icon: Newspaper },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-3 sm:px-4 lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setDrawerOpen(!drawerOpen)}
            className="md:hidden grid h-9 w-9 place-items-center rounded-lg border border-slate-200"
            title="Toggle Menu"
          >
            <Menu className="h-5 w-5 text-slate-700" />
          </Button>

          <Link href="/" className="hidden md:grid h-9 w-9 place-items-center rounded-lg border border-slate-200" title="Back to home">
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <img src="/logo.png" alt="Choutuppal App" className="h-8 w-auto" />
          <span className="font-bold text-slate-900 text-sm sm:text-base">Agent Panel</span>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/dashboard"
              className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 sm:flex"
            >
              <Home className="h-3.5 w-3.5" /> Dashboard
            </Link>
            <Button
              onClick={() => signOut({ callbackUrl: '/' })}
              variant="outline"
              size="sm"
              className="gap-1.5 border-slate-200 text-xs sm:text-sm"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-50 md:hidden" onClick={() => setDrawerOpen(false)}>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs" />
          <div
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white p-5 shadow-2xl space-y-4 overflow-y-auto transform transition-transform duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <img src="/logo.png" alt="Logo" className="h-7 w-auto" />
                <span className="font-bold text-sm text-slate-900">Agent Navigation</span>
              </div>
              <button onClick={() => setDrawerOpen(false)} aria-label="Close">
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = activeTab === item.value
                return (
                  <button
                    key={item.value}
                    onClick={() => {
                      setActiveTab(item.value)
                      setDrawerOpen(false)
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-xs font-semibold transition',
                      isActive ? 'bg-blue-600 text-white shadow' : 'text-slate-700 hover:bg-slate-100'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      ) : null}

      <main className="mx-auto max-w-6xl px-3 py-6 sm:px-4 lg:px-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex w-full overflow-x-auto no-scrollbar whitespace-nowrap justify-start gap-1.5 p-1 bg-slate-100/80 rounded-xl">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <TabsTrigger key={item.value} value={item.value} className="gap-1.5 text-xs shrink-0 px-3 py-1.5">
                  <Icon className="h-3.5 w-3.5" /> {item.label}
                </TabsTrigger>
              )
            })}
          </TabsList>

          <TabsContent value="csv"><CsvImportTab /></TabsContent>
          <TabsContent value="listings"><AgentMyListingsTab /></TabsContent>
          <TabsContent value="realestate"><AgentMyRealEstateTab /></TabsContent>
          <TabsContent value="banners"><AgentBannersTab /></TabsContent>
          <TabsContent value="leads"><LeadsTab /></TabsContent>
          <TabsContent value="editor"><EditorTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* CSV Import                                                                  */
/* -------------------------------------------------------------------------- */

function CsvImportTab() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  function handleFile(f: File | null) {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a .csv file')
      return
    }
    setFile(f)
  }

  async function importCsv() {
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file)
      const res = await fetch('/api/agent/csv-import', { method: 'POST', body: form })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Import failed')
      toast.success(`${j.added} listing(s) imported · ${j.skipped} skipped`)
      setFile(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Import failed')
    } finally {
      setUploading(false)
    }
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'choutuppal-listings-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-slate-900">Bulk CSV Upload</h2>
        <p className="text-sm text-slate-500">
          Upload a CSV to bulk-create listings (status: PENDING for admin approval).
        </p>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          handleFile(e.dataTransfer.files[0])
        }}
        className={cn(
          'rounded-3xl border-2 border-dashed p-10 text-center transition',
          dragOver ? 'border-blue-400 bg-blue-50/50' : 'border-slate-300 bg-white/60',
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl gradient-brand-soft text-blue-600">
          <FileSpreadsheet className="h-7 w-7" />
        </span>
        {file ? (
          <div className="mt-3">
            <p className="font-semibold text-slate-900">{file.name}</p>
            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
            <Button
              onClick={() => { setFile(null); if (inputRef.current) inputRef.current.value = '' }}
              variant="ghost"
              size="sm"
              className="mt-2 text-xs text-red-600"
            >
              Remove
            </Button>
          </div>
        ) : (
          <>
            <h3 className="mt-3 font-bold text-slate-900">Drop your CSV here</h3>
            <p className="mt-1 text-xs text-slate-500">or click to browse · .csv files only</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-3 gap-1.5"
              onClick={() => inputRef.current?.click()}
            >
              <UploadCloud className="h-4 w-4" /> Choose File
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          onClick={importCsv}
          disabled={!file || uploading}
          className="gap-2 gradient-brand text-white"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
          {uploading ? 'Importing…' : 'Import Listings'}
        </Button>
        <Button variant="outline" onClick={downloadTemplate} className="gap-1.5">
          <Download className="h-4 w-4" /> Download Template
        </Button>
      </div>

      {/* Column mapping help */}
      <div className="rounded-3xl glass p-5">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
          <FileText className="h-4 w-4 text-blue-500" /> CSV Columns
        </h3>
        <p className="mb-3 text-xs text-slate-500">
          These headers are recognised (case-insensitive). Missing columns are ignored.
        </p>
        <div className="flex flex-wrap gap-1.5">
          {['name / title', 'category', 'phone', 'whatsapp', 'address', 'location', 'village', 'email', 'website', 'description / about', 'map / maplink'].map((c) => (
            <Badge key={c} variant="outline" className="font-mono text-[11px] text-slate-600">
              {c}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Leads / Analytics                                                           */
/* -------------------------------------------------------------------------- */

interface LeadSummary {
  totalListings: number
  approved: number
  pending: number
  totalViews: number
  totalWhatsappClicks: number
  totalClicks: number
  totalLeads: number
}
interface LeadListing {
  id: string
  title: string
  slug: string
  status: string
  views: number
  clicks: number
  whatsappClicks: number
  createdAt: string
}

function LeadsTab() {
  const [summary, setSummary] = useState<LeadSummary | null>(null)
  const [listings, setListings] = useState<LeadListing[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/agent/leads')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setSummary(j.summary)
          setListings(j.listings)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let active = true
    fetch('/api/agent/leads')
      .then((r) => r.json())
      .then((j) => {
        if (active && j.ok) {
          setSummary(j.summary)
          setListings(j.listings)
        }
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
  }

  const cards = [
    { label: 'Total Listings', value: summary?.totalListings ?? 0, icon: FileText, grad: 'from-blue-600 to-blue-400', sub: `${summary?.approved ?? 0} approved · ${summary?.pending ?? 0} pending` },
    { label: 'Total Views', value: summary?.totalViews ?? 0, icon: Eye, grad: 'from-amber-500 to-amber-400', sub: 'Across your listings' },
    { label: 'WhatsApp Clicks', value: summary?.totalWhatsappClicks ?? 0, icon: MessageCircle, grad: 'from-emerald-500 to-emerald-400', sub: 'Customer enquiries' },
    { label: 'Total Clicks', value: summary?.totalClicks ?? 0, icon: MousePointerClick, grad: 'from-blue-500 to-amber-400', sub: 'All interactions' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Lead Tracking</h2>
          <p className="text-sm text-slate-500">Analytics for listings you've created.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon
          return (
            <div key={c.label} className="hover-glow rounded-2xl glass p-4">
              <div className={cn('mb-2 grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br text-white shadow', c.grad)}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-2xl font-black text-slate-900">{c.value.toLocaleString('en-IN')}</div>
              <div className="text-xs font-semibold text-slate-700">{c.label}</div>
              <div className="text-[10px] text-slate-400">{c.sub}</div>
            </div>
          )
        })}
      </div>

      {/* Per-listing breakdown */}
      <div className="overflow-hidden rounded-2xl glass">
        <div className="border-b border-slate-100 p-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Per-Listing Performance</h3>
        </div>
        <div className="max-h-[50vh] overflow-y-auto fancy-scroll">
          {listings.length === 0 ? (
            <p className="p-6 text-center text-sm text-slate-500">No listings yet. Use the CSV Import tab to add some.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white/80 backdrop-blur">
                <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="p-3">Listing</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-center">Views</th>
                  <th className="p-3 text-center">WA Clicks</th>
                  <th className="p-3 text-center">Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((l) => (
                  <tr key={l.id} className="hover:bg-white/50">
                    <td className="p-3">
                      <Link href={`/business/${l.slug}`} className="font-semibold text-slate-900 hover:text-blue-600">
                        {l.title}
                      </Link>
                    </td>
                    <td className="p-3 text-center">
                      <Badge className={cn(
                        'text-[10px]',
                        l.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                        l.status === 'PENDING' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                        'bg-red-100 text-red-700 hover:bg-red-100'
                      )}>{l.status}</Badge>
                    </td>
                    <td className="p-3 text-center font-semibold text-slate-700">{l.views}</td>
                    <td className="p-3 text-center font-semibold text-emerald-600">{l.whatsappClicks}</td>
                    <td className="p-3 text-center font-semibold text-slate-700">{l.clicks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* News & Blog Editor                                                          */
/* -------------------------------------------------------------------------- */

function EditorTab() {
  const [type, setType] = useState<'news' | 'blog'>('news')
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [content, setContent] = useState('')
  const [image, setImage] = useState<string | null>(null)
  const [tags, setTags] = useState('')
  const [saving, setSaving] = useState(false)
  const [posts, setPosts] = useState<Array<{ id: string; title: string; slug: string; isPublished: boolean; createdAt: string }>>([])

  const loadPosts = useCallback(() => {
    fetch(`/api/agent/news?type=${type}`)
      .then((r) => r.json())
      .then((j) => j.ok && setPosts(j.items))
      .catch(() => {})
  }, [type])

  useEffect(() => {
    let active = true
    fetch(`/api/agent/news?type=${type}`)
      .then((r) => r.json())
      .then((j) => { if (active && j.ok) setPosts(j.items) })
      .catch(() => {})
    return () => { active = false }
  }, [type])

  // Auto-slug from title when slug is empty
  useEffect(() => {
    if (!slug && title) {
      setSlug(title.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').slice(0, 100))
    }
  }, [title, slug])

  async function save() {
    if (!title.trim() || !content.trim()) {
      toast.error('Title and Content are required')
      return
    }
    setSaving(true)
    try {
      const tagArr = tags.split(',').map((t) => t.trim()).filter(Boolean)
      const res = await fetch('/api/agent/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          title,
          slug: slug || undefined,
          summary: metaDescription,
          excerpt: metaDescription,
          metaTitle,
          metaDescription,
          content,
          image,
          coverImage: image,
          tags: tagArr.length ? tagArr : undefined,
        }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Save failed')
      toast.success(`${type === 'news' ? 'News' : 'Blog'} submitted for approval`)
      reset()
      loadPosts()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  function reset() {
    setTitle(''); setSlug(''); setMetaTitle(''); setMetaDescription('')
    setContent(''); setImage(null); setTags('')
  }

  async function deletePost(id: string) {
    if (!confirm('Delete this post?')) return
    try {
      const res = await fetch(`/api/agent/news/${id}?type=${type}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed')
      toast.success('Deleted')
      loadPosts()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">News & Blog Editor</h2>
          <p className="text-sm text-slate-500">WordPress-style editor. Saved as PENDING for admin approval.</p>
        </div>
        <Select value={type} onValueChange={(v) => setType(v as 'news' | 'blog')}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="news">News</SelectItem>
            <SelectItem value="blog">Blog</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        {/* Main editor */}
        <div className="space-y-4">
          <div className="rounded-3xl glass p-5">
            <Field label="Title *">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter post title…" />
            </Field>
            <Field label="Slug (auto-generated)" className="mt-3">
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="auto-from-title" className="font-mono text-xs" />
            </Field>
            <Field label="Content *" className="mt-3">
              <RichTextEditor value={content} onChange={setContent} placeholder="Write your story… use the toolbar for formatting." />
            </Field>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="rounded-3xl glass p-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Publish</h3>
            <Button onClick={save} disabled={saving} className="w-full gap-2 gradient-brand text-white">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              Submit for Approval
            </Button>
            <Button variant="ghost" onClick={reset} className="mt-2 w-full text-xs text-slate-500">
              Clear form
            </Button>
            <p className="mt-2 text-center text-[11px] text-slate-400">Status: PENDING (admin review)</p>
          </div>

          <div className="rounded-3xl glass p-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Featured Image</h3>
            <ImageUpload value={image} onChange={setImage} folder="news" aspect="video" />
          </div>

          <div className="rounded-3xl glass p-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">SEO</h3>
            <Field label="Meta Title">
              <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="SEO title" maxLength={60} />
            </Field>
            <Field label="Meta Description" className="mt-3">
              <Textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Short description for search engines…" rows={3} maxLength={160} />
              <p className="mt-1 text-right text-[10px] text-slate-400">{metaDescription.length}/160</p>
            </Field>
            <Field label="Tags (comma-separated)" className="mt-3">
              <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="choutuppal, news, local" />
            </Field>
          </div>
        </div>
      </div>

      {/* Existing posts */}
      <div className="rounded-3xl glass p-5">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">
          Your {type === 'news' ? 'News' : 'Blog'} Posts
        </h3>
        {posts.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">No posts yet.</p>
        ) : (
          <div className="space-y-2">
            {posts.map((p) => (
              <div key={p.id} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white/60 p-3">
                <FileText className="h-4 w-4 shrink-0 text-blue-500" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{p.title}</p>
                  <p className="text-[11px] text-slate-400">{new Date(p.createdAt).toLocaleDateString('en-IN')} · /{p.slug}</p>
                </div>
                <Badge className={p.isPublished ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' : 'bg-amber-100 text-amber-700 hover:bg-amber-100'}>
                  {p.isPublished ? 'Live' : 'Pending'}
                </Badge>
                <button
                  onClick={() => deletePost(p.id)}
                  aria-label="Delete"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</Label>
      {children}
    </div>
  )
}
