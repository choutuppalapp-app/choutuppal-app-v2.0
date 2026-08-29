'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, Brain, RefreshCw, FlaskConical, Loader2, Send, Download, Menu, X } from 'lucide-react'
import { CrmSidebar, CrmView } from '@/components/crm/sidebar'
import { DashboardView } from '@/components/crm/dashboard-view'
import { ConversationsView } from '@/components/crm/conversations-view'
import { ContactsView } from '@/components/crm/contacts-view'
import { TemplatesView } from '@/components/crm/templates-view'
import { CampaignsView } from '@/components/crm/campaigns-view'
import { AiTrainingPanel } from '@/components/crm/ai-training-panel'
import { SettingsView } from '@/components/crm/settings-view'
import { ChatItem } from '@/components/crm/inbox-list'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function CrmPage() {
  const [currentView, setCurrentView] = useState<CrmView>('dashboard')
  const [chats, setChats] = useState<ChatItem[]>([])
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  // Bulk Sender State
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [audience, setAudience] = useState<'all' | 'business_owner' | 'customer'>('all')
  const [sendingBulk, setSendingBulk] = useState(false)

  const fetchChats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/whatsapp/inbox')
      const json = await res.json()
      const list = json.chats || json.conversations || []
      if (res.ok && Array.isArray(list)) {
        setChats(list)
        if (list.length > 0 && !selectedPhone) {
          setSelectedPhone(list[0].phone)
        }
      }
    } catch (e) {
      console.warn('Failed to fetch chats:', e)
    } finally {
      setLoading(false)
    }
  }, [selectedPhone])

  useEffect(() => {
    fetchChats()
  }, [fetchChats])

  async function handleSeedTest() {
    setSeeding(true)
    try {
      const res = await fetch('/api/whatsapp/seed-test', { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to seed test conversation')
      toast.success('Test conversations seeded successfully!')
      await fetchChats()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Seeding failed')
    } finally {
      setSeeding(false)
    }
  }

  async function handleSendBulk() {
    if (!bulkText.trim()) {
      toast.error('Please enter broadcast message text')
      return
    }
    setSendingBulk(true)
    try {
      const res = await fetch('/api/crm/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateText: bulkText, audience }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to send bulk broadcast')
      toast.success(json.message || 'Bulk promotion sent!')
      setBulkOpen(false)
      setBulkText('')
      await fetchChats()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Bulk send failed')
    } finally {
      setSendingBulk(false)
    }
  }

  return (
    <div className="flex h-full w-full bg-gray-50 text-gray-900 overflow-hidden font-sans relative">
      {/* Slide-in Navigation Drawer for Mobile (< md) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative z-50 w-64 h-full bg-white shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
              <span className="font-extrabold text-xs text-gray-900">WACRM Menu</span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-lg text-gray-500 hover:bg-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CrmSidebar
                currentView={currentView}
                onSelectView={(view) => {
                  setCurrentView(view)
                  setMobileDrawerOpen(false)
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Permanent Left Sidebar (Width 250px) for Desktop */}
      <div className="hidden md:block h-full shrink-0">
        <CrmSidebar currentView={currentView} onSelectView={setCurrentView} />
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden h-full w-full">
        {/* Top Control Bar */}
        <div className="flex h-11 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-3 sm:px-4">
          <div className="flex items-center gap-2">
            {/* Hamburger Button on Mobile */}
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="grid h-8 w-8 place-items-center rounded-lg border border-gray-200 bg-white text-gray-700 md:hidden hover:bg-gray-100 shadow-2xs"
              title="Open Navigation Menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Mobile view switcher pills */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 max-w-[220px] sm:max-w-none fancy-scroll">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`rounded-lg px-2 py-1 text-[10px] font-bold shrink-0 ${
                  currentView === 'dashboard' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => setCurrentView('conversations')}
                className={`rounded-lg px-2 py-1 text-[10px] font-bold shrink-0 ${
                  currentView === 'conversations' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Chats
              </button>
              <button
                onClick={() => setCurrentView('contacts')}
                className={`rounded-lg px-2 py-1 text-[10px] font-bold shrink-0 ${
                  currentView === 'contacts' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Contacts
              </button>
              <button
                onClick={() => setCurrentView('templates')}
                className={`rounded-lg px-2 py-1 text-[10px] font-bold shrink-0 ${
                  currentView === 'templates' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Templates
              </button>
              <button
                onClick={() => setCurrentView('campaigns')}
                className={`rounded-lg px-2 py-1 text-[10px] font-bold shrink-0 ${
                  currentView === 'campaigns' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Campaigns
              </button>
              <button
                onClick={() => setCurrentView('ai_brain')}
                className={`rounded-lg px-2 py-1 text-[10px] font-bold shrink-0 ${
                  currentView === 'ai_brain' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                AI Brain
              </button>
              <button
                onClick={() => setCurrentView('settings')}
                className={`rounded-lg px-2 py-1 text-[10px] font-bold shrink-0 ${
                  currentView === 'settings' ? 'bg-emerald-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Settings
              </button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
              Console View: <span className="text-gray-900">{currentView.toUpperCase()}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Download Meta Custom Audience CSV */}
            <a
              href="/api/crm/contacts/export"
              download="Choutuppal_CRM_Contacts.csv"
            >
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 gap-1 font-bold"
                title="Download CSV for Meta Ads"
              >
                <Download className="h-3 w-3 text-blue-600" /> Export CSV
              </Button>
            </a>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkOpen(true)}
              className="h-7 text-[11px] border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 gap-1 font-bold"
            >
              <Send className="h-3 w-3 text-emerald-600" /> Quick Broadcast
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedTest}
              disabled={seeding}
              className="h-7 text-[11px] border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 gap-1 font-bold"
            >
              {seeding ? <Loader2 className="h-3 w-3 animate-spin" /> : <FlaskConical className="h-3 w-3 text-amber-600" />}
              Seed Test Data
            </Button>
          </div>
        </div>

        {/* Dynamic View Content */}
        <div className="flex-1 overflow-hidden">
          {currentView === 'dashboard' && <DashboardView />}

          {currentView === 'conversations' && (
            <ConversationsView
              chats={chats}
              selectedPhone={selectedPhone}
              onSelectChat={setSelectedPhone}
              onRefresh={fetchChats}
              loading={loading}
              onSeedTest={handleSeedTest}
            />
          )}

          {currentView === 'contacts' && <ContactsView />}

          {currentView === 'templates' && <TemplatesView />}

          {currentView === 'campaigns' && <CampaignsView />}

          {currentView === 'ai_brain' && <AiTrainingPanel />}

          {currentView === 'settings' && <SettingsView />}
        </div>
      </div>

      {/* Quick Broadcast Modal */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-lg bg-white border-gray-200 text-gray-900 font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Send className="h-5 w-5 text-emerald-600" /> Quick Broadcast Sender
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Send promotional offers, festival greetings, or ad broadcasts to stored WhatsApp contacts.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Target Audience</label>
              <Select value={audience} onValueChange={(val) => setAudience(val as any)}>
                <SelectTrigger className="border-gray-200 bg-white text-xs text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-xs">
                  <SelectItem value="all">All Saved Contacts</SelectItem>
                  <SelectItem value="business_owner">Business Owners Only</SelectItem>
                  <SelectItem value="customer">Customers Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Broadcast Message Text</label>
              <Textarea
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="🎉 నమస్కారం [Name] గారు! చౌటుప్పల్ యాప్ ఉగాది ప్రత్యేక డిస్కౌంట్ ఆఫర్..."
                rows={5}
                className="border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400 font-sans"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Tip: Use [Name] to auto-personalize recipient name.</span>
            </div>

            <Button
              onClick={handleSendBulk}
              disabled={sendingBulk || !bulkText.trim()}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 mt-2"
            >
              {sendingBulk ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Start Sequential Bulk Broadcast (2s Delay)
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
