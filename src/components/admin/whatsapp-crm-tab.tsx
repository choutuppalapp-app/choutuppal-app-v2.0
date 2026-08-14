'use client'

import { useState } from 'react'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { WASettingsTab } from './wa-settings-tab'
import { toast } from 'sonner'

export function WhatsAppCrmTab() {
  const [activeTab, setActiveTab] = useState<'sender' | 'settings'>('sender')

  // Recipient Config
  const [recipientMode, setRecipientMode] = useState<'ALL_USERS' | 'CUSTOM_NUMBERS'>('ALL_USERS')
  const [customPhones, setCustomPhones] = useState('')

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

    try {
      setSending(true)
      setLastResult(null)

      const payload = {
        recipientMode,
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
      toast.success(`Campaign Dispatched! Successfully sent to ${data.successCount} users.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Campaign dispatch failed')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-blue-950 p-6 text-white shadow-xl sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ultimate WhatsApp CRM (WiseSender Engine)</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight sm:text-3xl">WhatsApp Marketing & Automated CRM</h1>
          <p className="mt-1 text-xs text-slate-300">
            Send Interactive Buttons, Dynamic Lists, Templates, and Text campaigns backed by Meta Cloud API.
          </p>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="sender" className="gap-2 text-xs font-bold">
            <Send className="h-3.5 w-3.5" />
            <span>Campaign Builder</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 text-xs font-bold">
            <Settings className="h-3.5 w-3.5" />
            <span>API Credentials Settings</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sender" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Left Column: Builder Form (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Recipient Target Selection */}
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span>1. Select Audience & Recipients</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRecipientMode('ALL_USERS')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all ${
                      recipientMode === 'ALL_USERS'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="h-5 w-5 mb-1 text-blue-600" />
                    <span className="text-xs">All Registered Users</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRecipientMode('CUSTOM_NUMBERS')}
                    className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all ${
                      recipientMode === 'CUSTOM_NUMBERS'
                        ? 'border-blue-600 bg-blue-50/50 text-blue-700 font-bold shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <PhoneCall className="h-5 w-5 mb-1 text-emerald-600" />
                    <span className="text-xs">Custom Phone List</span>
                  </button>
                </div>

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

        <TabsContent value="settings" className="mt-6">
          <WASettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
