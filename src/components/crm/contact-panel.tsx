'use client'
import Image from 'next/image';

import { useState, useEffect } from 'react'
import {
  Phone,
  Save,
  Loader2,
  Smartphone,
  CheckCheck,
  User,
  FileText,
  Image as ImageIcon,
  ListFilter,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface ContactPanelProps {
  contact: {
    phone: string
    name?: string | null
    userType?: string | null
    tag?: string | null
    dateOfBirth?: string | null
    anniversary?: string | null
    notes?: string | null
    messageCount?: number
  } | null
  logs?: Array<{ id: string; imageUrl?: string | null; mediaUrl?: string | null }>
  onContactUpdated?: () => void
  draftMessage?: string
  previewPayload?: any
}

export function ContactPanel({
  contact,
  logs = [],
  onContactUpdated,
  draftMessage,
  previewPayload,
}: ContactPanelProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'notes' | 'media'>('info')
  const [name, setName] = useState('')
  const [tag, setTag] = useState('General')
  const [userType, setUserType] = useState('customer')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (contact) {
      setName(contact.name || '')
      setTag(contact.tag || 'General')
      setUserType(contact.userType || 'customer')
      setDateOfBirth(contact.dateOfBirth || '')
      setNotes(contact.notes || '')
    }
  }, [contact])

  if (!contact) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-xs text-gray-400 bg-white border-l border-gray-200">
        Select a conversation to view contact details, notes & live preview.
      </div>
    )
  }

  async function handleSave() {
    if (!contact) return
    setSaving(true)
    try {
      const res = await fetch(`/api/crm/contacts/${contact.phone}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, tag, userType, dateOfBirth, notes }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to update')
      toast.success('Contact details saved!')
      if (onContactUpdated) onContactUpdated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const mediaItems = logs.filter((m) => m.imageUrl || m.mediaUrl)

  // Extract preview payload details
  const previewText = previewPayload?.text || draftMessage || 'నమస్తే! చౌటుప్పల్ యాప్ తాజా ఆఫర్లు.'
  const buttons = previewPayload?.buttons || []
  const listOpts = previewPayload?.listOptions || []

  return (
    <div className="flex h-full flex-col border-l border-gray-200 bg-white font-sans text-gray-900 overflow-hidden">
      {/* Header Avatar Bar */}
      <div className="p-4 border-b border-gray-200 bg-gray-50/50 space-y-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-200">
            {(name || contact.phone).slice(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <h4 className="truncate font-bold text-xs text-gray-900">{name || 'WhatsApp Lead'}</h4>
            <p className="flex items-center gap-1 text-[11px] text-gray-500 mt-0.5">
              <Phone className="h-3 w-3 text-emerald-600" /> {contact.phone}
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 border-gray-200 bg-white text-[11px] p-0.5 border">
            <TabsTrigger value="info" className="gap-1 text-[10px] font-semibold py-1">
              <User className="h-3 w-3" /> Info
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-1 text-[10px] font-semibold py-1">
              <FileText className="h-3 w-3" /> Notes
            </TabsTrigger>
            <TabsTrigger value="media" className="gap-1 text-[10px] font-semibold py-1">
              <ImageIcon className="h-3 w-3" /> Media ({mediaItems.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 fancy-scroll">
        {activeTab === 'info' && (
          <div className="space-y-3">
            <div>
              <Label className="text-[11px] text-gray-600 font-semibold mb-1 block">Full Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="User Name"
                className="h-8 border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 rounded-lg"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-[11px] text-gray-600 font-semibold mb-1 block">User Type</Label>
                <Select value={userType} onValueChange={setUserType}>
                  <SelectTrigger className="h-8 border-gray-200 bg-white text-xs text-gray-900 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-gray-900 text-xs">
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="business_owner">Business Owner</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[11px] text-gray-600 font-semibold mb-1 block">Lead Tag</Label>
                <Select value={tag} onValueChange={setTag}>
                  <SelectTrigger className="h-8 border-gray-200 bg-white text-xs text-gray-900 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-gray-900 text-xs">
                    <SelectItem value="General">General Inquiry</SelectItem>
                    <SelectItem value="Business Owner">Business Owner</SelectItem>
                    <SelectItem value="Service Seeker">Service Seeker</SelectItem>
                    <SelectItem value="Franchise Lead">Franchise Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-[11px] text-gray-600 font-semibold mb-1 block">Date of Birth (DD-MM)</Label>
              <Input
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                placeholder="15-08"
                className="h-8 border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 rounded-lg"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white shadow-xs mt-2"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save Contact Details
            </Button>

            {/* Smartphone Live Preview Box */}
            <div className="space-y-1.5 pt-3 border-t border-gray-200">
              <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-emerald-600" /> Live WhatsApp Screen Preview
              </span>
              <div className="relative mx-auto w-full max-w-[220px] rounded-3xl border-4 border-slate-800 bg-slate-900 p-2 shadow-sm overflow-hidden">
                <div className="mx-auto mb-1.5 h-2.5 w-12 rounded-full bg-slate-800" />
                <div className="min-h-[160px] max-h-[220px] rounded-xl bg-[#efeae2] p-2 flex flex-col justify-end overflow-y-auto space-y-1.5">
                  <div className="self-end max-w-[95%] rounded-xl bg-[#d9fdd3] p-2 text-[9px] text-gray-900 border border-[#c1e8b8] shadow-2xs space-y-1">
                    <p className="whitespace-pre-wrap leading-tight font-sans">{previewText}</p>

                    {/* Button preview */}
                    {buttons.length > 0 ? (
                      <div className="pt-1 space-y-1 border-t border-[#b7e3ae]">
                        {buttons.map((b: any, i: number) => (
                          <div key={i} className="rounded bg-white p-1 text-center font-bold text-[8px] text-emerald-700 border border-emerald-200">
                            {b.title}
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {/* List preview */}
                    {listOpts.length > 0 ? (
                      <div className="pt-1 border-t border-[#b7e3ae]">
                        <div className="rounded bg-white p-1 text-center font-bold text-[8px] text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1">
                          <ListFilter className="h-2 w-2" /> Choose Options ({listOpts.length})
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
        )}

        {activeTab === 'notes' && (
          <div className="space-y-3">
            <Label className="text-[11px] text-gray-600 font-semibold block">Internal Agent / Admin Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add internal notes about this business lead, past discussions, ad preferences..."
              rows={8}
              className="border-gray-200 bg-white text-xs text-gray-900 font-sans p-3 rounded-xl focus:border-emerald-500"
            />
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white shadow-xs"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save Internal Notes
            </Button>
          </div>
        )}

        {activeTab === 'media' && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-gray-700 block">Shared Media & Attachments</span>
            {mediaItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                No images or media files shared in this chat yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {mediaItems.map((item, idx) => {
                  const src = item.imageUrl || item.mediaUrl || ''
                  return (
                    <a
                      key={item.id || idx}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square overflow-hidden rounded-xl bg-gray-100 border border-gray-200 hover:opacity-90"
                    >
                      <Image width={800} height={800} loading="lazy" decoding="async" src={src} alt="Shared media" className="h-full w-full object-cover" />
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
