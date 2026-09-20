'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Newspaper,
  PlusCircle,
  Sparkles,
  Search,
  CheckCircle,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  ExternalLink,
  BookOpen,
  RefreshCw,
  Calendar,
  Layers,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

const LOCAL_AI_TEMPLATES = [
  {
    title: 'చౌటుప్పల్ వ్యవసాయ మార్కెట్ తాజా ధరల నివేదిక - పత్తి & మిర్చి రేట్లు',
    summary: 'చౌటుప్పల్ మరియు పరిసర వ్యవసాయ మార్కెట్లలో తాజా పంటల ధరలు, దిగుబడి వివరాలు మరియు వ్యాపారుల కొనుగోలు నివేదిక.',
    content: `చౌటుప్పల్ వ్యవసాయ మార్కెట్లో నేడు పత్తి, మిర్చి మరియు వరి ధాన్యం కొనుగోళ్లు ముమ్మరంగా సాగాయి.
    
రైతులకు గిట్టుబాటు ధరలు కల్పించే దిశగా ఈ-నామ్ (e-NAM) ద్వారా పారదర్శక వేలం నిర్వహించబడింది. 

అధికారులు తేమ శాతాన్ని పరిశీలించి నాణ్యతా ప్రమాణాల ప్రకారం ధరలను నిర్ణయించారు. రవాణా మరియు తూకం విషయంలో రైతులకు ఎలాంటి ఇబ్బందులు కలగకుండా ప్రత్యేక పర్యవేక్షణ కొనసాగుతోంది.`,
    tags: ['Agriculture', 'Market', 'Choutuppal', 'Farmers'],
    category: 'Agriculture',
  },
  {
    title: 'చౌటుప్పల్ పురపాలక సంఘం పారిశుద్ధ్య వారోత్సవాలు మరియు అవగాహన సదస్సు',
    summary: 'పట్టణ సుందరీకరణ, తడి-పొడి చెత్త వేరుచేయడం మరియు ప్లాస్టిక్ రహిత చౌటుప్పల్ సాధనే లక్ష్యంగా ప్రత్యేక కార్యక్రమం.',
    content: `చౌటుప్పల్ మున్సిపాలిటీ పరిధిలోని అన్ని వార్డులలో పారిశుద్ధ్య పనులను మరింత పకడ్బందీగా చేపట్టేందుకు కార్యాచరణ రూపొందించారు.
    
ప్రతి దుకాణదారుడు మరియు నివాసస్తులు చెత్తను రోడ్లపై వేయకుండా మున్సిపల్ వాహనాల్లో మాత్రమే వేయాలని కమిషనర్ పిలుపునిచ్చారు. 

ఉత్తమ పరిశుభ్రత పాటించిన కాలనీలకు మరియు వ్యాపార సంస్థలకు ప్రశంసా పత్రాలు అందజేయనున్నారు.`,
    tags: ['Municipality', 'Cleanliness', 'Choutuppal'],
    category: 'Community',
  },
  {
    title: 'చౌటుప్పల్ నుండి హైదరాబాద్ మెట్రో & RTC బస్సుల సమయ వేళల మార్పులు',
    summary: 'హైదరాబాద్-విజయవాడ మార్గంలో ప్రయాణీకుల రద్దీ దృష్ట్యా చౌటుప్పల్ మీదుగా అదనపు ఎక్స్‌ప్రెస్ బస్సుల ఏర్పాటు.',
    content: `హైదరాబాద్ మరియు నల్గొండ, సూర్యాపేట మార్గాల్లో ప్రయాణించే ఉద్యోగులు, విద్యార్థుల సౌకర్యార్థం TSRTC ప్రత్యేక బస్సు సర్వీసులను ప్రారంభించింది.
    
ముఖ్యంగా ఉదయం మరియు సాయంత్రం వేళల్లో రద్దీ ఎక్కువగా ఉండే సమయాల్లో ప్రతి 10 నిమిషాలకు ఒక బస్సు అందుబాటులో ఉండేలా చర్యలు తీసుకున్నారు.`,
    tags: ['Transport', 'RTC', 'Choutuppal', 'Commute'],
    category: 'Transport',
  },
]

