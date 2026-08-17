'use client'

import { useState, useEffect } from 'react'
import { Phone, Save, Loader2 } from 'lucide-react'
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
}

export function ContactPanel({ contact, onContactUpdated }: ContactPanelProps) {
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
        Select a conversation to view contact metadata.
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
    <div className="flex h-full flex-col border-l border-gray-200 bg-white p-4 space-y-5 overflow-y-auto">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">Contact Metadata</h3>
        <span className="rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
          WhatsApp Lead
        </span>
      </div>

      {/* Avatar & Phone */}
      <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-3 border border-gray-200">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blue-100 text-blue-700 font-black text-sm border border-blue-200">
          {(name || contact.phone).slice(0, 2).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <h4 className="truncate font-bold text-sm text-gray-900">{name || 'WhatsApp Lead'}</h4>
          <p className="flex items-center gap-1 text-xs text-gray-500 mt-0.5">
            <Phone className="h-3 w-3 text-blue-600" /> {contact.phone}
          </p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-3">
        <div>
          <Label className="text-[11px] text-gray-600 font-semibold mb-1 block">Full Name</Label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="User Name"
            className="h-8 border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 rounded-lg"
          />
        </div>

        <div>
          <Label className="text-[11px] text-gray-600 font-semibold mb-1 block">User Type</Label>
          <Select value={userType} onValueChange={setUserType}>
            <SelectTrigger className="h-8 border-gray-200 bg-white text-xs text-gray-900 rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 text-gray-900 text-xs">
              <SelectItem value="customer">Customer / Service Seeker</SelectItem>
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
              <SelectItem value="News Lead">News Lead</SelectItem>
              <SelectItem value="Ad Lead">Ad Lead</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-[11px] text-gray-600 font-semibold mb-1 block">Date of Birth (DD-MM)</Label>
          <Input
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            placeholder="15-08"
            className="h-8 border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 rounded-lg"
          />
        </div>
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="w-full gap-2 bg-blue-600 hover:bg-blue-700 font-bold text-xs text-white h-9 shadow-xs"
      >
        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
        Save Metadata
      </Button>
    </div>
  )
}
