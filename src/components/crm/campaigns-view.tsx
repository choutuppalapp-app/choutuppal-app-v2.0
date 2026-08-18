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
  Trash2,
  CheckCheck,
  ListFilter,
  RefreshCw,
  Upload,
  FolderPlus,
  Calendar,
  Sparkles,
  Zap,
  Layers,
  ArrowUp,
  ArrowDown,
  History,
  CheckCircle2,
  XCircle,
  Paperclip,
  X,
  Image as ImageIcon,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface ButtonItem {
  id: string
  title: string
}

interface ListItem {
  id: string
  title: string
  description?: string
}

interface FlowStep {
  id: string
  delayMs: number
  message: string
}

interface CampaignRecord {
  id: string
  name: string
  messageText: string
  audienceCount: number
  successCount: number
  failedCount: number
  status: string
  createdAt: string
}

export function CampaignsView() {
  const [contacts, setContacts] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [templates, setTemplates] = useState<any[]>([])
  const [campaignHistory, setCampaignHistory] = useState<CampaignRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingHistory, setLoadingHistory] = useState(false)

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
  const [campaignName, setCampaignName] = useState('')
  const [messageText, setMessageText] = useState(
    '🎉 నమస్కారం {name} గారు! మీ {shop_name} బిజినెస్ ని చౌటుప్పల్ యాప్ లో ప్రమోట్ చేయండి.',
  )

  // Header Image Upload State
  const [headerImageUrl, setHeaderImageUrl] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const campaignFileInputRef = useRef<HTMLInputElement>(null)

  // Interactive Builders Array States
  const [buttons, setButtons] = useState<ButtonItem[]>([])
  const [listItems, setListItems] = useState<ListItem[]>([])
  const [flowSteps, setFlowSteps] = useState<FlowStep[]>([])
  const [footerText, setFooterText] = useState<string>('')
  const [showFooter, setShowFooter] = useState<boolean>(false)

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

      // Exclude emergency/govt/leader contacts from default selection
      const eligibleContacts = Array.isArray(listC)
        ? listC.filter((c: any) => c.userType !== 'emergency_govt_leader')
        : []

      setContacts(eligibleContacts)
      setGroups(listG)
      setTemplates(listT)

      if (eligibleContacts.length > 0 && selectedPhones.size === 0) {
        setSelectedPhones(new Set(eligibleContacts.map((c: any) => c.phone)))
      }
    } catch {
      toast.error('Failed to load campaign data')
    } finally {
      setLoading(false)
    }
  }

  async function loadCampaignHistory() {
    setLoadingHistory(true)
    try {
      const res = await fetch('/api/crm/campaigns/history')
      const json = await res.json()
      if (res.ok) {
        setCampaignHistory(json.campaigns || [])
      }
    } catch {
      console.warn('Failed to load campaign history')
    } finally {
      setLoadingHistory(false)
    }
  }

  useEffect(() => {
    loadStudioData()
    loadCampaignHistory()
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
      const gPhones = new Set<string>(
        grp.contacts.filter((c: any) => c.userType !== 'emergency_govt_leader').map((c: any) => c.phone),
      )
      setSelectedPhones(gPhones)
      toast.success(`Selected group "${grp.name}" (${gPhones.size} contacts)`)
    }
  }

  // Insert Personalization Variable Chip
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

      if (payload?.mediaUrl || payload?.imageUrl) {
        setHeaderImageUrl(payload.mediaUrl || payload.imageUrl)
      }

      if (payload?.buttons && Array.isArray(payload.buttons)) {
        setButtons(
          payload.buttons.slice(0, 3).map((b: any, idx: number) => ({
            id: String(idx + 1),
            title: typeof b === 'string' ? b : b.title || 'Button',
          })),
        )
      } else {
        setButtons([])
      }

      if (payload?.listOptions && Array.isArray(payload.listOptions)) {
        setListItems(
          payload.listOptions.slice(0, 4).map((l: any, idx: number) => ({
            id: String(idx + 1),
            title: typeof l === 'string' ? l : l.title || 'Option',
            description: l.description || '',
          })),
        )
      } else {
        setListItems([])
      }

      if (payload?.footer) {
        setShowFooter(true)
        setFooterText(payload.footer)
      } else {
        setShowFooter(false)
        setFooterText('')
      }

      toast.success(`Loaded template "${found.name}"`)
    }
  }

  async function handleCampaignFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'crm-campaign-media')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (!res.ok || !json.url) throw new Error(json.error || 'Failed to upload image')

      setHeaderImageUrl(json.url)
      toast.success('Header image attached to broadcast!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploadingImage(false)
      if (campaignFileInputRef.current) campaignFileInputRef.current.value = ''
    }
  }

  // Button Add/Remove/Reorder Handlers
  function handleAddButton() {
    if (buttons.length >= 3) return
    setButtons((prev) => [...prev, { id: String(Date.now()), title: `Button ${prev.length + 1}` }])
  }

  function handleUpdateButton(id: string, title: string) {
    setButtons((prev) => prev.map((b) => (b.id === id ? { ...b, title } : b)))
  }

  function handleRemoveButton(id: string) {
    setButtons((prev) => prev.filter((b) => b.id !== id))
  }

  function handleMoveButtonUp(index: number) {
    if (index <= 0) return
    setButtons((prev) => {
      const next = [...prev]
      const temp = next[index]
      next[index] = next[index - 1]
      next[index - 1] = temp
      return next
    })
  }

  function handleMoveButtonDown(index: number) {
    if (index >= buttons.length - 1) return
    setButtons((prev) => {
      const next = [...prev]
      const temp = next[index]
      next[index] = next[index + 1]
      next[index + 1] = temp
      return next
    })
  }

  // List Item Add/Remove/Reorder Handlers
  function handleAddListItem() {
    if (listItems.length >= 4) return
    setListItems((prev) => [
      ...prev,
      { id: String(Date.now()), title: `Option ${prev.length + 1}`, description: '' },
    ])
  }

  function handleUpdateListItem(id: string, key: 'title' | 'description', value: string) {
    setListItems((prev) => prev.map((l) => (l.id === id ? { ...l, [key]: value } : l)))
  }

  function handleRemoveListItem(id: string) {
    setListItems((prev) => prev.filter((l) => l.id !== id))
  }

  function handleMoveListItemUp(index: number) {
    if (index <= 0) return
    setListItems((prev) => {
      const next = [...prev]
      const temp = next[index]
      next[index] = next[index - 1]
      next[index - 1] = temp
      return next
    })
  }

  function handleMoveListItemDown(index: number) {
    if (index >= listItems.length - 1) return
    setListItems((prev) => {
      const next = [...prev]
      const temp = next[index]
      next[index] = next[index + 1]
      next[index + 1] = temp
      return next
    })
  }

  // Flow Step Add/Remove Handlers
  function handleAddFlowStep() {
    setFlowSteps((prev) => [
      ...prev,
      { id: String(Date.now()), delayMs: 2000, message: 'Followup message text' },
    ])
  }

  function handleRemoveFlowStep(id: string) {
    setFlowSteps((prev) => prev.filter((f) => f.id !== id))
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

    // Build Meta WhatsApp interactive structure
    const payload: any = {
      body: messageText,
    }

    if (headerImageUrl) {
      payload.imageUrl = headerImageUrl
      payload.mediaUrl = headerImageUrl
      payload.messageType = 'image'
    }

    if (showFooter && footerText.trim()) {
      payload.footer = footerText.trim()
    }

    if (buttons.length > 0) {
      payload.action = {
        buttons: buttons
          .filter((b) => b.title.trim())
          .map((b, idx) => ({
            type: 'reply',
            reply: { id: `btn_${idx + 1}`, title: b.title.trim() },
          })),
      }
      payload.buttons = buttons.map((b) => ({ title: b.title.trim() }))
    }

    if (listItems.length > 0) {
      payload.action = {
        ...(payload.action || {}),
        sections: [
          {
            title: 'Options Menu',
            rows: listItems
              .filter((l) => l.title.trim())
              .map((l, idx) => ({
                id: `list_${idx + 1}`,
                title: l.title.trim(),
                description: l.description?.trim() || undefined,
              })),
          },
        ],
      }
      payload.listOptions = listItems.map((l) => ({ title: l.title.trim(), description: l.description }))
    }

    if (flowSteps.length > 0) {
      payload.sequence = flowSteps.map((f) => ({ delayMs: f.delayMs, message: f.message }))
    }

    setSending(true)
    try {
      const res = await fetch('/api/crm/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName: campaignName.trim() || `Broadcast ${new Date().toLocaleDateString()}`,
          templateText: messageText,
          customPhones: allTargetPhones,
          payload,
          scheduleTime: showSchedule ? scheduleTime : null,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Campaign launch failed')

      toast.success(json.message || `Campaign sent to ${allTargetPhones.length} contacts!`)
      loadCampaignHistory()
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

  return (
    <div className="flex h-full w-full flex-col bg-gray-50 p-4 md:p-6 space-y-5 overflow-y-auto fancy-scroll font-sans text-gray-900">
      {/* Studio Header & Marketing Exclusion Warning */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 bg-white p-4 rounded-2xl border shadow-2xs">
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
              Bulk Campaign Broadcast Studio <Megaphone className="h-4 w-4 text-emerald-600" />
            </h2>
            <p className="text-xs text-gray-500">
              Target WhatsApp contacts, insert personalization variables, attach header media, build interactive quick replies, and view live preview.
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

        {/* Marketing Exclusion Warning Banner */}
        <div className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs font-semibold text-amber-900 shadow-2xs">
          <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0" />
          <span>
            <strong>Marketing Exclusion Active:</strong> Emergency Services, Police, Hospitals, and Govt Leaders are automatically excluded from bulk marketing campaigns.
          </span>
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT COLUMN: Target Contacts & Groups (4 Cols) */}
        <div className="lg:col-span-4 rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-2xs flex flex-col h-[640px]">
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
        <div className="lg:col-span-5 rounded-2xl border border-gray-200 bg-white p-4 space-y-3.5 shadow-2xs flex flex-col justify-between h-[640px] overflow-y-auto fancy-scroll">
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

            {/* Campaign Name Input */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Campaign Title / Tag</label>
              <Input
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                placeholder="e.g. Ugadi Special Offer Broadcast"
                className="h-8 text-xs border-gray-200 bg-white"
              />
            </div>

            {/* Header Image Media Upload */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Header Media Attachment (Optional)</label>
              <input
                type="file"
                ref={campaignFileInputRef}
                onChange={handleCampaignFileUpload}
                accept="image/*,application/pdf"
                className="hidden"
              />
              {headerImageUrl ? (
                <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-emerald-300 bg-white">
                    <img src={headerImageUrl} alt="Campaign header" className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-bold text-emerald-950 truncate">Header Image Attached</p>
                    <p className="text-[10px] text-emerald-700 truncate">{headerImageUrl}</p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setHeaderImageUrl(null)}
                    className="h-6 w-6 text-red-500 hover:bg-red-50 rounded-full"
                    title="Remove Image"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => campaignFileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="w-full h-8 text-xs border-dashed border-gray-300 bg-gray-50 hover:bg-emerald-50 text-gray-700 font-bold gap-1.5 rounded-xl"
                >
                  {uploadingImage ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-600" />
                  ) : (
                    <Paperclip className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                  Attach Image / Banner Header
                </Button>
              )}
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Message Body Text *</label>
              <Textarea
                ref={textareaRef}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type broadcast text... Use variable chips below to insert name or shop."
                rows={4}
                className="border-gray-200 bg-white text-xs text-gray-900 font-sans p-3 rounded-xl focus:border-emerald-500"
              />
            </div>

            {/* PERSONALIZATION CHIPS */}
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

            {/* INTERACTIVE BUILDERS WITH REORDER & ADD/REMOVE LOGIC */}
            <div className="pt-2 border-t border-gray-100 space-y-3">
              <span className="block text-[11px] font-bold text-gray-700">Interactive Element Builders:</span>

              {/* 1. Quick Reply Buttons Builder (Up to 3 with Reorder) */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-emerald-600" /> Quick Reply Buttons ({buttons.length}/3)
                  </span>
                  {buttons.length < 3 ? (
                    <button
                      onClick={handleAddButton}
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Button
                    </button>
                  ) : null}
                </div>

                {buttons.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic">No buttons added. Click "Add Button" to add quick reply pills.</p>
                ) : (
                  <div className="space-y-1.5">
                    {buttons.map((btn, idx) => (
                      <div key={btn.id} className="flex items-center gap-1.5">
                        <Input
                          value={btn.title}
                          onChange={(e) => handleUpdateButton(btn.id, e.target.value)}
                          placeholder={`Button ${idx + 1} Title`}
                          className="h-7 text-xs bg-white border-gray-200 flex-1"
                        />

                        {/* Reorder Buttons */}
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={idx === 0}
                          onClick={() => handleMoveButtonUp(idx)}
                          className="h-7 w-7 text-gray-500 hover:bg-gray-200 disabled:opacity-30 shrink-0"
                          title="Move Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={idx === buttons.length - 1}
                          onClick={() => handleMoveButtonDown(idx)}
                          className="h-7 w-7 text-gray-500 hover:bg-gray-200 disabled:opacity-30 shrink-0"
                          title="Move Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>

                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveButton(btn.id)}
                          className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700 shrink-0"
                          title="Remove Button"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. List Menu Items Builder (Up to 4 with Reorder) */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800 flex items-center gap-1">
                    <ListFilter className="h-3.5 w-3.5 text-blue-600" /> List Options ({listItems.length}/4)
                  </span>
                  {listItems.length < 4 ? (
                    <button
                      onClick={handleAddListItem}
                      className="text-[11px] font-bold text-blue-700 hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add List Item
                    </button>
                  ) : null}
                </div>

                {listItems.length === 0 ? (
                  <p className="text-[11px] text-gray-400 italic">No list items added. Click "Add List Item" to add dropdown menu choices.</p>
                ) : (
                  <div className="space-y-2">
                    {listItems.map((item, idx) => (
                      <div key={item.id} className="flex items-center gap-1.5 bg-white p-2 rounded-lg border border-gray-200">
                        <div className="flex-1 grid grid-cols-2 gap-1.5">
                          <Input
                            value={item.title}
                            onChange={(e) => handleUpdateListItem(item.id, 'title', e.target.value)}
                            placeholder={`Option ${idx + 1} Title`}
                            className="h-7 text-xs bg-white border-gray-200"
                          />
                          <Input
                            value={item.description || ''}
                            onChange={(e) => handleUpdateListItem(item.id, 'description', e.target.value)}
                            placeholder="Subtitle/Price (Optional)"
                            className="h-7 text-xs bg-white border-gray-200"
                          />
                        </div>

                        {/* Reorder List Items */}
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={idx === 0}
                          onClick={() => handleMoveListItemUp(idx)}
                          className="h-7 w-7 text-gray-500 hover:bg-gray-100 disabled:opacity-30 shrink-0"
                          title="Move Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={idx === listItems.length - 1}
                          onClick={() => handleMoveListItemDown(idx)}
                          className="h-7 w-7 text-gray-500 hover:bg-gray-100 disabled:opacity-30 shrink-0"
                          title="Move Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>

                        {/* Delete List Item */}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveListItem(item.id)}
                          className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700 shrink-0"
                          title="Remove List Option"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Footer Text Builder */}
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-800">Footer Text</span>
                  {!showFooter ? (
                    <button
                      onClick={() => {
                        setShowFooter(true)
                        if (!footerText) setFooterText('Powered by Choutuppal App')
                      }}
                      className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                    >
                      <Plus className="h-3 w-3" /> Add Footer
                    </button>
                  ) : null}
                </div>

                {showFooter ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      placeholder="Footer text..."
                      className="h-7 text-xs bg-white border-gray-200"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFooterText('')
                        setShowFooter(false)
                      }}
                      className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700 shrink-0"
                      title="Delete Footer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ) : (
                  <p className="text-[11px] text-gray-400 italic">No footer configured.</p>
                )}
              </div>

              {/* 4. Flow Steps & Schedule Row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-purple-900 flex items-center gap-1">
                      <Layers className="h-3 w-3" /> Flow Auto-Followup
                    </span>
                    <button
                      onClick={handleAddFlowStep}
                      className="text-[10px] font-bold text-purple-700 hover:underline"
                    >
                      + Step
                    </button>
                  </div>
                  {flowSteps.map((f, idx) => (
                    <div key={f.id} className="flex items-center gap-1 mt-1">
                      <Input
                        value={f.message}
                        onChange={(e) => {
                          const val = e.target.value
                          setFlowSteps((prev) => prev.map((item) => (item.id === f.id ? { ...item, message: val } : item)))
                        }}
                        placeholder={`Followup step ${idx + 1}...`}
                        className="h-6 text-[10px] bg-white border-purple-200"
                      />
                      <button onClick={() => handleRemoveFlowStep(f.id)} className="text-red-500 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
                  <span className="text-[11px] font-bold text-gray-800 flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-purple-600" /> Schedule Campaign
                  </span>
                  <Input
                    type="datetime-local"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="h-6 text-[10px] bg-white border-gray-200"
                  />
                </div>
              </div>
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

        {/* RIGHT COLUMN: Realistic Smartphone WhatsApp Live Preview (Strict Body -> Buttons -> Footer Order + Header Attachment) */}
        <div className="lg:col-span-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-2xs flex flex-col items-center justify-center h-[640px]">
          <span className="text-xs font-bold text-gray-700 mb-2 flex items-center gap-1.5">
            <Smartphone className="h-4 w-4 text-emerald-600" /> Strict WhatsApp API Bubble Format
          </span>

          {/* Smartphone Frame Mockup */}
          <div className="relative w-full max-w-[250px] rounded-[36px] border-[6px] border-slate-900 bg-slate-950 p-2.5 shadow-2xl overflow-hidden font-sans">
            {/* Top Notch Speaker */}
            <div className="mx-auto mb-2 h-3.5 w-20 rounded-full bg-slate-900 flex items-center justify-center">
              <div className="h-1 w-6 rounded-full bg-slate-800" />
            </div>

            {/* Smartphone Inner Screen */}
            <div className="min-h-[480px] max-h-[520px] rounded-[24px] bg-[#efeae2] flex flex-col justify-between overflow-hidden text-gray-900">
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

              {/* Chat Bubble View */}
              <div className="flex-1 p-2.5 flex flex-col justify-end overflow-y-auto space-y-2 fancy-scroll">
                {/* STRICT WHATSAPP API FORMAT: SINGLE OUTBOUND BUBBLE (Image Header -> 1. Body -> 2. Buttons/List -> 3. Footer) */}
                <div className="self-end max-w-[98%] rounded-2xl bg-[#d9fdd3] text-gray-900 border border-[#c1e8b8] shadow-2xs overflow-hidden flex flex-col">
                  {/* Attached Header Image Preview */}
                  {headerImageUrl ? (
                    <div className="relative max-h-36 overflow-hidden border-b border-[#b7e3ae]">
                      <img src={headerImageUrl} alt="Header media preview" className="w-full object-cover max-h-36" />
                    </div>
                  ) : null}

                  {/* 1. Body Text */}
                  <div className="p-2.5 space-y-1">
                    <p className="whitespace-pre-wrap leading-relaxed font-sans text-[10px]">
                      {parsedSampleText}
                    </p>

                    {/* Timestamp & Ticks inside body */}
                    <div className="mt-1 flex items-center justify-end gap-1 text-[8px] text-emerald-700 font-bold">
                      <span>12:00 PM</span>
                      <CheckCheck className="h-2.5 w-2.5 text-emerald-600" />
                    </div>
                  </div>

                  {/* 2. Buttons / List attached to single bubble */}
                  {buttons.length > 0 ? (
                    <div className="border-t border-[#b7e3ae] divide-y divide-[#b7e3ae] bg-white/90">
                      {buttons.map((b) => (
                        <div
                          key={b.id}
                          className="p-1.5 text-center font-bold text-[9.5px] text-emerald-700 cursor-pointer hover:bg-emerald-50 transition"
                        >
                          {b.title || 'Button'}
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {listItems.length > 0 ? (
                    <div className="border-t border-[#b7e3ae] bg-white/90 p-1.5 text-center font-bold text-[9.5px] text-emerald-700 flex items-center justify-center gap-1 cursor-pointer hover:bg-emerald-50 transition">
                      <ListFilter className="h-2.5 w-2.5" /> Choose Options ({listItems.length})
                    </div>
                  ) : null}

                  {/* 3. Footer Text at the VERY BOTTOM of the bubble */}
                  {showFooter && footerText.trim() ? (
                    <div className="bg-white/80 p-1.5 text-center border-t border-[#b7e3ae]">
                      <p className="text-[8.5px] text-gray-500 italic font-sans">
                        {footerText}
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 4: Campaign History & Analytics Table */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3.5 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 className="font-extrabold text-xs text-gray-900 flex items-center gap-2 uppercase tracking-wider">
            <History className="h-4 w-4 text-purple-600" /> Past Campaign Broadcast History & Delivery Logs
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadCampaignHistory}
            disabled={loadingHistory}
            className="h-7 text-xs text-gray-500 hover:text-gray-900 gap-1 font-bold"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingHistory ? 'animate-spin' : ''}`} /> Refresh History
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700 font-sans">
            <thead className="bg-gray-50/80 text-[10px] uppercase font-bold text-gray-500 border-b border-gray-200">
              <tr>
                <th className="p-3">Campaign Name / Tag</th>
                <th className="p-3">Date & Time Sent</th>
                <th className="p-3">Audience Count</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Delivery Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loadingHistory && campaignHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-xs text-gray-400">
                    <Loader2 className="h-4 w-4 animate-spin mx-auto mb-1 text-purple-600" /> Loading past campaigns...
                  </td>
                </tr>
              ) : campaignHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-xs text-gray-400">
                    No past campaigns launched yet. Launch your first bulk broadcast above!
                  </td>
                </tr>
              ) : (
                campaignHistory.map((camp) => {
                  const rate = camp.audienceCount > 0 ? ((camp.successCount / camp.audienceCount) * 100).toFixed(0) : '0'
                  return (
                    <tr key={camp.id} className="hover:bg-gray-50 transition">
                      <td className="p-3 font-bold text-gray-900">{camp.name}</td>
                      <td className="p-3 text-[11px] text-gray-500">
                        {new Date(camp.createdAt).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3 font-mono text-[11px] font-semibold text-gray-800">
                        {camp.audienceCount} contacts
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" /> {camp.status}
                        </span>
                      </td>
                      <td className="p-3 text-right font-extrabold text-emerald-700">
                        {rate}% ({camp.successCount}/{camp.audienceCount})
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
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