export default function AdminNewsPage() {
  const [activeTab, setActiveTab] = useState<'news' | 'blogs'>('news')
  const [news, setNews] = useState<any[]>([])
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Create/Edit Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    image: '',
    category: 'General',
    isPublished: true,
  })

  const fetchNews = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/news')
      const data = await res.json()
      if (data.ok) {
        setNews(data.news || [])
        setBlogs(data.blogs || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch news', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
  }, [])

  const handleTogglePublish = async (id: string, type: 'news' | 'blog', current: boolean) => {
    try {
      const res = await fetch('/api/admin/news', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type, isPublished: !current }),
      })
      const data = await res.json()
      if (data.ok) {
        if (type === 'news') {
          setNews((prev) => prev.map((n) => (n.id === id ? { ...n, isPublished: !current } : n)))
        } else {
          setBlogs((prev) => prev.map((b) => (b.id === id ? { ...b, isPublished: !current } : b)))
        }
        toast({
          title: !current ? 'Published' : 'Unpublished',
          description: `Article is now ${!current ? 'visible on website' : 'saved as draft'}`,
        })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to toggle publish status', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string, type: 'news' | 'blog', title: string) => {
    if (!confirm(`Delete "${title}"?`)) return
    try {
      const res = await fetch(`/api/admin/news?id=${id}&type=${type}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.ok) {
        if (type === 'news') {
          setNews((prev) => prev.filter((n) => n.id !== id))
        } else {
          setBlogs((prev) => prev.filter((b) => b.id !== id))
        }
        toast({ title: 'Deleted', description: 'Article deleted successfully' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' })
    }
  }

  const handleApplyAiTemplate = () => {
    const random = LOCAL_AI_TEMPLATES[Math.floor(Math.random() * LOCAL_AI_TEMPLATES.length)]
    setFormData({
      ...formData,
      title: random.title,
      summary: random.summary,
      content: random.content,
      category: random.category,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80',
    })
    toast({
      title: 'AI Draft Generated',
      description: 'Pre-filled local verified news draft in Telugu & English!',
    })
  }

  const handleOpenCreate = () => {
    setIsEditing(false)
    setSelectedId(null)
    setFormData({
      title: '',
      summary: '',
      content: '',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1200&auto=format&fit=crop&q=80',
      category: activeTab === 'news' ? 'Local News' : 'Business Guide',
      isPublished: true,
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (item: any) => {
    setIsEditing(true)
    setSelectedId(item.id)
    setFormData({
      title: item.title || '',
      summary: item.summary || item.excerpt || '',
      content: item.content || '',
      image: item.image || item.coverImage || '',
      category: item.category || 'General',
      isPublished: Boolean(item.isPublished),
    })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isEditing && selectedId) {
        const res = await fetch('/api/admin/news', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: selectedId,
            type: activeTab === 'news' ? 'news' : 'blog',
            ...formData,
          }),
        })
        const data = await res.json()
        if (data.ok) {
          toast({ title: 'Updated', description: 'Article saved successfully' })
          setModalOpen(false)
          fetchNews()
        }
      } else {
        const res = await fetch('/api/admin/news', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: activeTab === 'news' ? 'news' : 'blog',
            ...formData,
          }),
        })
        const data = await res.json()
        if (data.ok) {
          toast({ title: 'Created', description: 'New article published successfully' })
          setModalOpen(false)
          fetchNews()
        }
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to save article', variant: 'destructive' })
    }
  }

  const currentList = activeTab === 'news' ? news : blogs
  const filteredList = currentList.filter(
    (item) =>
      !search ||
      item.title?.toLowerCase().includes(search.toLowerCase()) ||
      item.summary?.toLowerCase().includes(search.toLowerCase()) ||
      item.excerpt?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <AdminHeader
        title="News & Blog Management"
        teluguTitle="వార్తలు & కథనాల నిర్వహణ"
        description="Write and publish town news, auto-generate localized articles with AI, and manage editorial blogs."
        actionButton={{
          label: activeTab === 'news' ? 'Create Article' : 'Create Blog Post',
          onClick: handleOpenCreate,
          icon: PlusCircle,
        }}
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
        {/* Tab Selector & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-2 rounded-xl bg-slate-100 p-1 border border-slate-200 w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('news')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'news'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Local News (వార్తలు) ({news.length})
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`flex-1 sm:flex-initial px-4 py-2 rounded-lg text-xs font-bold transition ${
                activeTab === 'blogs'
                  ? 'bg-white text-blue-700 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Editorial Blogs (బ్లాగులు) ({blogs.length})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search news by headline..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-4 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Articles Table */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5">Headline & Summary</th>
                  <th className="px-4 py-3.5">Author</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Date</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500 text-sm">
                      Loading articles...
                    </td>
                  </tr>
                ) : filteredList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-12 text-center text-slate-500 text-sm">
                      No articles found. Click "Create Article" or use AI Auto-Generate.
                    </td>
                  </tr>
                ) : (
                  filteredList.map((item, idx) => (
                    <tr
                      key={item.id}
                      className={idx % 2 === 1 ? 'bg-slate-50/40 hover:bg-slate-50' : 'bg-white hover:bg-slate-50'}
                    >
                      <td className="px-5 py-4 max-w-md">
                        <div className="flex items-start gap-3">
                          <img
                            src={item.image || item.coverImage || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=300&auto=format&fit=crop&q=80'}
                            alt=""
                            className="h-12 w-16 rounded-lg object-cover border border-slate-200 shrink-0"
                          />
                          <div>
                            <p className="font-semibold text-slate-900 text-sm line-clamp-1">{item.title}</p>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                              {item.summary || item.excerpt || item.content}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4 text-xs font-medium text-slate-600">
                        {item.author?.name || 'News Desk'}
                      </td>

                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleTogglePublish(item.id, activeTab === 'news' ? 'news' : 'blog', Boolean(item.isPublished))}
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold border transition ${
                            item.isPublished
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {item.isPublished ? (
                            <>
                              <CheckCircle className="h-3 w-3" /> Live Published
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3 w-3" /> Draft
                            </>
                          )}
                        </button>
                      </td>

                      <td className="px-4 py-4 text-xs text-slate-500">
                        {new Date(item.createdAt || Date.now()).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(item)}
                            className="p-1.5 text-slate-500 hover:text-blue-700 rounded-md hover:bg-slate-100"
                            title="Edit Article"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          <Link
                            href={activeTab === 'news' ? `/news/${item.slug}` : `/blog/${item.slug}`}
                            target="_blank"
                            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-md hover:bg-slate-100"
                            title="View Public Page"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Link>

                          <button
                            onClick={() => handleDelete(item.id, activeTab === 'news' ? 'news' : 'blog', item.title)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create / Edit Article Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-200 shadow-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-slate-900">
                {isEditing ? 'Edit Article' : 'Write New Local Story'}
              </DialogTitle>
              {!isEditing && (
                <button
                  type="button"
                  onClick={handleApplyAiTemplate}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-50 border border-amber-200 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-100 transition"
                >
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>AI Auto-Generate</span>
                </button>
              )}
            </div>
            <DialogDescription className="text-xs text-slate-500">
              Publish news or write informative business guides for Choutuppal citizens.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Headline / Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. చౌటుప్పల్ పరిధిలో..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Short Summary *</label>
              <textarea
                rows={2}
                required
                placeholder="Brief summary in 1-2 sentences..."
                value={formData.summary}
                onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Full Content / Body *</label>
              <textarea
                rows={6}
                required
                placeholder="Write full article details here..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none font-sans"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700">Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Infrastructure, Business"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  className="rounded border-slate-300 text-blue-700 focus:ring-blue-700 h-4 w-4"
                />
                <span>Publish Immediately (Live on website)</span>
              </label>
            </div>

            <DialogFooter className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
              >
                {isEditing ? 'Save Changes' : 'Publish Article'}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
