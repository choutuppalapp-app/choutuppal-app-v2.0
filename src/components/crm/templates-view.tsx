'use client'

import { useState, useEffect } from 'react'
import { FileText, Plus, Copy, Loader2, RefreshCw, Sparkles, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export function TemplatesView() {
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState('TEXT')
  const [textMessage, setTextMessage] = useState('')
  const [saving, setSaving] = useState(false)

  async function fetchTemplates() {
    setLoading(true)
    try {
      const res = await fetch('/api/crm/templates')
      const json = await res.json()
      if (res.ok) {
        setTemplates(json.templates || [])
      } else {
        toast.error('Failed to load templates')
      }
    } catch {
      toast.error('Network error loading templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function handleCreateTemplate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !textMessage.trim()) {
      toast.error('Template name and content required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/crm/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, type, textMessage }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create template')

      toast.success('Template created successfully!')
      setCreateOpen(false)
      setName('')
      setTextMessage('')
      fetchTemplates()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Create error')
    } finally {
      setSaving(false)
    }
  }

  function handleCopyText(text: string) {
    navigator.clipboard.writeText(text)
    toast.success('Template message copied to clipboard!')
  }

  return (
    <div className="flex h-full w-full flex-col bg-gray-50 p-4 md:p-6 space-y-5 overflow-y-auto fancy-scroll font-sans text-gray-900">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 bg-white p-4 rounded-2xl border shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
            WhatsApp Template Library <FileText className="h-4 w-4 text-emerald-600" />
          </h2>
          <p className="text-xs text-gray-500">
            Manage reusable messages, revenue pitches & festival broadcast templates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTemplates}
            disabled={loading}
            className="gap-1.5 border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>

          <Button
            onClick={() => setCreateOpen(true)}
            size="sm"
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 shadow-xs"
          >
            <Plus className="h-4 w-4" /> Create Template
          </Button>
        </div>
      </div>

      {/* Grid of Templates */}
      {loading && templates.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-xs text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin mr-2 text-emerald-600" /> Loading templates...
        </div>
      ) : templates.length === 0 ? (
        <div className="p-8 text-center text-xs text-gray-400 bg-white rounded-2xl border border-dashed border-gray-200">
          No templates found. Click "Create Template" to add your first template.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((tpl) => {
            const messageText = typeof tpl.payload === 'object' && tpl.payload?.text
              ? tpl.payload.text
              : typeof tpl.payload === 'string'
              ? tpl.payload
              : 'Template Message Payload'

            return (
              <div
                key={tpl.id}
                className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs transition hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                    <h3 className="font-bold text-xs text-gray-900 truncate">{tpl.name}</h3>
                    <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 border border-emerald-200">
                      {tpl.type}
                    </span>
                  </div>

                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap line-clamp-4 bg-gray-50 p-2.5 rounded-xl border border-gray-100 font-sans">
                    {messageText}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2 border-t border-gray-100 text-[10px] text-gray-400">
                  <span>{new Date(tpl.createdAt).toLocaleDateString()}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopyText(messageText)}
                    className="h-6 gap-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 px-2"
                  >
                    <Copy className="h-3 w-3" /> Copy Text
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Create Template Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md bg-white border-gray-200 text-gray-900 font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Plus className="h-5 w-5 text-emerald-600" /> Create New WhatsApp Template
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Save custom greeting, ad pitch, or festival broadcast templates for instant reuse.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTemplate} className="space-y-3.5 py-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Template Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Festival Offer Pitch"
                className="border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category / Type</label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger className="border-gray-200 bg-white text-xs text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-xs">
                  <SelectItem value="TEXT">General Text</SelectItem>
                  <SelectItem value="REVENUE_PITCH">Revenue Pitch</SelectItem>
                  <SelectItem value="ONBOARDING">User Onboarding</SelectItem>
                  <SelectItem value="GREETING">Festival Greeting</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Message Content *</label>
              <Textarea
                value={textMessage}
                onChange={(e) => setTextMessage(e.target.value)}
                placeholder="Type the message template text..."
                rows={5}
                className="border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400 font-sans"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 mt-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Save Template to Library
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
