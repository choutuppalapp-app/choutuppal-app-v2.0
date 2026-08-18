'use client'

import { useState, useEffect } from 'react'
import {
  Settings as SettingsIcon,
  Save,
  Loader2,
  Send,
  Key,
  Smartphone,
  Sparkles,
  DollarSign,
  Check,
  ShieldCheck,
  Building2,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'

export function SettingsView() {
  const [loading, setLoading] = useState(true)

  // 1. WhatsApp API Config State
  const [waToken, setWaToken] = useState('')
  const [waPhoneNumberId, setWaPhoneNumberId] = useState('')
  const [waVerifyToken, setWaVerifyToken] = useState('choutuppal_verify_token')
  const [savingWa, setSavingWa] = useState(false)

  // Test Connection State
  const [testModalOpen, setTestModalOpen] = useState(false)
  const [testPhone, setTestPhone] = useState('')
  const [testingWa, setTestingWa] = useState(false)

  // 2. AI Integration State
  const [aiProvider, setAiProvider] = useState<'Gemini' | 'OpenAI' | 'Claude'>('Gemini')
  const [aiApiKey, setAiApiKey] = useState('')
  const [savingAi, setSavingAi] = useState(false)

  // 3. Business Profile & Dynamic Pricing Config State
  const [displayName, setDisplayName] = useState('Choutuppal App')
  const [priceBannerAd, setPriceBannerAd] = useState('99')
  const [priceReelsPromo, setPriceReelsPromo] = useState('299')
  const [priceBulkMsg, setPriceBulkMsg] = useState('499')
  const [priceFranchise, setPriceFranchise] = useState('10000')
  const [savingPricing, setSavingPricing] = useState(false)

  useEffect(() => {
    loadAllSettings()
  }, [])

  async function loadAllSettings() {
    setLoading(true)
    try {
      const [resWa, resGeneral] = await Promise.all([
        fetch('/api/admin/whatsapp/settings'),
        fetch('/api/admin/settings'),
      ])

      const jsonWa = await resWa.json()
      const jsonGen = await resGeneral.json()

      if (resWa.ok && jsonWa.setting) {
        setWaToken(jsonWa.setting.waToken || '')
        setWaPhoneNumberId(jsonWa.setting.waPhoneNumberId || '')
        setWaVerifyToken(jsonWa.setting.waVerifyToken || 'choutuppal_verify_token')
      }

      if (resGeneral.ok && jsonGen.settings) {
        const s = jsonGen.settings
        if (s.ai_provider) setAiProvider(s.ai_provider as any)
        if (s.ai_api_key) setAiApiKey(s.ai_api_key)
        if (s.whatsapp_display_name) setDisplayName(s.whatsapp_display_name)
        if (s.price_banner_ad) setPriceBannerAd(s.price_banner_ad)
        if (s.price_reels_promo) setPriceReelsPromo(s.price_reels_promo)
        if (s.price_bulk_msg) setPriceBulkMsg(s.price_bulk_msg)
        if (s.price_franchise) setPriceFranchise(s.price_franchise)
      }
    } catch {
      toast.error('Failed to load CRM settings')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveWhatsApp() {
    if (!waToken.trim() || !waPhoneNumberId.trim()) {
      toast.error('WhatsApp Token and Phone Number ID are required')
      return
    }

    setSavingWa(true)
    try {
      const res = await fetch('/api/admin/whatsapp/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          waToken: waToken.trim(),
          waPhoneNumberId: waPhoneNumberId.trim(),
          waVerifyToken: waVerifyToken.trim() || 'choutuppal_verify_token',
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to save WhatsApp settings')

      toast.success('WhatsApp Meta API credentials saved securely in database!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSavingWa(false)
    }
  }

  async function handleTestConnection() {
    if (!testPhone.trim()) {
      toast.error('Please enter a target phone number to receive test message')
      return
    }

    setTestingWa(true)
    try {
      const res = await fetch('/api/crm/test-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetPhone: testPhone.trim() }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Test connection failed')

      toast.success(json.message || `Test message sent to ${testPhone}! Check your WhatsApp.`)
      setTestModalOpen(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Test WhatsApp failed')
    } finally {
      setTestingWa(false)
    }
  }

  async function handleSaveAI() {
    setSavingAi(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            ai_provider: aiProvider,
            ai_api_key: aiApiKey.trim(),
          },
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to save AI config')

      toast.success('AI Integration settings updated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save error')
    } finally {
      setSavingAi(false)
    }
  }

  async function handleSavePricing() {
    setSavingPricing(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: {
            whatsapp_display_name: displayName.trim(),
            price_banner_ad: priceBannerAd.trim(),
            price_reels_promo: priceReelsPromo.trim(),
            price_bulk_msg: priceBulkMsg.trim(),
            price_franchise: priceFranchise.trim(),
          },
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to save pricing config')

      toast.success('Dynamic Pricing & Profile updated live across website!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Pricing save failed')
    } finally {
      setSavingPricing(false)
    }
  }

  return (
    <div className="flex h-full w-full flex-col bg-gray-50 p-4 md:p-6 space-y-5 overflow-y-auto fancy-scroll font-sans text-gray-900">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4 bg-white p-4 rounded-2xl border shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
            <SettingsIcon className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              CRM System Settings & Dynamic Pricing Config
            </h2>
            <p className="text-xs text-gray-500">
              Manage WhatsApp API credentials, AI Providers, and Dynamic Monetization Pricing menu.
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={loadAllSettings}
          disabled={loading}
          className="gap-1.5 border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 h-8"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Settings
        </Button>
      </div>

      {/* SECTION 1: Meta WhatsApp API Configuration */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-extrabold text-xs text-gray-900 flex items-center gap-2 uppercase tracking-wider">
            <Smartphone className="h-4 w-4 text-emerald-600" /> 1. Meta WhatsApp Cloud API Configuration
          </h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-extrabold text-emerald-800 border border-emerald-200">
            <ShieldCheck className="h-3 w-3" /> Secure Storage
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Permanent System User Access Token (`WHATSAPP_TOKEN`) *
            </label>
            <Input
              type="password"
              value={waToken}
              onChange={(e) => setWaToken(e.target.value)}
              placeholder="EAAG..."
              className="h-9 text-xs border-gray-200 bg-gray-50/50 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              WhatsApp Phone Number ID (`WHATSAPP_PHONE_NUMBER_ID`) *
            </label>
            <Input
              value={waPhoneNumberId}
              onChange={(e) => setWaPhoneNumberId(e.target.value)}
              placeholder="109283746501928"
              className="h-9 text-xs border-gray-200 bg-gray-50/50 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Webhook Verify Token (`WHATSAPP_WEBHOOK_VERIFY_TOKEN`)
            </label>
            <Input
              value={waVerifyToken}
              onChange={(e) => setWaVerifyToken(e.target.value)}
              placeholder="choutuppal_verify_token"
              className="h-9 text-xs border-gray-200 bg-gray-50/50 font-mono"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Button
            variant="outline"
            onClick={() => setTestModalOpen(true)}
            className="gap-1.5 border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs h-9"
          >
            <Send className="h-3.5 w-3.5 text-emerald-600" /> Test Connection
          </Button>

          <Button
            onClick={handleSaveWhatsApp}
            disabled={savingWa}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white shadow-xs h-9"
          >
            {savingWa ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save WhatsApp Credentials
          </Button>
        </div>
      </div>

      {/* SECTION 2: AI Integration Settings */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-extrabold text-xs text-gray-900 flex items-center gap-2 uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-purple-600" /> 2. AI Integration & Engine Provider Settings
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">AI Provider Engine</label>
            <Select value={aiProvider} onValueChange={(val) => setAiProvider(val as any)}>
              <SelectTrigger className="h-9 border-gray-200 bg-gray-50/50 text-xs text-gray-900 rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200 text-xs">
                <SelectItem value="Gemini">Google Gemini 1.5 Flash (Recommended)</SelectItem>
                <SelectItem value="OpenAI">OpenAI GPT-4o Mini</SelectItem>
                <SelectItem value="Claude">Anthropic Claude 3.5 Sonnet</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              AI API Key (`GEMINI_API_KEY` / `OPENAI_API_KEY`)
            </label>
            <Input
              type="password"
              value={aiApiKey}
              onChange={(e) => setAiApiKey(e.target.value)}
              placeholder="AIzaSy... or sk-..."
              className="h-9 text-xs border-gray-200 bg-gray-50/50 font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button
            onClick={handleSaveAI}
            disabled={savingAi}
            className="gap-2 bg-purple-600 hover:bg-purple-700 font-bold text-xs text-white shadow-xs h-9"
          >
            {savingAi ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save AI Provider Config
          </Button>
        </div>
      </div>

      {/* SECTION 3: Business Profile & Dynamic Pricing Configuration */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h3 className="font-extrabold text-xs text-gray-900 flex items-center gap-2 uppercase tracking-wider">
            <DollarSign className="h-4 w-4 text-amber-500" /> 3. Business Profile & Dynamic Revenue Pricing Config
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp Business Display Name</label>
            <Input
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Choutuppal App"
              className="h-9 text-xs border-gray-200 bg-gray-50/50"
            />
          </div>

          {/* Dynamic Pricing Inputs */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Story / Top Banner Ad Price (₹/day)
            </label>
            <Input
              type="number"
              value={priceBannerAd}
              onChange={(e) => setPriceBannerAd(e.target.value)}
              placeholder="99"
              className="h-9 text-xs border-gray-200 bg-gray-50/50 font-bold text-emerald-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Reels Promo Price (₹/3 days)
            </label>
            <Input
              type="number"
              value={priceReelsPromo}
              onChange={(e) => setPriceReelsPromo(e.target.value)}
              placeholder="299"
              className="h-9 text-xs border-gray-200 bg-gray-50/50 font-bold text-pink-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Bulk Broadcast Message Price (₹)
            </label>
            <Input
              type="number"
              value={priceBulkMsg}
              onChange={(e) => setPriceBulkMsg(e.target.value)}
              placeholder="499"
              className="h-9 text-xs border-gray-200 bg-gray-50/50 font-bold text-purple-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Town Franchise White-Label App Price (₹/setup)
            </label>
            <Input
              type="number"
              value={priceFranchise}
              onChange={(e) => setPriceFranchise(e.target.value)}
              placeholder="10000"
              className="h-9 text-xs border-gray-200 bg-gray-50/50 font-bold text-slate-900"
            />
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <Button
            onClick={handleSavePricing}
            disabled={savingPricing}
            className="gap-2 bg-amber-600 hover:bg-amber-700 font-bold text-xs text-white shadow-xs h-9"
          >
            {savingPricing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
            Save Dynamic Pricing & Profile
          </Button>
        </div>
      </div>

      {/* Test WhatsApp Connection Modal */}
      <Dialog open={testModalOpen} onOpenChange={setTestModalOpen}>
        <DialogContent className="max-w-md bg-white border-gray-200 text-gray-900 font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Send className="h-5 w-5 text-emerald-600" /> Test WhatsApp API Connection
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Enter admin WhatsApp phone number to send a live test message via Meta Cloud API.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Recipient Phone Number *</label>
              <Input
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="e.g. +919876543210"
                className="h-9 text-xs border-gray-200 bg-white"
              />
            </div>

            <Button
              onClick={handleTestConnection}
              disabled={testingWa || !testPhone.trim()}
              className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white"
            >
              {testingWa ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send Test WhatsApp Message
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
