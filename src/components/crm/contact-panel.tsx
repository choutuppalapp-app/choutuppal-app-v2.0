'use client'

import { useState, useEffect } from 'react'
import { Phone, Save, Loader2, Smartphone, CheckCheck } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

interface ContactPanelProps {
  contact: {
    phone: string
    name?: string | null
    userType?: string | null
    tag?: string | null
    dateOfBirth?: string | null
    anniversary?: string | null
    messageCount?: number
  } | null
  onContactUpdated?: () => void
  draftMessage?: string
}

export function ContactPanel({ contact, onContactUpdated, draftMessage }: ContactPanelProps) {
  const [name, setName] = useState('')
  const [tag, setTag] = useState('General')
  const [userType, setUserType] = useState('customer')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (contact) {
      setName(contact.name || '')
      setTag(contact.tag || 'General')
      setUserType(contact.userType || 'customer')
      setDateOfBirth(contact.dateOfBirth || '')
    }
  }, [contact])

  if (!contact) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-xs text-gray-400 bg-white border-l border-gray-200">
        Select a conversation to view contact details & live preview.
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
        body: JSON.stringify({ name, tag, userType, dateOfBirth }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to update')
      toast.success('Contact details updated!')
      if (onContactUpdated) onContactUpdated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex h-full flex-col border-l border-gray-200 bg-white p-4 space-y-4 overflow-y-auto fancy-scroll">
      <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Contact & Live Preview</h3>
        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
          Verified Lead
        </span>
      </div>

      {/* Avatar & Phone */}
      <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 border border-gray-200">
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

      {/* Contact Metadata Form */}
      <div className="space-y-2.5">
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

        <div className="flex gap-2">
          <div className="flex-1">
            <Label className="text-[11px] text-gray-600 font-semibold mb-1 block">DOB (DD-MM)</Label>
            <Input
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              placeholder="15-08"
              className="h-8 border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 rounded-lg"
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white px-3 shadow-xs"
            >
              {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />} Save
            </Button>
          </div>
        </div>
      </div>

      {/* Right-Side Live Smartphone Preview Box */}
      <div className="space-y-2 pt-2 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-700 flex items-center gap-1.5">
            <Smartphone className="h-3.5 w-3.5 text-emerald-600" /> Live WhatsApp Mobile Screen Preview
          </span>
        </div>

        {/* Smartphone Frame Container */}
        <div className="relative mx-auto w-full max-w-[240px] rounded-3xl border-4 border-slate-800 bg-slate-900 p-2 shadow-lg overflow-hidden">
          {/* Top Notch */}
          <div className="mx-auto mb-2 h-3 w-16 rounded-full bg-slate-800" />

          {/* Screen Content */}
          <div className="min-h-[160px] max-h-[220px] rounded-2xl bg-[#efeae2] p-2 flex flex-col justify-end overflow-y-auto">
            <div className="self-end max-w-[90%] rounded-xl bg-[#d9fdd3] p-2 text-[10px] text-gray-900 border border-[#c1e8b8] shadow-2xs">
              <p className="whitespace-pre-wrap leading-tight">
                {draftMessage || 'నమస్తే! చౌటుప్పల్ యాప్ తాజా ఆఫర్లు & వార్తల కోసం ఇక్కడ క్లిక్ చేయండి.'}
              </p>
              <div className="mt-1 flex items-center justify-end gap-1 text-[8px] text-emerald-700 font-bold">
                <span>12:00 PM</span>
                <CheckCheck className="h-2.5 w-2.5 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
