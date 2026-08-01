'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Newspaper, BookOpen, Video, Tag, MapPin, Plus, Trash2, Loader2, RefreshCw, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ShortsManager } from './shorts-manager'
import { AdminContentModal } from './admin-content-modal'
import { AddListingModal } from '@/components/dashboard/add-listing-modal'

/* -------------------------------------------------------------------------- */
/* Types                                                                       */
/* -------------------------------------------------------------------------- */

interface ContentData {
  news: Array<{ id: string; title: string; slug: string; isPublished: boolean; createdAt: string; author: { name: string | null } }>
  blogs: Array<{ id: string; title: string; slug: string; isPublished: boolean; createdAt: string; author: { name: string | null } }>
  shorts: Array<{ id: string; title: string | null; youtubeId: string | null; views: number; createdAt: string; owner: { name: string | null } }>
  categories: Array<{ id: string; name: string; slug: string; icon: string | null }>
  villages: Array<{ id: string; name: string; slug: string; district: string | null; pincode: string | null }>
}

/* -------------------------------------------------------------------------- */
/* Main ContentTab                                                             */
/* -------------------------------------------------------------------------- */

export function ContentTab() {
  const router = useRouter()
  const [data, setData] = useState<ContentData | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Quick Actions modal states
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [defaultType, setDefaultType] = useState<'business' | 'service' | 'realestate'>('business')

  function openAddModal(type: 'business' | 'realestate') {
    setDefaultType(type)
    setAddModalOpen(true)
  }

  const load = useCallback(() => {
    setLoading(true)
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((j) => j.ok && setData(j))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    let active = true
    fetch('/api/admin/content')
      .then((r) => r.json())
      .then((j) => { if (active && j.ok) setData(j) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  if (loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Content Management</h2>
          <p className="text-sm text-slate-500">Manage News, Blogs, Shorts, Categories & Villages</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      <Tabs defaultValue="news">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="news" className="gap-1 text-xs"><Newspaper className="h-3.5 w-3.5" /> News</TabsTrigger>
          <TabsTrigger value="blogs" className="gap-1 text-xs"><BookOpen className="h-3.5 w-3.5" /> Blogs</TabsTrigger>
          <TabsTrigger value="shorts" className="gap-1 text-xs"><Video className="h-3.5 w-3.5" /> Shorts</TabsTrigger>
          <TabsTrigger value="categories" className="gap-1 text-xs"><Tag className="h-3.5 w-3.5" /> Categories</TabsTrigger>
          <TabsTrigger value="villages" className="gap-1 text-xs"><MapPin className="h-3.5 w-3.5" /> Villages</TabsTrigger>
        </TabsList>

        <TabsContent value="news" className="mt-4">
          <div className="mb-3 flex justify-end">
            <Button size="sm" className="gap-1.5 gradient-brand text-white" onClick={() => router.push('/admin/add-news')}>
              <Plus className="h-4 w-4" /> Add New News
            </Button>
          </div>
          <ItemList
            title="News Articles"
            items={data?.news ?? []}
            onDelete={(id) => del('news', id, load)}
            render={(n) => ({
              title: n.title,
              subtitle: `by ${n.author.name ?? 'Unknown'} · /${n.slug}`,
              badge: n.isPublished ? 'Live' : 'Pending',
              badgeClass: n.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
            })}
          />
        </TabsContent>

        <TabsContent value="blogs" className="mt-4">
          <div className="mb-3 flex justify-end">
            <Button size="sm" className="gap-1.5 gradient-brand text-white" onClick={() => router.push('/admin/add-blog')}>
              <Plus className="h-4 w-4" /> Add New Blog
            </Button>
          </div>
          <ItemList
            title="Blog Posts"
            items={data?.blogs ?? []}
            onDelete={(id) => del('blogs', id, load)}
            render={(b) => ({
              title: b.title,
              subtitle: `by ${b.author.name ?? 'Unknown'} · /${b.slug}`,
              badge: b.isPublished ? 'Live' : 'Pending',
              badgeClass: b.isPublished ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
            })}
          />
        </TabsContent>

        <TabsContent value="shorts" className="mt-4">
          <ShortsManager />
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <CategoryManager categories={data?.categories ?? []} onChanged={load} />
        </TabsContent>

        <TabsContent value="villages" className="mt-4">
          <VillageManager villages={data?.villages ?? []} onChanged={load} />
        </TabsContent>
      </Tabs>

      <AddListingModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        villages={data?.villages ?? []}
        categories={data?.categories ?? []}
        defaultType={defaultType}
      />
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Shared delete + item list                                                   */
/* -------------------------------------------------------------------------- */

async function del(type: string, id: string, onDone: () => void) {
  if (!confirm('Delete this item permanently?')) return
  try {
    const res = await fetch(`/api/admin/content/${type}/${id}`, { method: 'DELETE' })
    if (!res.ok) throw new Error('Failed')
    toast.success('Deleted')
    onDone()
  } catch {
    toast.error('Failed to delete')
  }
}

function ItemList<T extends { id: string }>({
  title,
  items,
  onDelete,
  render,
}: {
  title: string
  items: T[]
  onDelete: (id: string) => void
  render: (item: T) => { title: string; subtitle: string; badge: string; badgeClass: string }
}) {
  return (
    <div className="rounded-2xl glass">
      <div className="border-b border-slate-100 p-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">{title} ({items.length})</h3>
      </div>
      <div className="max-h-[50vh] overflow-y-auto fancy-scroll divide-y divide-slate-100">
        {items.length === 0 ? (
          <p className="p-6 text-center text-sm text-slate-400">No items yet.</p>
        ) : (
          items.map((item) => {
            const r = render(item)
            return (
              <div key={item.id} className="flex items-center gap-3 p-3 hover:bg-white/50">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{r.title}</p>
                  <p className="truncate text-[11px] text-slate-400">{r.subtitle}</p>
                </div>
                <Badge className={cn('text-[10px]', r.badgeClass)}>{r.badge}</Badge>
                <button
                  onClick={() => onDelete(item.id)}
                  aria-label="Delete"
                  className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Category Manager (create + delete)                                          */
/* -------------------------------------------------------------------------- */

function CategoryManager({ categories, onChanged }: { categories: ContentData['categories']; onChanged: () => void }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [busy, setBusy] = useState(false)

  async function add() {
    if (!name.trim()) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/content/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), icon: icon.trim() || undefined }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Category added')
      setName('')
      setIcon('')
      onChanged()
    } catch {
      toast.error('Failed to add')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl glass p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Add Category</h3>
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category Name (e.g. Furniture & Decor)" onKeyDown={(e) => e.key === 'Enter' && add()} />
            <Input value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="Lucide Icon (e.g. Store)" className="max-w-[180px] font-mono text-xs" onKeyDown={(e) => e.key === 'Enter' && add()} />
            <Button onClick={add} disabled={busy || !name.trim()} className="gap-1.5 gradient-brand text-white">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
            </Button>
          </div>
          <p className="text-[11px] text-slate-400">
            Icon name from <a href="https://lucide.dev/icons" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">lucide.dev/icons</a> (e.g. Store, Home, UtensilsCrossed, Pill). Slug auto-generates from name.
          </p>
        </div>
      </div>
      <div className="rounded-2xl glass">
        <div className="border-b border-slate-100 p-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Categories ({categories.length})</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3">
              <Tag className="h-4 w-4 text-blue-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                <p className="text-[11px] text-slate-400">/{c.slug}{c.icon ? ` · icon: ${c.icon}` : ''}</p>
              </div>
              <button
                onClick={() => del('categories', c.id, onChanged)}
                aria-label="Delete"
                className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Village Manager (create + delete)                                           */
/* -------------------------------------------------------------------------- */

function VillageManager({ villages, onChanged }: { villages: ContentData['villages']; onChanged: () => void }) {
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)

  async function add() {
    if (!name.trim()) return
    setBusy(true)
    try {
      const res = await fetch('/api/admin/content/villages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' }),
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Village added')
      setName('')
      onChanged()
    } catch {
      toast.error('Failed to add')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl glass p-4">
        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Add Village</h3>
        <div className="flex gap-2">
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. New Village Name" onKeyDown={(e) => e.key === 'Enter' && add()} />
          <Button onClick={add} disabled={busy || !name.trim()} className="gap-1.5 gradient-brand text-white">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Add
          </Button>
        </div>
      </div>
      <div className="rounded-2xl glass">
        <div className="border-b border-slate-100 p-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Villages ({villages.length})</h3>
        </div>
        <div className="max-h-[40vh] overflow-y-auto fancy-scroll divide-y divide-slate-100">
          {villages.map((v) => (
            <div key={v.id} className="flex items-center gap-3 p-3">
              <MapPin className="h-4 w-4 text-amber-500" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">{v.name}</p>
                <p className="text-[11px] text-slate-400">/{v.slug} · {v.district} · {v.pincode}</p>
              </div>
              <button
                onClick={() => del('villages', v.id, onChanged)}
                aria-label="Delete"
                className="grid h-8 w-8 place-items-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
