'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, Brain, Sparkles, RefreshCw } from 'lucide-react'
import { InboxList, ChatItem } from '@/components/crm/inbox-list'
import { ChatWindow } from '@/components/crm/chat-window'
import { ContactPanel } from '@/components/crm/contact-panel'
import { AiTrainingPanel } from '@/components/crm/ai-training-panel'
import { Button } from '@/components/ui/button'

export default function CrmPage() {
  const [activeTab, setActiveTab] = useState<'chats' | 'ai_brain'>('chats')
  const [chats, setChats] = useState<ChatItem[]>([])
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Mobile Single-Column state
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')

  const fetchChats = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/crm/chats')
      const json = await res.json()
      if (res.ok && Array.isArray(json.chats)) {
        setChats(json.chats)
        if (json.chats.length > 0 && !selectedPhone) {
          setSelectedPhone(json.chats[0].phone)
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

  const selectedContact = chats.find((c) => c.phone === selectedPhone) || null

  return (
    <div className="flex h-full w-full flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* Secondary Navigation Bar */}
      <div className="flex h-11 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/40 px-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('chats')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition ${
              activeTab === 'chats'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" /> Inbox & Chats
          </button>

          <button
            onClick={() => setActiveTab('ai_brain')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition ${
              activeTab === 'ai_brain'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Brain className="h-3.5 w-3.5" /> AI Brain (Training)
          </button>
        </div>

        {activeTab === 'chats' ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchChats}
            disabled={loading}
            className="h-7 text-xs text-slate-400 hover:text-white gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        ) : null}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'ai_brain' ? (
          <AiTrainingPanel />
        ) : (
          /* Chats Layout */
          <div className="flex h-full w-full overflow-hidden">
            {/* Mobile View Switching */}
            <div
              className={`flex-1 md:grid md:grid-cols-[320px_1fr_300px] lg:grid-cols-[360px_1fr_320px] h-full overflow-hidden`}
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
    </div>
  )
}
