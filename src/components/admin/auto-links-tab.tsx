'use client'

import { useState, useEffect } from 'react'
import { Link2, Plus, Trash2, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface AutoLinkItem {
  id: string
  keyword: string
  url: string
  type: string
  createdAt: string
}

export function AutoLinksTab() {
  const [links, setLinks] = useState<AutoLinkItem[]>([])
  const [loading, setLoading] = useState(true)
  const [adding, setAdding] = useState(false)

  const [keyword, setKeyword] = useState('')
  const [url, setUrl] = useState('')
  const [type, setType] = useState('affiliate')

  async function fetchLinks() {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/autolinks')
      const json = await res.json()
      if (json.ok) {
        setLinks(json.autoLinks || [])
      }
    } catch {
      toast.error('Failed to load auto links')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLinks()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!keyword.trim() || !url.trim()) {
      toast.error('Please enter both keyword and URL')
      return
    }

    setAdding(true)
    try {
      const res = await fetch('/api/admin/autolinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, url, type }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to add link')

      toast.success('Auto link added successfully!')
      setKeyword('')
      setUrl('')
      setType('affiliate')
      fetchLinks()
    } catch (err: any) {
      toast.error(err.message || 'Something went wrong')
    } finally {
      setAdding(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this auto link?')) return
    try {
      const res = await fetch(`/api/admin/autolinks/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (json.ok) {
        toast.success('Auto link deleted')
        setLinks((prev) => prev.filter((l) => l.id !== id))
      } else {
        throw new Error(json.error || 'Failed')
      }
    } catch {
      toast.error('Failed to delete auto link')
    }
  }

  return (
    <div className="space-y-6">
      {/* Add New Link Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Link2 className="h-5 w-5 text-blue-600" /> Add Auto Link / Affiliate Rule
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          Keywords will be automatically converted to hyperlinked text across News &amp; Blog articles.
        </p>

        <form onSubmit={handleAdd} className="mt-4 grid gap-4 sm:grid-cols-4">
          <div className="space-y-1">
            <Label className="text-xs">Target Keyword *</Label>
            <Input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="e.g. Amazon, Real Estate, Hyderabad"
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <Label className="text-xs">Target URL *</Label>
            <Input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs">Link Type</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="affiliate">Affiliate (sponsored nofollow)</SelectItem>
                <SelectItem value="internal">Internal (dofollow)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="sm:col-span-4 flex justify-end">
            <Button type="submit" disabled={adding} className="gap-2 gradient-brand text-white text-xs h-9">
              {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Save Auto Link Rule
            </Button>
          </div>
        </form>
      </div>

      {/* Auto Links List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Active Auto Links ({links.length})</h3>
          <Button variant="ghost" size="sm" onClick={fetchLinks} className="gap-1 text-xs text-slate-600">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-500">Loading auto links...</div>
        ) : links.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">No auto link rules created yet.</div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600">
                  <th className="p-2.5 font-semibold">Keyword</th>
                  <th className="p-2.5 font-semibold">Target URL</th>
                  <th className="p-2.5 font-semibold">Type</th>
                  <th className="p-2.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {links.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-bold text-slate-900">{item.keyword}</td>
                    <td className="p-2.5 max-w-xs truncate text-blue-600">
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline">
                        <span className="truncate">{item.url}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    </td>
                    <td className="p-2.5">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        item.type === 'affiliate' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {item.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
