'use client'

import { useState, useEffect } from 'react'
import {
  Megaphone,
  Users,
  Search,
  Check,
  Send,
  Loader2,
  FileText,
  Smartphone,
  Plus,
  CheckCheck,
  ListFilter,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export function CampaignsView() {
  const [contacts, setContacts] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Contacts Selection State
  const [search, setSearch] = useState('')
  const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set())
  const [manualPhones, setManualPhones] = useState('')

  // Compose Message & Template State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('custom')
  const [messageText, setMessageText] = useState('')
  const [previewPayload, setPreviewPayload] = useState<any>(null)
  const [sending, setSending] = useState(false)

  async function loadCampaignData() {
    setLoading(true)
    try {
      const [resC, resT] = await Promise.all([
        fetch('/api/admin/whatsapp/contacts'),
        fetch('/api/crm/templates'),
      ])
      const jsonC = await resC.json()
      const jsonT = await resT.json()

      const listC = jsonC.contacts || jsonC.data || []
      const listT = jsonT.templates || []

      setContacts(listC)
      setTemplates(listT)

      // By default select all contacts
      if (Array.isArray(listC) && listC.length > 0) {
        setSelectedPhones(new Set(listC.map((c: any) => c.phone)))
      }
    } catch {
      toast.error('Failed to load contacts/templates')
    } fontally: {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCampaignData()
  }, [])

  function togglePhone(phone: string) {
    const next = new Set(selectedPhones)
    if (next.has(phone)) {
      next.delete(phone)
    } else {
      next.add(phone)
    }
    setSelectedPhones(next)
  }

  function toggleSelectAll() {
    if (selectedPhones.size === filteredContacts.length) {
      setSelectedPhones(new Set())
    } else {
      setSelectedPhones(new Set(filteredContacts.map((c) => c.phone)))
    }
  }

  function handleSelectTemplate(tplId: string) {
    setSelectedTemplateId(tplId)
    if (tplId === 'custom') {
      setPreviewPayload(null)
      return
    }

    const found = templates.find((t) => t.id === tplId)
    if (found) {
      const payload = found.payload
      const text = typeof payload === 'object' && payload?.text ? payload.text : String(payload)
      setMessageText(text)
      setPreviewPayload(typeof payload === 'object' ? payload : { text })
      toast.success(`Loaded template "${found.name}"`)
    }
  }

  async function handleSendCampaign() {
    // Combine selected phones from contacts list + manual entries
    const manualList = manualPhones
      .split(',')
      .map((p) => p.replace(/\D/g, ''))
      .filter((p) => p.length >= 10)

    const allTargetPhones = Array.from(new Set([...Array.from(selectedPhones), ...manualList]))

    if (allTargetPhones.length === 0) {
      toast.error('Please select at least 1 contact or enter manual phone numbers')
      return
    }

    if (!messageText.trim()) {
      toast.error('Please enter broadcast message content')
      return
    }

    setSending(true)
    try {
      const res = await fetch('/api/crm/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateText: messageText,
          audience: 'all',
          customPhones: allTargetPhones,
          payload: previewPayload,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Campaign failed')

      toast.success(json.message || `Campaign broadcast queued for ${allTargetPhones.length} contacts!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Campaign broadcast failed')
    } finally {
      setSending(false)
    }
  }

  const filteredContacts = contacts.filter(
    (c) =>
      c.phone.includes(search) ||
      (c.name && c.name.toLowerCase().includes(search.toLowerCase())),
  )

  const buttons = previewPayload?.buttons || []
  const listOpts = previewPayload?.listOptions || []

  return (
    <div className="flex h-full w-full flex-col bg-gray-50 p-4 md:p-6 space-y-5 overflow-y-auto fancy-scroll font-sans text-gray-900">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 bg-white p-4 rounded-2xl border shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
            Bulk Campaign Broadcast Studio <Megaphone className="h-4 w-4 text-emerald-600" />
          </h2>
          <p className="text-xs text-gray-500">
            Select target recipients, pick pre-built template flows, and launch high-converting WhatsApp broadcasts.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadCampaignData}
          disabled={loading}
          className="gap-1.5 border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 h-8"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Lists
        </Button>
      </div>

      {/* 3-Column Studio Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Column 1: Select Contacts */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-2xs flex flex-col h-[520px]">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-emerald-600" /> Select Target Contacts ({selectedPhones.size})
            </h3>
            <button
              onClick={toggleSelectAll}
              className="text-[11px] font-bold text-emerald-700 hover:underline"
            >
              {selectedPhones.size === filteredContacts.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or phone..."
              className="pl-8 h-8 text-xs border-gray-200 bg-white"
            />
          </div>

          {/* Contact Checkboxes Scroll List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 pr-1 fancy-scroll">
            {loading ? (
              <div className="flex h-32 items-center justify-center text-xs text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin mr-2 text-emerald-600" /> Loading contacts...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">No contacts match filter.</div>
            ) : (
              filteredContacts.map((c) => {
                const isSelected = selectedPhones.has(c.phone)
                return (
                  <label
                    key={c.phone}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                      isSelected ? 'bg-emerald-50/60' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => togglePhone(c.phone)}
                        className="h-3.5 w-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div className="overflow-hidden">
                        <p className="font-bold text-xs text-gray-900 truncate">{c.name || 'WhatsApp Contact'}</p>
                        <p className="font-mono text-[10px] text-gray-500">{c.phone}</p>
                      </div>
                    </div>
                    {c.userType === 'business_owner' ? (
                      <span className="rounded bg-purple-100 px-1.5 py-0.5 text-[8px] font-bold text-purple-800 shrink-0">
                        Shop
                      </span>
                    ) : null}
                  </label>
                )
              })
            )}
          </div>

          {/* Manual Entry */}
          <div className="border-t border-gray-100 pt-2.5">
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Add Additional Phones (Comma Separated)
            </label>
            <Input
              value={manualPhones}
              onChange={(e) => setManualPhones(e.target.value)}
              placeholder="e.g. +919876543210, +919988776655"
              className="h-8 text-xs border-gray-200 bg-white"
            />
          </div>
        </div>

        {/* Column 2: Compose Message & Template Picker */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-4 shadow-2xs flex flex-col justify-between h-[520px]">
          <div className="space-y-3.5">
            <div className="border-b border-gray-100 pb-2">
              <h3 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-600" /> Compose Broadcast Content
              </h3>
            </div>

            {/* CRITICAL FEATURE: Saved Templates Dropdown */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Use Saved Template (Auto-Populate)
              </label>
              <Select value={selectedTemplateId} onValueChange={handleSelectTemplate}>
                <SelectTrigger className="h-9 border-gray-200 bg-white text-xs text-gray-900 rounded-xl">
                  <SelectValue placeholder="Select template..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-xs">
                  <SelectItem value="custom">-- Custom Broadcast Text --</SelectItem>
                  {templates.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      [{tpl.type}] {tpl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Message Content Text *</label>
              <Textarea
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value)
                  setPreviewPayload({ text: e.target.value, buttons, listOptions: listOpts })
                }}
                placeholder="Type broadcast text... Use [Name] to auto-personalize name."
                rows={9}
                className="border-gray-200 bg-white text-xs text-gray-900 font-sans p-3 rounded-xl focus:border-emerald-500"
              />
            </div>
          </div>

          <Button
            onClick={handleSendCampaign}
            disabled={sending || !messageText.trim()}
            className="w-full h-10 gap-2 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white shadow-xs"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Launch Bulk Campaign Broadcast
          </Button>
        </div>

        {/* Column 3: Smartphone Live Preview */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs flex flex-col items-center justify-center h-[520px]">
          <span className="text-xs font-bold text-gray-700 mb-3 flex items-center gap-1.5">
            <Smartphone className="h-4 w-4 text-emerald-600" /> Campaign Smartphone Preview
          </span>

          <div className="relative w-full max-w-[240px] rounded-3xl border-4 border-slate-800 bg-slate-900 p-2.5 shadow-md overflow-hidden">
            <div className="mx-auto mb-2 h-3 w-16 rounded-full bg-slate-800" />
            <div className="min-h-[300px] max-h-[360px] rounded-2xl bg-[#efeae2] p-2.5 flex flex-col justify-end overflow-y-auto space-y-2">
              <div className="self-end max-w-[95%] rounded-xl bg-[#d9fdd3] p-2.5 text-[10px] text-gray-900 border border-[#c1e8b8] shadow-2xs space-y-1.5">
                <p className="whitespace-pre-wrap leading-relaxed font-sans">
                  {messageText || '🎉 నమస్కారం! చౌటుప్పల్ యాప్ ప్రత్యేక వార్తలు & బిజినెస్ ఆఫర్లు.'}
                </p>

                {/* Buttons Preview */}
                {buttons.length > 0 ? (
                  <div className="pt-1.5 space-y-1 border-t border-[#b7e3ae]">
                    {buttons.map((b: any, i: number) => (
                      <div key={i} className="rounded bg-white p-1 text-center font-bold text-[9px] text-emerald-700 border border-emerald-200 shadow-2xs">
                        {b.title}
                      </div>
                    ))}
                  </div>
                ) : null}

                {/* List Menu Preview */}
                {listOpts.length > 0 ? (
                  <div className="pt-1.5 border-t border-[#b7e3ae]">
                    <div className="rounded bg-white p-1 text-center font-bold text-[9px] text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1">
                      <ListFilter className="h-2.5 w-2.5" /> Choose Options ({listOpts.length})
                    </div>
                  </div>
                ) : null}

                <div className="mt-1 flex items-center justify-end gap-1 text-[8px] text-emerald-700 font-bold">
                  <span>12:00 PM</span>
                  <CheckCheck className="h-2.5 w-2.5 text-emerald-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
