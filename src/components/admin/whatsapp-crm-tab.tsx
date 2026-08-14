'use client'

import { useState, useEffect } from 'react'
import {
  MessageSquare,
  Send,
  Sparkles,
  Settings,
  Plus,
  Trash2,
  ListFilter,
  ExternalLink,
  Bot,
  Users,
  PhoneCall,
  Loader2,
  CheckCircle2,
  Smartphone,
  FolderGit2,
  UserCheck,
  FileCode2,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { WASettingsTab } from './wa-settings-tab'
import { WAContactsTab, ContactGroupItem } from './wa-contacts-tab'
import { toast } from 'sonner'

export function WhatsAppCrmTab() {
  const [activeTab, setActiveTab] = useState<'sender' | 'templates' | 'contacts' | 'settings'>('sender')

  // Recipient Config
  const [recipientMode, setRecipientMode] = useState<'ALL_USERS' | 'CUSTOM_NUMBERS' | 'CONTACT_GROUP'>('ALL_USERS')
  const [customPhones, setCustomPhones] = useState('')
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [groups, setGroups] = useState<ContactGroupItem[]>([])

  // Message Type Config
  const [messageType, setMessageType] = useState<'text' | 'template' | 'interactive_button' | 'interactive_list'>('text')

  // Common Message Fields
  const [headerText, setHeaderText] = useState('')
  const [messageText, setMessageText] = useState('నమస్కారం {name}, చౌటుప్పల్ యాప్ లో కొత్త అవకాశాలు ప్రారంభమయ్యాయి!')
  const [footerText, setFooterText] = useState('Choutuppal App • choutuppal.in')

  // Template Config
  const [templateName, setTemplateName] = useState('hello_world')
  const [templateLanguage, setTemplateLanguage] = useState('en_US')

  // Interactive Buttons Config
  const [buttonType, setButtonType] = useState<'quick_reply' | 'cta_url'>('quick_reply')
  const [buttons, setButtons] = useState<{ id: string; title: string }[]>([
    { id: 'btn_1', title: 'వివరాలు కావాలి' },
    { id: 'btn_2', title: 'యాప్ ఓపెన్ చేయి' },
  ])
  const [ctaTitle, setCtaTitle] = useState('విజిట్ చేయండి')
  const [ctaUrl, setCtaUrl] = useState('https://choutuppal.in')

  // List Message Config
  const [listButtonTitle, setListButtonTitle] = useState('ఆప్షన్లు ఎంచుకోండి')
  const [listSectionTitle, setListSectionTitle] = useState('సేవలు')
  const [listOptions, setListOptions] = useState<{ id: string; title: string; description: string }[]>([
    { id: 'opt_1', title: 'బిజినెస్ లిస్టింగ్స్', description: 'స్థానిక షాపులు & వ్యాపారాలు' },
    { id: 'opt_2', title: 'రియల్ ఎస్టేట్', description: 'ఇండ్లు, ప్లాట్లు, అద్దెలు' },
    { id: 'opt_3', title: 'లోకల్ వార్తలు', description: 'తాజా రోజువారీ విశేషాలు' },
  ])

  // Sending State
  const [sending, setSending] = useState(false)
  const [lastResult, setLastResult] = useState<any>(null)

  useEffect(() => {
    fetchGroups()
  }, [])

  async function fetchGroups() {
    try {
      const res = await fetch('/api/admin/whatsapp/groups')
      const data = await res.json()
      if (res.ok && data.groups) {
        setGroups(data.groups)
        if (data.groups.length > 0 && !selectedGroupId) {
          setSelectedGroupId(data.groups[0].id)
        }
      }
    } catch (err) {
      console.error('Failed to fetch groups for audience selection:', err)
    }
  }

  function addQuickReplyButton() {
    if (buttons.length >= 3) {
      toast.error('Quick Reply buttons are limited to 3 per message.')
      return
    }
    setButtons([...buttons, { id: `btn_${buttons.length + 1}`, title: `Button ${buttons.length + 1}` }])
  }

  function removeQuickReplyButton(index: number) {
    setButtons(buttons.filter((_, i) => i !== index))
  }

  function updateQuickReplyButton(index: number, title: string) {
    const next = [...buttons]
    next[index].title = title
    setButtons(next)
  }

  function addListOption() {
    if (listOptions.length >= 4) {
      toast.error('Maximum 4 options allowed in demo builder.')
      return
    }
    setListOptions([
      ...listOptions,
      { id: `opt_${listOptions.length + 1}`, title: `Option ${listOptions.length + 1}`, description: '' },
    ])
  }

  function removeListOption(index: number) {
    setListOptions(listOptions.filter((_, i) => i !== index))
  }

  function updateListOption(index: number, field: 'title' | 'description', val: string) {
    const next = [...listOptions]
    next[index][field] = val
    setListOptions(next)
  }

  async function handleSendCampaign() {
    if (!messageText.trim() && messageType !== 'template') {
      toast.error('Message text is required.')
      return
    }
    if (recipientMode === 'CUSTOM_NUMBERS' && !customPhones.trim()) {
      toast.error('Please enter recipient phone numbers.')
      return
    }
    if (recipientMode === 'CONTACT_GROUP' && !selectedGroupId) {
      toast.error('Please select a contact group.')
      return
    }

    try {
      setSending(true)
      setLastResult(null)

      const payload = {
        recipientMode,
        groupId: selectedGroupId,
        customPhones,
        messageText,
        messageType,
        headerText,
        footerText,
        templateName,
        templateLanguage,
        buttonType,
        buttons,
        ctaTitle,
        ctaUrl,
        listButtonTitle,
        listSectionTitle,
        listOptions,
      }

      const res = await fetch('/api/admin/whatsapp/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to dispatch campaign')

      setLastResult(data)
      toast.success(`Campaign Dispatched! Successfully sent to ${data.successCount} recipients.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Campaign dispatch failed')
    } finally {
      setSending(false)
    }
  }

  // Pre-built Marketing Templates Loader
  function applyPrebuiltTemplate(type: 'welcome' | 'festival' | 'expired' | 'realestate') {
    if (type === 'welcome') {
      setMessageType('interactive_button')
      setButtonType('cta_url')
      setHeaderText('Choutuppal App Business Onboarding')
      setMessageText('నమస్కారం {name}! చౌటుప్పల్ యాప్ లో మీ బిజినెస్ ని ఉచితంగా లిస్ట్ చేయండి.')
      setFooterText('Choutuppal App • choutuppal.in')
      setCtaTitle('List Now')
      setCtaUrl('https://choutuppal.in/dashboard')
    } else if (type === 'festival') {
      setMessageType('interactive_button')
      setButtonType('cta_url')
      setHeaderText('పండగ ఆఫర్లు & శుభాకాంక్షలు 🎉')
      setMessageText('మీకు మరియు మీ కుటుంబానికి పండగ శుభాకాంక్షలు! చౌటుప్పల్ లో ప్రత్యేక ఆఫర్లు చూడండి.')
      setFooterText('Choutuppal App Community')
      setCtaTitle('View Offers')
      setCtaUrl('https://choutuppal.in')
    } else if (type === 'expired') {
      setMessageType('interactive_button')
      setButtonType('quick_reply')
      setHeaderText('Listing Status Alert')
      setMessageText('నమస్కారం {name}! మీ బిజినెస్ లిస్టింగ్ గడువు ముగిసింది. దయచేసి వివరాలను అప్డేట్ చేయండి.')
      setFooterText('Support Hotline: 9441348175')
      setButtons([
        { id: 'btn_1', title: 'Update Now' },
        { id: 'btn_2', title: 'Talk to Agent' },
      ])
    } else if (type === 'realestate') {
      setMessageType('interactive_list')
      setHeaderText('New Real Estate Opportunities')
      setMessageText('చౌటుప్పల్ లో కొత్త ప్లాట్లు మరియు ఇండ్లు అందుబాటులో ఉన్నాయి. క్రింది కేటగిరీ ఎంచుకోండి:')
      setFooterText('Choutuppal Real Estate Engine')
      setListButtonTitle('కేటగిరీలు ఎంచుకోండి')
      setListSectionTitle('Property Options')
      setListOptions([
        { id: 'opt_1', title: 'Open Plots', description: 'హైవే కి దగ్గరలో ప్లాట్లు' },
        { id: 'opt_2', title: '2BHK Independent House', description: 'కొత్తగా నిర్మించిన ఇండ్లు' },
        { id: 'opt_3', title: 'Rental Commercial Space', description: 'షాపులు & ఆఫీసు స్థలాలు' },
      ])
    }

    setActiveTab('sender')
    toast.success('Template loaded into Campaign Builder!')
  }

  const selectedGroupObj = groups.find((g) => g.id === selectedGroupId)

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>A to Z Ready-to-Use WhatsApp Lead Machine</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">WhatsApp Marketing & Automated CRM</h1>
          <p className="mt-1 text-xs text-slate-300">
            Auto-Replies, Pre-built Marketing Templates, Smart Lead Capture & Meta Cloud API Bulk Campaigns.
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 max-w-2xl">
          <TabsTrigger value="sender" className="gap-2 text-xs font-bold">
            <Send className="h-3.5 w-3.5" />
            <span>Campaign Builder</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2 text-xs font-bold">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>Saved Templates</span>
          </TabsTrigger>
          <TabsTrigger value="contacts" className="gap-2 text-xs font-bold">
            <Users className="h-3.5 w-3.5" />
            <span>Contacts & Groups</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 text-xs font-bold">
            <Settings className="h-3.5 w-3.5" />
            <span>API Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Campaign Builder Sub-Tab */}
        <TabsContent value="sender" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Builder Form (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Recipient Target Selection */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>1. Select Audience & Target Group</span>
                </h3>

                <div className="grid grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setRecipientMode('ALL_USERS')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                      recipientMode === 'ALL_USERS'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="h-4 w-4 mb-1 text-blue-600" />
                    <span className="text-[11px]">All App Users</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecipientMode('CONTACT_GROUP')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                      recipientMode === 'CONTACT_GROUP'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <FolderGit2 className="h-4 w-4 mb-1 text-amber-500" />
                    <span className="text-[11px]">Contact Group</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecipientMode('CUSTOM_NUMBERS')}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                      recipientMode === 'CUSTOM_NUMBERS'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <PhoneCall className="h-4 w-4 mb-1 text-emerald-600" />
                    <span className="text-[11px]">Custom List</span>
                  </button>
                </div>

                {recipientMode === 'CONTACT_GROUP' && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs font-semibold text-slate-700">Select Contact Group</Label>
                    <Select value={selectedGroupId} onValueChange={setSelectedGroupId}>
                      <SelectTrigger className="text-xs font-bold">
                        <SelectValue placeholder="Select group..." />
                      </SelectTrigger>
                      <SelectContent>
                        {groups.map((g) => (
                          <SelectItem key={g.id} value={g.id}>
                            {g.name} ({g._count?.contacts || 0} members)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {selectedGroupObj && (
                      <p className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                        Sending to {selectedGroupObj._count?.contacts || 0} contacts in [{selectedGroupObj.name}]
                      </p>
                    )}
                  </div>
                )}

                {recipientMode === 'CUSTOM_NUMBERS' && (
                  <div className="space-y-1.5 pt-2">
                    <Label className="text-xs font-semibold text-slate-700">Enter Phone Numbers (comma/line separated) *</Label>
                    <Textarea
                      value={customPhones}
                      onChange={(e) => setCustomPhones(e.target.value)}
                      placeholder="919441348175, 919876543210..."
                      rows={3}
                      className="font-mono text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Message Type Selection */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-emerald-600" />
                  <span>2. Select Message Type & Content</span>
                </h3>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Message Type</Label>
                  <Select value={messageType} onValueChange={(v: any) => setMessageType(v)}>
                    <SelectTrigger className="font-bold text-xs">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Plain Text Message</SelectItem>
                      <SelectItem value="interactive_button">Interactive Buttons (Quick Reply / CTA URL)</SelectItem>
                      <SelectItem value="interactive_list">List Message (Interactive Dropdown Menu)</SelectItem>
                      <SelectItem value="template">Meta Template Message</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Header (for buttons/lists) */}
                {(messageType === 'interactive_button' || messageType === 'interactive_list') && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Header Text (Optional)</Label>
                    <Input
                      value={headerText}
                      onChange={(e) => setHeaderText(e.target.value)}
                      placeholder="e.g. Special Offer from Choutuppal App"
                      className="text-xs"
                    />
                  </div>
                )}

                {/* Main Body Text */}
                {messageType !== 'template' && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-slate-700">Message Body Text *</Label>
                      <span className="text-[10px] text-slate-400">Supports &#123;name&#125;, &#123;phone&#125;, &#123;business&#125;</span>
                    </div>
                    <Textarea
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      rows={4}
                      className="text-xs leading-relaxed"
                    />
                  </div>
                )}

                {/* Footer Text */}
                {(messageType === 'interactive_button' || messageType === 'interactive_list') && (
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-slate-700">Footer Text (Optional)</Label>
                    <Input
                      value={footerText}
                      onChange={(e) => setFooterText(e.target.value)}
                      placeholder="e.g. Choutuppal App Official"
                      className="text-xs"
                    />
                  </div>
                )}

                {/* Interactive Buttons Config */}
                {messageType === 'interactive_button' && (
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-bold text-slate-800">Button Mode</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant={buttonType === 'quick_reply' ? 'default' : 'outline'}
                          size="sm"
                          className="h-7 text-[11px]"
                          onClick={() => setButtonType('quick_reply')}
                        >
                          Quick Replies (Max 3)
                        </Button>
                        <Button
                          type="button"
                          variant={buttonType === 'cta_url' ? 'default' : 'outline'}
                          size="sm"
                          className="h-7 text-[11px]"
                          onClick={() => setButtonType('cta_url')}
                        >
                          CTA URL Button
                        </Button>
                      </div>
                    </div>

                    {buttonType === 'quick_reply' ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-700">Quick Reply Buttons</span>
                          {buttons.length < 3 && (
                            <Button type="button" variant="ghost" size="sm" className="h-6 text-[11px] gap-1 text-blue-600" onClick={addQuickReplyButton}>
                              <Plus className="h-3 w-3" /> Add Button
                            </Button>
                          )}
                        </div>

                        {buttons.map((btn, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input
                              value={btn.title}
                              onChange={(e) => updateQuickReplyButton(idx, e.target.value)}
                              placeholder={`Button ${idx + 1} text`}
                              maxLength={20}
                              className="text-xs"
                            />
                            {buttons.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-rose-500" onClick={() => removeQuickReplyButton(idx)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs font-semibold text-slate-700">Button Label</Label>
                          <Input value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} placeholder="Visit Website" className="text-xs" />
                        </div>
                        <div>
                          <Label className="text-xs font-semibold text-slate-700">Target URL</Label>
                          <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="https://choutuppal.in" className="text-xs font-mono" />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* List Message Config */}
                {messageType === 'interactive_list' && (
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">List Button Label</Label>
                        <Input value={listButtonTitle} onChange={(e) => setListButtonTitle(e.target.value)} placeholder="Select Option" className="text-xs" />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Section Title</Label>
                        <Input value={listSectionTitle} onChange={(e) => setListSectionTitle(e.target.value)} placeholder="Services Menu" className="text-xs" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">List Menu Options</span>
                        {listOptions.length < 4 && (
                          <Button type="button" variant="ghost" size="sm" className="h-6 text-[11px] gap-1 text-blue-600" onClick={addListOption}>
                            <Plus className="h-3 w-3" /> Add Option
                          </Button>
                        )}
                      </div>

                      {listOptions.map((opt, idx) => (
                        <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 space-y-2 relative">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-500">Option {idx + 1}</span>
                            {listOptions.length > 1 && (
                              <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-rose-500" onClick={() => removeListOption(idx)}>
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                          <Input
                            value={opt.title}
                            onChange={(e) => updateListOption(idx, 'title', e.target.value)}
                            placeholder="Option Title (e.g. Real Estate)"
                            maxLength={24}
                            className="text-xs font-bold"
                          />
                          <Input
                            value={opt.description}
                            onChange={(e) => updateListOption(idx, 'description', e.target.value)}
                            placeholder="Option Description"
                            maxLength={72}
                            className="text-xs text-slate-600"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Template Config */}
                {messageType === 'template' && (
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Template Name *</Label>
                        <Input value={templateName} onChange={(e) => setTemplateName(e.target.value)} placeholder="hello_world" className="text-xs font-mono" />
                      </div>
                      <div>
                        <Label className="text-xs font-semibold text-slate-700">Language Code</Label>
                        <Input value={templateLanguage} onChange={(e) => setTemplateLanguage(e.target.value)} placeholder="en_US" className="text-xs font-mono" />
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Template must be pre-approved inside your Meta WhatsApp Manager Dashboard.
                    </p>
                  </div>
                )}
              </div>

              {/* Submit Campaign Button */}
              <Button
                onClick={handleSendCampaign}
                disabled={sending}
                className="w-full py-6 text-base font-extrabold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-600/20"
              >
                {sending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Send className="h-5 w-5 mr-2" />}
                <span>Send WhatsApp Campaign Now</span>
              </Button>

              {/* Result Summary Card */}
              {lastResult && (
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-5 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Campaign Completed Successfully!</span>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Total Recipients: <b>{lastResult.total}</b> • Delivered: <b>{lastResult.successCount}</b> • Failed: <b>{lastResult.failedCount}</b>
                  </p>
                </div>
              )}
            </div>

            {/* Right Column: Live Mobile WhatsApp Message Preview (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="sticky top-6">
                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-700">
                  <Smartphone className="h-4 w-4 text-emerald-600" />
                  <span>Live WhatsApp Chat Preview</span>
                </div>

                {/* Phone Device Mockup */}
                <div className="overflow-hidden rounded-[36px] border-[8px] border-slate-900 bg-[#efeae2] shadow-2xl">
                  {/* Chat Header */}
                  <div className="bg-[#075e54] px-4 py-3 text-white flex items-center gap-3">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-400/20 text-white font-bold text-xs">
                      CA
                    </div>
                    <div>
                      <h4 className="text-xs font-bold leading-none">Choutuppal App Official</h4>
                      <span className="text-[10px] text-emerald-200">Business Account</span>
                    </div>
                  </div>

                  {/* Message Bubble Container */}
                  <div className="p-4 space-y-3 min-h-[380px] flex flex-col justify-end bg-[radial-gradient(#0000000a_1px,transparent_1px)] [background-size:16px_16px]">
                    <div className="max-w-[85%] self-start rounded-2xl rounded-tl-none bg-white p-3.5 shadow-md border border-slate-100 text-slate-800 space-y-2">
                      {/* Header text */}
                      {headerText && <h5 className="text-xs font-extrabold text-slate-900 leading-snug">{headerText}</h5>}

                      {/* Body text */}
                      <p className="text-xs leading-relaxed whitespace-pre-wrap">
                        {messageType === 'template'
                          ? `[Template: ${templateName}] Hello! Thank you for using Choutuppal App.`
                          : messageText.replace(/\{name\}/g, 'రమేష్').replace(/\{business\}/g, 'Choutuppal App')}
                      </p>

                      {/* Footer text */}
                      {footerText && <p className="text-[10px] text-slate-400 pt-1">{footerText}</p>}

                      {/* Time stamp */}
                      <div className="text-[9px] text-slate-400 text-right">10:45 AM</div>
                    </div>

                    {/* Interactive Buttons Preview */}
                    {messageType === 'interactive_button' && (
                      <div className="max-w-[85%] self-start space-y-1">
                        {buttonType === 'quick_reply' ? (
                          buttons.map((b, i) => (
                            <div key={i} className="rounded-xl bg-white border border-slate-200 p-2.5 text-center text-xs font-bold text-emerald-600 shadow-sm">
                              {b.title}
                            </div>
                          ))
                        ) : (
                          <div className="rounded-xl bg-white border border-slate-200 p-2.5 text-center text-xs font-bold text-emerald-600 shadow-sm flex items-center justify-center gap-1.5">
                            <ExternalLink className="h-3.5 w-3.5" />
                            <span>{ctaTitle}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* List Message Preview */}
                    {messageType === 'interactive_list' && (
                      <div className="max-w-[85%] self-start">
                        <div className="rounded-xl bg-white border border-slate-200 p-2.5 text-center text-xs font-bold text-emerald-600 shadow-sm flex items-center justify-center gap-1.5">
                          <ListFilter className="h-3.5 w-3.5" />
                          <span>{listButtonTitle}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Pre-built Saved Templates Sub-Tab */}
        <TabsContent value="templates" className="mt-6 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Pre-built Marketing Templates Library</span>
              </h3>
              <p className="text-xs text-slate-500">
                Click &quot;Use Template&quot; on any ready-to-use marketing template below to load it into the Campaign Builder.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Template 1: Welcome Offer */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                      1. Welcome Offer
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">CTA Button</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    &quot;నమస్కారం &#123;name&#125;! చౌటుప్పల్ యాప్ లో మీ బిజినెస్ ని ఉచితంగా లిస్ట్ చేయండి.&quot;
                  </p>
                  <div className="text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-slate-200">
                    Button: <span className="font-bold text-emerald-600">List Now &rarr; https://choutuppal.in/dashboard</span>
                  </div>
                </div>
                <Button onClick={() => applyPrebuiltTemplate('welcome')} size="sm" className="w-full gap-1.5 bg-blue-600 text-white font-bold text-xs mt-2">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>Use Template</span>
                </Button>
              </div>

              {/* Template 2: Festival Greeting */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      2. Festival Greeting 🎉
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">CTA Button</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    &quot;మీకు మరియు మీ కుటుంబానికి పండగ శుభాకాంక్షలు! చౌటుప్పల్ లో ప్రత్యేక ఆఫర్లు చూడండి.&quot;
                  </p>
                  <div className="text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-slate-200">
                    Button: <span className="font-bold text-emerald-600">View Offers &rarr; https://choutuppal.in</span>
                  </div>
                </div>
                <Button onClick={() => applyPrebuiltTemplate('festival')} size="sm" className="w-full gap-1.5 bg-blue-600 text-white font-bold text-xs mt-2">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>Use Template</span>
                </Button>
              </div>

              {/* Template 3: Expired Listing */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      3. Expired Listing
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">Quick Replies</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    &quot;నమస్కారం &#123;name&#125;! మీ బిజినెస్ లిస్టింగ్ గడువు ముగిసింది. దయచేసి వివరాలను అప్డేట్ చేయండి.&quot;
                  </p>
                  <div className="text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-slate-200 flex gap-2">
                    <span className="font-bold text-blue-600">[Update Now]</span>
                    <span className="font-bold text-blue-600">[Talk to Agent]</span>
                  </div>
                </div>
                <Button onClick={() => applyPrebuiltTemplate('expired')} size="sm" className="w-full gap-1.5 bg-blue-600 text-white font-bold text-xs mt-2">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>Use Template</span>
                </Button>
              </div>

              {/* Template 4: Real Estate Lead */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      4. Real Estate Lead
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">List Message</span>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    &quot;చౌటుప్పల్ లో కొత్త ప్లాట్లు మరియు ఇండ్లు అందుబాటులో ఉన్నాయి. క్రింది కేటగిరీ ఎంచుకోండి:&quot;
                  </p>
                  <div className="text-[11px] text-slate-500 bg-white p-2 rounded-xl border border-slate-200">
                    Menu Options: <span className="font-bold text-emerald-600">Open Plots, 2BHK House, Commercial</span>
                  </div>
                </div>
                <Button onClick={() => applyPrebuiltTemplate('realestate')} size="sm" className="w-full gap-1.5 bg-blue-600 text-white font-bold text-xs mt-2">
                  <Zap className="h-3.5 w-3.5 text-amber-400" />
                  <span>Use Template</span>
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contacts" className="mt-6">
          <WAContactsTab />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <WASettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
