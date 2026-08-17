'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, Brain, RefreshCw, FlaskConical, Loader2, Send, Users } from 'lucide-react'
import { InboxList, ChatItem } from '@/components/crm/inbox-list'
import { ChatWindow } from '@/components/crm/chat-window'
import { ContactPanel } from '@/components/crm/contact-panel'
import { AiTrainingPanel } from '@/components/crm/ai-training-panel'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

export default function CrmPage() {
  const [activeTab, setActiveTab] = useState<'chats' | 'ai_brain'>('chats')
  const [chats, setChats] = useState<ChatItem[]>([])
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  // Bulk Sender State
  const [bulkOpen, setBulkOpen] = useState(false)
  const [bulkText, setBulkText] = useState('')
  const [audience, setAudience] = useState<'all' | 'business_owner' | 'customer'>('all')
  const [sendingBulk, setSendingBulk] = useState(false)

  // Mobile Single-Column state
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')

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

  const selectedContact = chats.find((c) => c.phone === selectedPhone) || null

  return (
    <div className="flex h-full w-full flex-col bg-gray-50 text-gray-900 overflow-hidden font-sans">
      {/* Secondary Navigation Bar (Interakt Light Style) */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'chats'
                ? 'bg-blue-50 text-blue-600 border border-blue-200 shadow-xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" /> Inbox & Chats
          </button>

          <button
            onClick={() => setActiveTab('ai_brain')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
              activeTab === 'ai_brain'
                ? 'bg-purple-50 text-purple-600 border border-purple-200 shadow-xs'
                : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            <Brain className="h-3.5 w-3.5" /> AI Brain (Training)
          </button>
        </div>

        {activeTab === 'chats' ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkOpen(true)}
              className="h-7 text-xs border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 gap-1.5 font-bold"
            >
              <Send className="h-3 w-3 text-emerald-600" /> Bulk Sender
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSeedTest}
              disabled={seeding}
              className="h-7 text-xs border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 gap-1.5 font-bold"
            >
              {seeding ? <Loader2 className="h-3 w-3 animate-spin" /> : <FlaskConical className="h-3 w-3 text-amber-600" />}
              Seed Test Data
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={fetchChats}
              disabled={loading}
              className="h-7 text-xs text-gray-600 hover:text-gray-900 gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </Button>
          </div>
        ) : null}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'ai_brain' ? (
          <AiTrainingPanel />
        ) : (
          /* Chats Layout */
          <div className="flex h-full w-full overflow-hidden">
            <div
              className={`flex-1 md:grid md:grid-cols-[320px_1fr_300px] lg:grid-cols-[340px_1fr_320px] h-full overflow-hidden`}
            >
              {/* Left Column (Inbox) */}
              <div
                className={`${
                  mobileView === 'list' ? 'block' : 'hidden'
                } md:block h-full overflow-hidden`}
              >
                <InboxList
                  chats={chats}
                  selectedPhone={selectedPhone}
                  onSelectChat={(phone) => {
                    setSelectedPhone(phone)
                    setMobileView('chat')
                  }}
                  onRefresh={fetchChats}
                  loading={loading}
                  onSeedTest={handleSeedTest}
                />
              </div>

              {/* Middle Column (Chat Window) */}
              <div
                className={`${
                  mobileView === 'chat' ? 'block' : 'hidden'
                } md:block h-full overflow-hidden`}
              >
                <ChatWindow
                  phone={selectedPhone}
                  onBackMobile={() => setMobileView('list')}
                  onContactUpdated={fetchChats}
                />
              </div>

              {/* Right Column (Contact Panel) */}
              <div className="hidden lg:block h-full overflow-hidden">
                <ContactPanel
                  contact={selectedContact}
                  onContactUpdated={fetchChats}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Greetings & Promotions Modal */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-lg bg-white border-gray-200 text-gray-900 font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Users className="h-5 w-5 text-emerald-600" /> Bulk Greetings & Broadcast Sender
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Send promotional offers, festival greetings, or ad broadcasts to all stored WhatsApp contacts in sequence.
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
                  <SelectItem value="customer">Customers / Service Seekers Only</SelectItem>
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
