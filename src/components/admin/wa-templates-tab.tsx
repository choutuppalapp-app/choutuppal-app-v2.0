'use client'

import { useState, useEffect } from 'react'
import {
  Zap,
  Plus,
  Trash2,
  Loader2,
  FileText,
  MousePointerClick,
  ListFilter,
  CheckCircle2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

export interface WhatsAppTemplateItem {
  id: string
  name: string
  type: string
  payload: any
  createdAt: string
}

interface WATemplatesTabProps {
  onSelectTemplate: (payload: any) => void
}

const PREBUILT_TEMPLATES = [
  {
    id: 'pre_welcome',
    name: '1. Welcome Offer',
    type: 'interactive_button',
    isPrebuilt: true,
    payload: {
      messageType: 'interactive_button',
      buttonType: 'cta_url',
      headerText: 'Choutuppal App Business Onboarding',
      messageText: 'నమస్కారం {name}! చౌటుప్పల్ యాప్ లో మీ బిజినెస్ ని ఉచితంగా లిస్ట్ చేయండి.',
      footerText: 'Choutuppal App • choutuppal.in',
      ctaTitle: 'List Now',
      ctaUrl: 'https://choutuppal.in/dashboard',
    },
  },
  {
    id: 'pre_festival',
    name: '2. Festival Greeting 🎉',
    type: 'interactive_button',
    isPrebuilt: true,
    payload: {
      messageType: 'interactive_button',
      buttonType: 'cta_url',
      headerText: 'పండగ ఆఫర్లు & శుభాకాంక్షలు 🎉',
      messageText: 'మీకు మరియు మీ కుటుంబానికి పండగ శుభాకాంక్షలు! చౌటుప్పల్ లో ప్రత్యేక ఆఫర్లు చూడండి.',
      footerText: 'Choutuppal App Community',
      ctaTitle: 'View Offers',
      ctaUrl: 'https://choutuppal.in',
    },
  },
  {
    id: 'pre_expired',
    name: '3. Expired Listing',
    type: 'interactive_button',
    isPrebuilt: true,
    payload: {
      messageType: 'interactive_button',
      buttonType: 'quick_reply',
      headerText: 'Listing Status Alert',
      messageText: 'నమస్కారం {name}! మీ బిజినెస్ లిస్టింగ్ గడువు ముగిసింది. దయచేసి వివరాలను అప్డేట్ చేయండి.',
      footerText: 'Support Hotline: 9441348175',
      buttons: [
        { id: 'btn_1', title: 'Update Now' },
        { id: 'btn_2', title: 'Talk to Agent' },
      ],
    },
  },
  {
    id: 'pre_realestate',
    name: '4. Real Estate Lead',
    type: 'interactive_list',
    isPrebuilt: true,
    payload: {
      messageType: 'interactive_list',
      headerText: 'New Real Estate Opportunities',
      messageText: 'చౌటుప్పల్ లో కొత్త ప్లాట్లు మరియు ఇండ్లు అందుబాటులో ఉన్నాయి. క్రింది కేటగిరీ ఎంచుకోండి:',
      footerText: 'Choutuppal Real Estate Engine',
      listButtonTitle: 'కేటగిరీలు ఎంచుకోండి',
      listSectionTitle: 'Property Options',
      listOptions: [
        { id: 'opt_1', title: 'Open Plots', description: 'హైవే కి దగ్గరలో ప్లాట్లు' },
        { id: 'opt_2', title: '2BHK Independent House', description: 'కొత్తగా నిర్మించిన ఇండ్లు' },
        { id: 'opt_3', title: 'Rental Commercial Space', description: 'షాపులు & ఆఫీసు స్థలాలు' },
      ],
    },
  },
]

export function WATemplatesTab({ onSelectTemplate }: WATemplatesTabProps) {
  const [customTemplates, setCustomTemplates] = useState<WhatsAppTemplateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  // Builder Form State
  const [name, setName] = useState('')
  const [type, setType] = useState<'text' | 'interactive_button' | 'interactive_list'>('interactive_button')
  const [headerText, setHeaderText] = useState('')
  const [messageText, setMessageText] = useState('')
  const [footerText, setFooterText] = useState('')

  // Buttons Config State
  const [buttonType, setButtonType] = useState<'quick_reply' | 'cta_url'>('quick_reply')
  const [buttons, setButtons] = useState<{ id: string; title: string }[]>([
    { id: 'btn_1', title: 'వివరాలు కావాలి' },
    { id: 'btn_2', title: 'యాప్ ఓపెన్ చేయి' },
  ])
  const [ctaTitle, setCtaTitle] = useState('విజిట్ చేయండి')
  const [ctaUrl, setCtaUrl] = useState('https://choutuppal.in')

  // List Config State
  const [listButtonTitle, setListButtonTitle] = useState('ఆప్షన్లు ఎంచుకోండి')
  const [listSectionTitle, setListSectionTitle] = useState('సేవలు')
  const [listOptions, setListOptions] = useState<{ id: string; title: string; description: string }[]>([
    { id: 'opt_1', title: 'బిజినెస్ లిస్టింగ్స్', description: 'స్థానిక షాపులు & వ్యాపారాలు' },
    { id: 'opt_2', title: 'రియల్ ఎస్టేట్', description: 'ఇండ్లు, ప్లాట్లు, అద్దెలు' },
  ])

  useEffect(() => {
    fetchTemplates()
  }, [])

  async function fetchTemplates() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/whatsapp/templates')
      const data = await res.json()
      if (res.ok && data.templates) {
        setCustomTemplates(data.templates)
      }
    } catch (err) {
      toast.error('Failed to load custom templates.')
    } finally {
      setLoading(false)
    }
  }

  function handleAddQuickReply() {
    if (buttons.length >= 3) return
    setButtons([...buttons, { id: `btn_${buttons.length + 1}`, title: `Button ${buttons.length + 1}` }])
  }

  function handleAddListOption() {
    if (listOptions.length >= 4) return
    setListOptions([
      ...listOptions,
      { id: `opt_${listOptions.length + 1}`, title: `Option ${listOptions.length + 1}`, description: '' },
    ])
  }

  async function handleSaveTemplate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Template Name is required.')
      return
    }
    if (type !== 'text' && !messageText.trim()) {
      toast.error('Message Text is required.')
      return
    }

    try {
      setSaving(true)

      const payload = {
        messageType: type,
        headerText,
        messageText,
        footerText,
        buttonType,
        buttons,
        ctaTitle,
        ctaUrl,
        listButtonTitle,
        listSectionTitle,
        listOptions,
      }

      const res = await fetch('/api/admin/whatsapp/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          type,
          payload,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to save template')

      toast.success(`Template "${data.template.name}" saved!`)
      setIsDialogOpen(false)
      setName('')
      setMessageText('')
      fetchTemplates()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  async function handleDeleteTemplate(id: string) {
    if (!confirm('Are you sure you want to delete this custom template?')) return

    try {
      const res = await fetch(`/api/admin/whatsapp/templates/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete template')

      toast.success('Template deleted.')
      fetchTemplates()
    } catch (err) {
      toast.error('Failed to delete template.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Create Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <span>Saved Marketing Templates & Custom Builder</span>
          </h2>
          <p className="text-xs text-slate-500">
            Create reusable templates for Interactive Buttons, Dropdown Lists, and Offer Broadcasts.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2 font-bold bg-emerald-600 text-white hover:bg-emerald-700">
              <Plus className="h-4 w-4" />
              <span>Create New Template</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-500" />
                <span>Create Custom WhatsApp Template</span>
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSaveTemplate} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Template Name *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Diwali Offer Banner CTA"
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Message Type *</Label>
                <Select value={type} onValueChange={(v: any) => setType(v)}>
                  <SelectTrigger className="text-xs font-bold">
                    <SelectValue placeholder="Select type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Plain Text</SelectItem>
                    <SelectItem value="interactive_button">Interactive Buttons (Quick Reply / CTA URL)</SelectItem>
                    <SelectItem value="interactive_list">List Message (Dropdown Menu)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type !== 'text' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Header Text (Optional)</Label>
                  <Input value={headerText} onChange={(e) => setHeaderText(e.target.value)} placeholder="e.g. Special Offer" className="text-xs" />
                </div>
              )}

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-slate-700">Message Body Text *</Label>
                <Textarea value={messageText} onChange={(e) => setMessageText(e.target.value)} rows={3} placeholder="నమస్కారం {name}..." className="text-xs" />
              </div>

              {type !== 'text' && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Footer Text (Optional)</Label>
                  <Input value={footerText} onChange={(e) => setFooterText(e.target.value)} placeholder="e.g. Choutuppal App Official" className="text-xs" />
                </div>
              )}

              {/* Dynamic Buttons Builder */}
              {type === 'interactive_button' && (
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-800">Button Mode</Label>
                    <div className="flex gap-2">
                      <Button type="button" variant={buttonType === 'quick_reply' ? 'default' : 'outline'} size="sm" className="h-6 text-[10px]" onClick={() => setButtonType('quick_reply')}>
                        Quick Reply
                      </Button>
                      <Button type="button" variant={buttonType === 'cta_url' ? 'default' : 'outline'} size="sm" className="h-6 text-[10px]" onClick={() => setButtonType('cta_url')}>
                        CTA URL
                      </Button>
                    </div>
                  </div>

                  {buttonType === 'quick_reply' ? (
                    <div className="space-y-2">
                      {buttons.map((b, i) => (
                        <Input
                          key={i}
                          value={b.title}
                          onChange={(e) => {
                            const next = [...buttons]
                            next[i].title = e.target.value
                            setButtons(next)
                          }}
                          placeholder={`Button ${i + 1}`}
                          className="text-xs"
                        />
                      ))}
                      {buttons.length < 3 && (
                        <Button type="button" variant="ghost" size="sm" className="text-[11px] text-blue-600 h-6" onClick={handleAddQuickReply}>
                          + Add Quick Reply
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Input value={ctaTitle} onChange={(e) => setCtaTitle(e.target.value)} placeholder="Button Title (e.g. Visit App)" className="text-xs" />
                      <Input value={ctaUrl} onChange={(e) => setCtaUrl(e.target.value)} placeholder="Target URL" className="text-xs font-mono" />
                    </div>
                  )}
                </div>
              )}

              {/* Dynamic List Builder */}
              {type === 'interactive_list' && (
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input value={listButtonTitle} onChange={(e) => setListButtonTitle(e.target.value)} placeholder="List Button Label" className="text-xs" />
                    <Input value={listSectionTitle} onChange={(e) => setListSectionTitle(e.target.value)} placeholder="Section Title" className="text-xs" />
                  </div>

                  {listOptions.map((opt, i) => (
                    <div key={i} className="p-2 bg-white rounded border space-y-1">
                      <Input
                        value={opt.title}
                        onChange={(e) => {
                          const next = [...listOptions]
                          next[i].title = e.target.value
                          setListOptions(next)
                        }}
                        placeholder={`Option ${i + 1} Title`}
                        className="text-xs font-bold"
                      />
                      <Input
                        value={opt.description}
                        onChange={(e) => {
                          const next = [...listOptions]
                          next[i].description = e.target.value
                          setListOptions(next)
                        }}
                        placeholder={`Option ${i + 1} Description`}
                        className="text-xs"
                      />
                    </div>
                  ))}
                  {listOptions.length < 4 && (
                    <Button type="button" variant="ghost" size="sm" className="text-[11px] text-blue-600 h-6" onClick={handleAddListOption}>
                      + Add Menu Option
                    </Button>
                  )}
                </div>
              )}

              <Button type="submit" disabled={saving} className="w-full bg-emerald-600 text-white font-bold">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                <span>Save Template</span>
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Render Custom Templates */}
        {customTemplates.map((t) => (
          <div key={t.id} className="rounded-2xl border border-blue-200 bg-blue-50/30 p-4 space-y-3 flex flex-col justify-between shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded-full border border-blue-200">
                  {t.name}
                </span>
                <Badge variant="outline" className="text-[10px] capitalize bg-white">
                  {t.type.replace('_', ' ')}
                </Badge>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed font-medium line-clamp-3">
                &quot;{t.payload?.messageText || 'Custom Message Template'}&quot;
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-blue-100">
              <Button
                onClick={() => onSelectTemplate(t.payload)}
                size="sm"
                className="flex-1 gap-1.5 bg-blue-600 text-white font-bold text-xs"
              >
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Use Template</span>
              </Button>

              <Button
                onClick={() => handleDeleteTemplate(t.id)}
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-rose-500"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}

        {/* Render Default Fallback Prebuilt Templates */}
        {PREBUILT_TEMPLATES.map((t) => (
          <div key={t.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-slate-800 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                  {t.name}
                </span>
                <Badge variant="secondary" className="text-[10px] bg-slate-200 text-slate-700">
                  Pre-built
                </Badge>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed font-medium line-clamp-3">
                &quot;{t.payload.messageText}&quot;
              </p>
            </div>

            <Button
              onClick={() => onSelectTemplate(t.payload)}
              size="sm"
              className="w-full gap-1.5 bg-slate-900 text-white font-bold text-xs"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Use Template</span>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
