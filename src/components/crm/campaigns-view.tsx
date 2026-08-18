'use client'

import { useState, useEffect, useRef } from 'react'
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
  Upload,
  FolderPlus,
  Calendar,
  Sparkles,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'

export function CampaignsView() {
  const [contacts, setContacts] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Contacts Selection State
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string>('all')
  const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set())
  const [manualPhones, setManualPhones] = useState('')

  // Import Modal State
  const [importOpen, setImportOpen] = useState(false)
  const [csvText, setCsvText] = useState('')
  const [importing, setImporting] = useState(false)

  // Create Group Modal State
  const [groupModalOpen, setGroupModalOpen] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [creatingGroup, setCreatingGroup] = useState(false)

  // Compose State
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('custom')
  const [messageText, setMessageText] = useState(
    '🎉 నమస్కారం {name} గారు! మీ {shop_name} బిజినెస్ ని చౌటుప్పల్ యాప్ లో ప్రమోట్ చేయండి.',
  )

  // Interactive Builders State
  const [showButtons, setShowButtons] = useState(false)
  const [b1, setB1] = useState('Book Ad Now')
  const [b2, setB2] = useState('Call Support')
  const [b3, setB3] = useState('')

  const [showList, setShowList] = useState(false)
  const [l1, setL1] = useState('Top Banner Ad (₹99)')
  const [l2, setL2] = useState('Reels Video (₹299)')
  const [l3, setL3] = useState('Franchise Partner (₹10k)')
  const [l4, setL4] = useState('')

  const [showFooter, setShowFooter] = useState(false)
  const [footerText, setFooterText] = useState('Powered by Choutuppal App • https://choutuppal.in')

  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleTime, setScheduleTime] = useState('')

  const [sending, setSending] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  async function loadStudioData() {
    setLoading(true)
    try {
      const [resC, resG, resT] = await Promise.all([
        fetch('/api/admin/whatsapp/contacts'),
        fetch('/api/admin/whatsapp/groups'),
        fetch('/api/crm/templates'),
      ])

      const jsonC = await resC.json()
      const jsonG = await resG.json()
      const jsonT = await resT.json()

      const listC = jsonC.contacts || jsonC.data || []
      const listG = jsonG.groups || []
      const listT = jsonT.templates || []

      setContacts(listC)
      setGroups(listG)
      setTemplates(listT)

      if (Array.isArray(listC) && listC.length > 0 && selectedPhones.size === 0) {
        setSelectedPhones(new Set(listC.map((c: any) => c.phone)))
      }
    } catch {
      toast.error('Failed to load campaign data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStudioData()
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

  function handleSelectGroup(groupId: string) {
    setSelectedGroup(groupId)
    if (groupId === 'all') {
      setSelectedPhones(new Set(contacts.map((c) => c.phone)))
      return
    }

    const grp = groups.find((g) => g.id === groupId)
    if (grp && grp.contacts) {
      const gPhones = new Set<string>(grp.contacts.map((c: any) => c.phone))
      setSelectedPhones(gPhones)
      toast.success(`Selected group "${grp.name}" (${gPhones.size} contacts)`)
    }
  }

  // Insert Personalization Variable Chip into Textarea
  function insertVariable(variable: string) {
    if (!textareaRef.current) {
      setMessageText((prev) => prev + ` ${variable}`)
      return
    }

    const start = textareaRef.current.selectionStart
    const end = textareaRef.current.selectionEnd
    const text = messageText
    const newText = text.substring(0, start) + `${variable}` + text.substring(end)
    setMessageText(newText)

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(start + variable.length, start + variable.length)
      }
    }, 50)
  }

  function handleSelectTemplate(tplId: string) {
    setSelectedTemplateId(tplId)
    if (tplId === 'custom') return

    const found = templates.find((t) => t.id === tplId)
    if (found) {
      const payload = found.payload
      const text = typeof payload === 'object' && payload?.text ? payload.text : String(payload)
      setMessageText(text)

      if (payload?.buttons) {
        setShowButtons(true)
        setB1(payload.buttons[0]?.title || '')
        setB2(payload.buttons[1]?.title || '')
        setB3(payload.buttons[2]?.title || '')
      }
      if (payload?.listOptions) {
        setShowList(true)
        setL1(payload.listOptions[0]?.title || '')
        setL2(payload.listOptions[1]?.title || '')
        setL3(payload.listOptions[2]?.title || '')
        setL4(payload.listOptions[3]?.title || '')
      }

      toast.success(`Loaded template "${found.name}"`)
    }
  }

  async function handleImportCSV() {
    if (!csvText.trim()) {
      toast.error('Please enter or paste CSV content')
      return
    }
    setImporting(true)
    try {
      const res = await fetch('/api/admin/whatsapp/contacts/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Import failed')

      toast.success(`Imported ${json.insertedCount || 0} new contacts (${json.updatedCount || 0} updated)!`)
      setImportOpen(false)
      setCsvText('')
      loadStudioData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  async function handleCreateGroup() {
    if (!newGroupName.trim()) {
      toast.error('Group name is required')
      return
    }
    if (selectedPhones.size === 0) {
      toast.error('Select at least 1 contact to save group')
      return
    }
    setCreatingGroup(true)
    try {
      const res = await fetch('/api/admin/whatsapp/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName.trim(),
          phoneNumbers: Array.from(selectedPhones),
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to create group')

      toast.success(`Group "${newGroupName}" saved with ${selectedPhones.size} contacts!`)
      setGroupModalOpen(false)
      setNewGroupName('')
      loadStudioData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Create group failed')
    } finally {
      setCreatingGroup(false)
    }
  }

  async function handleSendCampaign() {
    const manualList = manualPhones
      .split(',')
      .map((p) => p.replace(/\D/g, ''))
      .filter((p) => p.length >= 10)

    const allTargetPhones = Array.from(new Set([...Array.from(selectedPhones), ...manualList]))

    if (allTargetPhones.length === 0) {
      toast.error('Select at least 1 recipient contact')
      return
    }
    if (!messageText.trim()) {
      toast.error('Message content is required')
      return
    }

    const payload: any = {}

    if (showButtons) {
      const buttons = [b1, b2, b3].filter((b) => b.trim()).map((title) => ({ title: title.trim() }))
      if (buttons.length > 0) payload.buttons = buttons
    }
    if (showList) {
      const listOptions = [l1, l2, l3, l4].filter((l) => l.trim()).map((title) => ({ title: title.trim() }))
      if (listOptions.length > 0) payload.listOptions = listOptions
    }
    if (showFooter && footerText.trim()) {
      payload.footer = footerText.trim()
    }

    setSending(true)
    try {
      const res = await fetch('/api/crm/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateText: messageText,
          customPhones: allTargetPhones,
          payload,
          scheduleTime: showSchedule ? scheduleTime : null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Campaign launch failed')

      toast.success(json.message || `Campaign sent to ${allTargetPhones.length} contacts!`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Campaign send failed')
    } finally {
      setSending(false)
    }
  }

  const filteredContacts = contacts.filter((c) => {
    const matchesSearch =
      c.phone.includes(search) || (c.name && c.name.toLowerCase().includes(search.toLowerCase()))
    return matchesSearch
  })

  // Live Smartphone Parsed Text (Sample Variable Replacement)
  const parsedSampleText = messageText
    .replace(/\{name\}/gi, 'వెంకటేష్')
    .replace(/\[Name\]/gi, 'వెంకటేష్')
    .replace(/\{shop_name\}/gi, 'Sri Lakshmi Tiffins')

  const activeButtons = showButtons ? [b1, b2, b3].filter((b) => b.trim()) : []
  const activeListOpts = showList ? [l1, l2, l3, l4].filter((l) => l.trim()) : []

  return (
    <div className="flex h-full w-full flex-col bg-gray-50 p-4 md:p-6 space-y-5 overflow-y-auto fancy-scroll font-sans text-gray-900">
      {/* Studio Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 bg-white p-4 rounded-2xl border shadow-2xs">
        <div>
          <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
            Bulk Campaign Broadcast Studio <Megaphone className="h-4 w-4 text-emerald-600" />
          </h2>
          <p className="text-xs text-gray-500">
            Target WhatsApp contacts, insert personalization variables, build interactive quick replies, and view live smartphone preview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            className="gap-1.5 border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 font-bold text-xs h-8"
          >
            <Upload className="h-3.5 w-3.5 text-blue-600" /> Import CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setGroupModalOpen(true)}
            className="gap-1.5 border-purple-200 bg-purple-50 text-purple-800 hover:bg-purple-100 font-bold text-xs h-8"
          >
            <FolderPlus className="h-3.5 w-3.5 text-purple-600" /> Create Group
          </Button>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Target Contacts & Groups (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-2xs flex flex-col h-[600px]">
          <div className="flex items-center justify-between border-b border-gray-100 pb-2">
            <h3 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
              <Users className="h-4 w-4 text-emerald-600" /> Target Contacts ({selectedPhones.size})
            </h3>
            <button
              onClick={toggleSelectAll}
              className="text-[11px] font-bold text-emerald-700 hover:underline"
            >
              {selectedPhones.size === filteredContacts.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          {/* Group Filter Dropdown */}
          <div>
            <Select value={selectedGroup} onValueChange={handleSelectGroup}>
              <SelectTrigger className="h-8 border-gray-200 bg-gray-50 text-xs text-gray-900 rounded-lg">
                <SelectValue placeholder="Filter by Group..." />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 text-xs">
                <SelectItem value="all">All Saved Contacts ({contacts.length})</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    📁 {g.name} ({g._count?.contacts || g.contacts?.length || 0})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or phone number..."
              className="pl-8 h-8 text-xs border-gray-200 bg-white"
            />
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 pr-1 fancy-scroll">
            {loading ? (
              <div className="flex h-32 items-center justify-center text-xs text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin mr-2 text-emerald-600" /> Loading contacts...
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-4 text-center text-xs text-gray-400">No matching contacts.</div>
            ) : (
              filteredContacts.map((c) => {
                const isSelected = selectedPhones.has(c.phone)
                return (
                  <label
                    key={c.phone}
                    className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                      isSelected ? 'bg-emerald-50/70' : 'hover:bg-gray-50'
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
                        Shop Owner
                      </span>
                    ) : null}
                  </label>
                )
              })
            )}
          </div>

          {/* Manual Phone Numbers Entry */}
          <div className="border-t border-gray-100 pt-2">
            <label className="block text-[11px] font-bold text-gray-700 mb-1">
              Manual Numbers (Comma Separated)
            </label>
            <Input
              value={manualPhones}
              onChange={(e) => setManualPhones(e.target.value)}
              placeholder="e.g. +919876543210, +919988776655"
              className="h-8 text-xs border-gray-200 bg-white"
            />
          </div>
        </div>

        {/* MIDDLE COLUMN: Compose Broadcast Content (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-gray-200 bg-white p-4 space-y-3.5 shadow-2xs flex flex-col justify-between h-[600px] overflow-y-auto fancy-scroll">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <h3 className="font-bold text-xs text-gray-900 flex items-center gap-1.5">
                <FileText className="h-4 w-4 text-emerald-600" /> Compose Broadcast Content
              </h3>

              {/* Template Select */}
              <Select value={selectedTemplateId} onValueChange={handleSelectTemplate}>
                <SelectTrigger className="h-7 border-gray-200 bg-gray-50 text-[11px] text-gray-900 rounded-lg w-40">
                  <SelectValue placeholder="Saved Template..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-xs">
                  <SelectItem value="custom">-- Custom Text --</SelectItem>
                  {templates.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      [{tpl.type}] {tpl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Message Content Text *</label>
              <Textarea
                ref={textareaRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type broadcast text... Use variable chips below to insert name or shop."
                rows={6}
                className="border-gray-200 bg-white text-xs text-gray-900 font-sans p-3 rounded-xl focus:border-emerald-500"
              />
            </div>

            {/* CRITICAL PERSONALIZATION CHIPS */}
            <div>
              <span className="block text-[11px] font-bold text-gray-600 mb-1.5">
                Personalization Variable Chips (Click to insert):
              </span>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable('{name}')}
                  className="h-7 text-[11px] border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold gap-1 rounded-lg"
                >
                  <Sparkles className="h-3 w-3 text-emerald-600" /> Insert {'{name}'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => insertVariable('{shop_name}')}
                  className="h-7 text-[11px] border-purple-300 bg-purple-50 text-purple-800 hover:bg-purple-100 font-bold gap-1 rounded-lg"
                >
                  <Sparkles className="h-3 w-3 text-purple-600" /> Insert {'{shop_name}'}
                </Button>
              </div>
            </div>

            {/* Interactive UI Builders Toggle Row */}
            <div className="pt-2 border-t border-gray-100 space-y-2">
              <span className="block text-[11px] font-bold text-gray-700">Interactive Element Builders:</span>
              <div className="flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowButtons(!showButtons)}
                  className={`h-7 text-[10px] font-bold ${
                    showButtons ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  <Zap className="h-3 w-3 mr-1" /> Quick Buttons
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowList(!showList)}
                  className={`h-7 text-[10px] font-bold ${
                    showList ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  <ListFilter className="h-3 w-3 mr-1" /> List Menu
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFooter(!showFooter)}
                  className={`h-7 text-[10px] font-bold ${
                    showFooter ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  Footer Text
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSchedule(!showSchedule)}
                  className={`h-7 text-[10px] font-bold ${
                    showSchedule ? 'bg-purple-600 text-white border-purple-600' : 'bg-gray-50 text-gray-700'
                  }`}
                >
                  <Calendar className="h-3 w-3 mr-1" /> Schedule
                </Button>
              </div>

              {/* Builders Inputs */}
              {showButtons && (
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-600 block">Quick Reply Button Titles (Up to 3)</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <Input value={b1} onChange={(e) => setB1(e.target.value)} placeholder="Btn 1" className="h-7 text-xs bg-white" />
                    <Input value={b2} onChange={(e) => setB2(e.target.value)} placeholder="Btn 2" className="h-7 text-xs bg-white" />
                    <Input value={b3} onChange={(e) => setB3(e.target.value)} placeholder="Btn 3" className="h-7 text-xs bg-white" />
                  </div>
                </div>
              )}

              {showList && (
                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
                  <label className="text-[10px] font-bold text-gray-600 block">List Menu Options (Up to 4)</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <Input value={l1} onChange={(e) => setL1(e.target.value)} placeholder="Option 1" className="h-7 text-xs bg-white" />
                    <Input value={l2} onChange={(e) => setL2(e.target.value)} placeholder="Option 2" className="h-7 text-xs bg-white" />
                    <Input value={l3} onChange={(e) => setL3(e.target.value)} placeholder="Option 3" className="h-7 text-xs bg-white" />
                    <Input value={l4} onChange={(e) => setL4(e.target.value)} placeholder="Option 4" className="h-7 text-xs bg-white" />
                  </div>
                </div>
              )}

              {showFooter && (
                <div className="p-2 rounded-xl bg-gray-50 border border-gray-200">
                  <Input value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="Footer text..." className="h-7 text-xs bg-white" />
                </div>
              )}

              {showSchedule && (
                <div className="p-2 rounded-xl bg-purple-50 border border-purple-200">
                  <Input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="h-7 text-xs bg-white border-purple-300"
                  />
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleSendCampaign}
            disabled={sending || !messageText.trim()}
            className="w-full h-10 gap-2 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white shadow-xs"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Launch Campaign Broadcast
          </Button>
        </div>

        {/* RIGHT COLUMN: Realistic Smartphone WhatsApp Live Preview (3 Cols) */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs flex flex-col items-center justify-center h-[600px]">
          <span className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
            <Smartphone className="h-4 w-4 text-emerald-600" /> Realistic Smartphone Live Preview
          </span>

          {/* Smartphone Frame Mockup */}
          <div className="relative w-full max-w-[250px] rounded-[36px] border-[6px] border-slate-900 bg-slate-950 p-2.5 shadow-2xl overflow-hidden font-sans">
            {/* Top Notch Speaker */}
            <div className="mx-auto mb-2 h-3.5 w-20 rounded-full bg-slate-900 flex items-center justify-center">
              <div className="h-1 w-6 rounded-full bg-slate-800" />
            </div>

            {/* Smartphone Inner Screen */}
            <div className="min-h-[440px] max-h-[480px] rounded-[24px] bg-[#efeae2] flex flex-col justify-between overflow-hidden text-gray-900">
              {/* WhatsApp App Header MUST display Choutuppal App */}
              <div className="flex h-11 items-center gap-2 bg-[#075e54] px-3 text-white shadow-xs shrink-0">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-emerald-500 font-black text-xs border border-emerald-300 text-white">
                  C
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-xs leading-tight truncate">Choutuppal App</h4>
                  <p className="text-[9px] text-emerald-100 font-medium">Official Business WhatsApp</p>
                </div>
              </div>

              {/* Chat Chat Bubble View */}
              <div className="flex-1 p-2.5 flex flex-col justify-end overflow-y-auto space-y-2 fancy-scroll">
                <div className="self-end max-w-[96%] rounded-xl bg-[#d9fdd3] p-2.5 text-[10px] text-gray-900 border border-[#c1e8b8] shadow-2xs space-y-1.5">
                  <p className="whitespace-pre-wrap leading-relaxed font-sans">{parsedSampleText}</p>

                  {/* Render Footer Text */}
                  {showFooter && footerText.trim() ? (
                    <p className="text-[8px] text-gray-500 pt-1 border-t border-[#b7e3ae] italic">
                      {footerText}
                    </p>
                  ) : null}

                  {/* Render Buttons */}
                  {activeButtons.length > 0 ? (
                    <div className="pt-1.5 space-y-1 border-t border-[#b7e3ae]">
                      {activeButtons.map((b, i) => (
                        <div
                          key={i}
                          className="rounded bg-white p-1 text-center font-bold text-[9px] text-emerald-700 border border-emerald-200 shadow-2xs cursor-pointer hover:bg-emerald-50"
                        >
                          {b}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {/* Render List Menu */}
                  {activeListOpts.length > 0 ? (
                    <div className="pt-1.5 border-t border-[#b7e3ae]">
                      <div className="rounded bg-white p-1 text-center font-bold text-[9px] text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1 shadow-2xs cursor-pointer">
                        <ListFilter className="h-2.5 w-2.5" /> Choose Options ({activeListOpts.length})
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

      {/* CSV Import Modal */}
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent className="max-w-md bg-white border-gray-200 text-gray-900 font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Upload className="h-5 w-5 text-blue-600" /> Import Contacts from CSV
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Paste CSV text formatted as "Name, Phone" per line (e.g. Ramesh, +919876543210).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder={`Ramesh, 9876543210\nSuresh, 9988776655`}
              rows={6}
              className="border-gray-200 bg-white text-xs font-mono"
            />
            <Button
              onClick={handleImportCSV}
              disabled={importing || !csvText.trim()}
              className="w-full h-9 bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white"
            >
              {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Bulk Insert Contacts
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Group Modal */}
      <Dialog open={groupModalOpen} onOpenChange={setGroupModalOpen}>
        <DialogContent className="max-w-md bg-white border-gray-200 text-gray-900 font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <FolderPlus className="h-5 w-5 text-purple-600" /> Create Contact Group
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Save {selectedPhones.size} selected contacts into a reusable target group.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Group Name *</label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="e.g. Real Estate Agents Choutuppal"
                className="h-9 text-xs border-gray-200 bg-white"
              />
            </div>
            <Button
              onClick={handleCreateGroup}
              disabled={creatingGroup || !newGroupName.trim()}
              className="w-full h-9 bg-purple-600 hover:bg-purple-700 font-bold text-xs text-white"
            >
              {creatingGroup ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderPlus className="h-4 w-4" />} Save Contact Group
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
