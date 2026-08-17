'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Plus,
  Copy,
  Loader2,
  RefreshCw,
  Sparkles,
  Send,
  Zap,
  ListFilter,
  Layers,
  MessageSquare,
  Smartphone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { toast } from 'sonner'

export function TemplatesView() {
  const [templates, setTemplates] = useState<any[]>([])
  const [triggers, setTriggers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Creation Modal & Form State
  const [createOpen, setCreateOpen] = useState(false)
  const [templateType, setTemplateType] = useState<'TEXT' | 'BUTTON' | 'LIST' | 'FLOW' | 'TRIGGER'>('TEXT')
  const [name, setName] = useState('')
  const [triggerText, setTriggerText] = useState('')
  const [saving, setSaving] = useState(false)

  // Form Field States
  const [plainText, setPlainText] = useState('')

  // Buttons state (up to 3)
  const [btnText, setBtnText] = useState('')
  const [b1, setB1] = useState('')
  const [b2, setB2] = useState('')
  const [b3, setB3] = useState('')

  // List state (up to 4)
  const [listText, setListText] = useState('')
  const [l1, setL1] = useState('')
  const [l2, setL2] = useState('')
  const [l3, setL3] = useState('')
  const [l4, setL4] = useState('')

  // Flow state (Sequence of 2 messages)
  const [flowMsg1, setFlowMsg1] = useState('')
  const [flowMsg2, setFlowMsg2] = useState('')

  // Trigger state
  const [trigKeyword, setTrigKeyword] = useState('')
  const [trigReplyText, setTrigReplyText] = useState('')

  async function fetchAllData() {
    setLoading(true)
    try {
      const [resTpl, resTrig] = await Promise.all([
        fetch('/api/crm/templates'),
        fetch('/api/crm/triggers'),
      ])
      const jsonTpl = await resTpl.json()
      const jsonTrig = await resTrig.json()

      if (resTpl.ok) setTemplates(jsonTpl.templates || [])
      if (resTrig.ok) setTriggers(jsonTrig.rules || [])
    } catch {
      toast.error('Network error loading templates')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  async function handleSaveTemplate() {
    if (!name.trim()) {
      toast.error('Please enter a template name')
      return
    }

    let payload: any = {}

    if (templateType === 'TEXT') {
      if (!plainText.trim()) return toast.error('Message text is required')
      payload = { text: plainText }
    } else if (templateType === 'BUTTON') {
      if (!btnText.trim()) return toast.error('Main message text is required')
      const buttons = [b1, b2, b3].filter((b) => b.trim()).map((title) => ({ title: title.trim() }))
      if (buttons.length === 0) return toast.error('Add at least 1 button title')
      payload = { text: btnText, buttons }
    } else if (templateType === 'LIST') {
      if (!listText.trim()) return toast.error('Main message text is required')
      const options = [l1, l2, l3, l4].filter((l) => l.trim()).map((title) => ({ title: title.trim() }))
      if (options.length === 0) return toast.error('Add at least 1 list option')
      payload = { text: listText, listOptions: options }
    } else if (templateType === 'FLOW') {
      if (!flowMsg1.trim() || !flowMsg2.trim()) return toast.error('Enter both Message 1 & Message 2 for flow')
      payload = { text: flowMsg1, sequence: [{ delayMs: 2000, message: flowMsg2 }] }
    }

    setSaving(true)
    try {
      const res = await fetch('/api/crm/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          type: templateType,
          triggerText: triggerText.trim() || null,
          payload,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create template')

      toast.success('Template saved to library!')
      setCreateOpen(false)
      resetForm()
      fetchAllData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save error')
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveTriggerRule() {
    if (!trigKeyword.trim() || !trigReplyText.trim()) {
      toast.error('Both Keyword and Reply Text are required')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/crm/triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: trigKeyword, replyText: trigReplyText }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to save trigger')

      toast.success(`Trigger keyword "${trigKeyword}" added live!`)
      setTrigKeyword('')
      setTrigReplyText('')
      fetchAllData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Trigger error')
    } finally {
      setSaving(false)
    }
  }

  function resetForm() {
    setName('')
    setTriggerText('')
    setPlainText('')
    setBtnText('')
    setB1('')
    setB2('')
    setB3('')
    setListText('')
    setL1('')
    setL2('')
    setL3('')
    setL4('')
    setFlowMsg1('')
    setFlowMsg2('')
  }

  return (
    <div className="flex h-full w-full flex-col bg-gray-50 p-4 md:p-6 space-y-5 overflow-y-auto fancy-scroll font-sans text-gray-900">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 bg-white p-4 rounded-2xl border shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
            Master WhatsApp Templates & Exact Triggers <Sparkles className="h-4 w-4 text-emerald-600" />
          </h2>
          <p className="text-xs text-gray-500">
            Build interactive Quick Reply Buttons, List Menus, Flow sequences, and auto-reply keywords.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAllData}
            disabled={loading}
            className="gap-1.5 border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>

          <Button
            onClick={() => {
              resetForm()
              setCreateOpen(true)
            }}
            size="sm"
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-8 shadow-xs"
          >
            <Plus className="h-4 w-4" /> Create Advanced Template
          </Button>
        </div>
      </div>

      {/* Main Content Split: Saved Templates Grid & Keyword Triggers Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Templates Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-emerald-600" /> Saved Templates ({templates.length})
          </h3>

          {loading && templates.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-xs text-gray-500 bg-white rounded-2xl border">
              <Loader2 className="h-5 w-5 animate-spin mr-2 text-emerald-600" /> Loading templates...
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {templates.map((tpl) => {
                const text = typeof tpl.payload === 'object' ? tpl.payload?.text || '' : String(tpl.payload)
                const buttons = tpl.payload?.buttons || []
                const listOpts = tpl.payload?.listOptions || []
                const sequence = tpl.payload?.sequence || []

                return (
                  <div
                    key={tpl.id}
                    className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs transition hover:shadow-xs space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
                        <h4 className="font-bold text-xs text-gray-900 truncate">{tpl.name}</h4>
                        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[9px] font-extrabold text-emerald-700 border border-emerald-200 uppercase">
                          {tpl.type}
                        </span>
                      </div>

                      {tpl.triggerText ? (
                        <div className="mb-2 inline-flex items-center gap-1 rounded bg-amber-50 px-2 py-0.5 text-[9px] font-bold text-amber-800 border border-amber-200">
                          <Zap className="h-2.5 w-2.5 text-amber-600" /> Trigger: "{tpl.triggerText}"
                        </div>
                      ) : null}

                      <p className="text-xs text-gray-800 leading-relaxed bg-gray-50 p-2.5 rounded-xl border border-gray-100 font-sans whitespace-pre-wrap line-clamp-3">
                        {text}
                      </p>

                      {/* Buttons Payload */}
                      {buttons.length > 0 ? (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {buttons.map((b: any, i: number) => (
                            <span key={i} className="rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700 border border-blue-200">
                              [Btn] {b.title}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {/* List Options Payload */}
                      {listOpts.length > 0 ? (
                        <div className="mt-2 space-y-0.5">
                          {listOpts.map((l: any, i: number) => (
                            <span key={i} className="block text-[10px] text-gray-600 font-medium">
                              • {l.title}
                            </span>
                          ))}
                        </div>
                      ) : null}

                      {/* Flow Sequence Payload */}
                      {sequence.length > 0 ? (
                        <div className="mt-2 text-[10px] text-purple-700 italic bg-purple-50 p-1.5 rounded border border-purple-200">
                          ⚡ Flow Step 2 (2s delay): "{sequence[0]?.message}"
                        </div>
                      ) : null}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[10px] text-gray-400">
                      <span>{new Date(tpl.createdAt).toLocaleDateString()}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(text)
                          toast.success('Copied text to clipboard!')
                        }}
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
        </div>

        {/* Right Col: Keyword Trigger Rules Manager */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <Zap className="h-4 w-4 text-amber-500" /> Webhook Trigger Rules ({triggers.length})
          </h3>

          {/* Quick Create Trigger Box */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 space-y-3 shadow-2xs">
            <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1">
              <Zap className="h-3.5 w-3.5 text-amber-600" /> Add Keyword Auto-Reply Rule
            </h4>
            <p className="text-[11px] text-amber-900 leading-tight">
              If incoming message matches exact keyword (e.g., "offer" or "ad"), bot will immediately send the reply without calling Gemini AI.
            </p>

            <div className="space-y-2">
              <Input
                value={trigKeyword}
                onChange={(e) => setTrigKeyword(e.target.value)}
                placeholder="Trigger Keyword (e.g., offer)"
                className="h-8 border-amber-200 bg-white text-xs text-gray-900 placeholder:text-gray-400"
              />
              <Textarea
                value={trigReplyText}
                onChange={(e) => setTrigReplyText(e.target.value)}
                placeholder="Instant Reply Message..."
                rows={3}
                className="border-amber-200 bg-white text-xs text-gray-900 placeholder:text-gray-400 font-sans"
              />
              <Button
                onClick={handleSaveTriggerRule}
                disabled={saving || !trigKeyword.trim() || !trigReplyText.trim()}
                className="w-full h-8 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs"
              >
                {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />} Save Keyword Rule
              </Button>
            </div>
          </div>

          {/* Saved Triggers List */}
          <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-2.5 shadow-2xs">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block">
              Active Trigger Rules
            </span>
            {triggers.length === 0 ? (
              <p className="text-xs text-gray-400 p-2 text-center">No exact trigger rules configured.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {triggers.map((trig) => (
                  <div key={trig.id} className="py-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        "{trig.keyword}"
                      </span>
                      <span className="text-[9px] text-gray-400">Auto-Reply</span>
                    </div>
                    <p className="text-[11px] text-gray-700 truncate">{trig.replyText || 'Linked Template'}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Advanced Template Creator Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-xl bg-white border-gray-200 text-gray-900 font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Sparkles className="h-5 w-5 text-emerald-600" /> Create Advanced Interactive Template
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Select a message type below to configure text, quick reply buttons, list options, or flow logic.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-1">
            {/* Tabs for Template Types */}
            <Tabs value={templateType} onValueChange={(val) => setTemplateType(val as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-4 border-gray-200 bg-gray-50 text-xs">
                <TabsTrigger value="TEXT" className="gap-1 text-[11px] font-semibold">
                  <MessageSquare className="h-3.5 w-3.5" /> Plain Text
                </TabsTrigger>
                <TabsTrigger value="BUTTON" className="gap-1 text-[11px] font-semibold">
                  <Zap className="h-3.5 w-3.5" /> Buttons
                </TabsTrigger>
                <TabsTrigger value="LIST" className="gap-1 text-[11px] font-semibold">
                  <ListFilter className="h-3.5 w-3.5" /> List Menu
                </TabsTrigger>
                <TabsTrigger value="FLOW" className="gap-1 text-[11px] font-semibold">
                  <Layers className="h-3.5 w-3.5" /> Flow
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Template Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Festival Offer Quick Reply"
                className="border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Trigger Keyword (Optional)</label>
              <Input
                value={triggerText}
                onChange={(e) => setTriggerText(e.target.value)}
                placeholder="e.g. festival (Auto-sends when user types this keyword)"
                className="border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Type Specific Fields */}
            {templateType === 'TEXT' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Message Text *</label>
                <Textarea
                  value={plainText}
                  onChange={(e) => setPlainText(e.target.value)}
                  placeholder="Type message text..."
                  rows={4}
                  className="border-gray-200 bg-white text-xs text-gray-900 font-sans"
                />
              </div>
            )}

            {templateType === 'BUTTON' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Main Message Text *</label>
                  <Textarea
                    value={btnText}
                    onChange={(e) => setBtnText(e.target.value)}
                    placeholder="Type message text before buttons..."
                    rows={3}
                    className="border-gray-200 bg-white text-xs text-gray-900 font-sans"
                  />
                </div>
                <label className="block text-xs font-semibold text-gray-700">Quick Reply Buttons (up to 3)</label>
                <div className="grid grid-cols-3 gap-2">
                  <Input value={b1} onChange={(e) => setB1(e.target.value)} placeholder="Button 1 Title" className="text-xs h-8" />
                  <Input value={b2} onChange={(e) => setB2(e.target.value)} placeholder="Button 2 Title" className="text-xs h-8" />
                  <Input value={b3} onChange={(e) => setB3(e.target.value)} placeholder="Button 3 Title" className="text-xs h-8" />
                </div>
              </div>
            )}

            {templateType === 'LIST' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Main Message Text *</label>
                  <Textarea
                    value={listText}
                    onChange={(e) => setListText(e.target.value)}
                    placeholder="Type message text..."
                    rows={3}
                    className="border-gray-200 bg-white text-xs text-gray-900 font-sans"
                  />
                </div>
                <label className="block text-xs font-semibold text-gray-700">List Menu Options (up to 4)</label>
                <div className="grid grid-cols-2 gap-2">
                  <Input value={l1} onChange={(e) => setL1(e.target.value)} placeholder="Option 1" className="text-xs h-8" />
                  <Input value={l2} onChange={(e) => setL2(e.target.value)} placeholder="Option 2" className="text-xs h-8" />
                  <Input value={l3} onChange={(e) => setL3(e.target.value)} placeholder="Option 3" className="text-xs h-8" />
                  <Input value={l4} onChange={(e) => setL4(e.target.value)} placeholder="Option 4" className="text-xs h-8" />
                </div>
              </div>
            )}

            {templateType === 'FLOW' && (
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Message 1 (Initial Reply)</label>
                  <Textarea
                    value={flowMsg1}
                    onChange={(e) => setFlowMsg1(e.target.value)}
                    placeholder="Message 1..."
                    rows={2}
                    className="border-gray-200 bg-white text-xs font-sans"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Message 2 (Auto-Followup after 2 seconds)</label>
                  <Textarea
                    value={flowMsg2}
                    onChange={(e) => setFlowMsg2(e.target.value)}
                    placeholder="Message 2..."
                    rows={2}
                    className="border-gray-200 bg-white text-xs font-sans"
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleSaveTemplate}
              disabled={saving}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 mt-2 shadow-xs"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Save Template to Database
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
