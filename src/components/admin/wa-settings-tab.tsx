'use client'

import { useState, useEffect } from 'react'
import { Key, Phone, ShieldCheck, CheckCircle2, AlertCircle, Loader2, Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

export function WASettingsTab() {
  const [waToken, setWaToken] = useState('')
  const [waPhoneNumberId, setWaPhoneNumberId] = useState('')
  const [waVerifyToken, setWaVerifyToken] = useState('choutuppal_verify_token')
  const [isActive, setIsActive] = useState(true)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/whatsapp/settings')
      const data = await res.json()
      if (res.ok && data.setting) {
        setWaToken(data.setting.waToken || '')
        setWaPhoneNumberId(data.setting.waPhoneNumberId || '')
        setWaVerifyToken(data.setting.waVerifyToken || 'choutuppal_verify_token')
        setIsActive(data.setting.isActive !== false)
      }
    } catch (err) {
      toast.error('Failed to load WhatsApp settings')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!waToken.trim() || !waPhoneNumberId.trim()) {
      toast.error('WhatsApp Access Token and Phone Number ID are required.')
      return
    }

    try {
      setSaving(true)
      const res = await fetch('/api/admin/whatsapp/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waToken: waToken.trim(),
          waPhoneNumberId: waPhoneNumberId.trim(),
          waVerifyToken: waVerifyToken.trim(),
          isActive,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error || 'Failed to save settings')

      toast.success('WhatsApp API Settings saved successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900">WhatsApp API Configuration</h2>
        <p className="text-xs text-slate-500">
          Manage your Meta WhatsApp Cloud API tokens and Phone Number IDs dynamically stored in the database.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* Token */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Key className="h-3.5 w-3.5 text-blue-600" />
            <span>WhatsApp Permanent Access Token *</span>
          </Label>
          <Input
            type="password"
            value={waToken}
            onChange={(e) => setWaToken(e.target.value)}
            placeholder="EAAG..."
            className="font-mono text-xs"
          />
          <p className="text-[11px] text-slate-400">
            From Meta Developer Console &gt; WhatsApp &gt; API Setup (Bearer Token).
          </p>
        </div>

        {/* Phone Number ID */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <Phone className="h-3.5 w-3.5 text-emerald-600" />
            <span>WhatsApp Phone Number ID *</span>
          </Label>
          <Input
            value={waPhoneNumberId}
            onChange={(e) => setWaPhoneNumberId(e.target.value)}
            placeholder="104928374920..."
            className="font-mono text-xs"
          />
          <p className="text-[11px] text-slate-400">
            Numerical ID from Meta Cloud API settings (e.g., 104928374920192).
          </p>
        </div>

        {/* Webhook Verify Token */}
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" />
            <span>Meta Webhook Verification Token</span>
          </Label>
          <Input
            value={waVerifyToken}
            onChange={(e) => setWaVerifyToken(e.target.value)}
            placeholder="choutuppal_verify_token"
            className="font-mono text-xs"
          />
          <p className="text-[11px] text-slate-400">
            Secret string used to verify incoming Webhook requests from Meta.
          </p>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-800">Enable Dynamic Database API Config</span>
            <p className="text-[11px] text-slate-500">
              When enabled, the app will use database credentials instead of process.env fallback.
            </p>
          </div>
          <Switch checked={isActive} onCheckedChange={setIsActive} />
        </div>

        {/* Save Button */}
        <Button
          type="submit"
          disabled={saving}
          className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          <span>Save API Credentials</span>
        </Button>
      </form>
    </div>
  )
}
