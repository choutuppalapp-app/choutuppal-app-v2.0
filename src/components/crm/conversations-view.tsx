'use client'

import { useState } from 'react'
import { InboxList, ChatItem } from './inbox-list'
import { ChatWindow } from './chat-window'
import { ContactPanel } from './contact-panel'

interface ConversationsViewProps {
  chats: ChatItem[]
  selectedPhone: string | null
  onSelectChat: (phone: string) => void
  onRefresh: () => void
  loading?: boolean
  onSeedTest?: () => void
}

export function ConversationsView({
  chats,
  selectedPhone,
  onSelectChat,
  onRefresh,
  loading,
  onSeedTest,
}: ConversationsViewProps) {
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')
  const selectedContact = chats.find((c) => c.phone === selectedPhone) || null

  return (
    <div className="flex h-full w-full overflow-hidden">
      <div className="flex-1 md:grid md:grid-cols-[320px_1fr_300px] lg:grid-cols-[340px_1fr_320px] h-full overflow-hidden">
        {/* Left Column (Inbox) */}
        <div className={`${mobileView === 'list' ? 'block' : 'hidden'} md:block h-full overflow-hidden`}>
          <InboxList
            chats={chats}
            selectedPhone={selectedPhone}
            onSelectChat={(phone) => {
              onSelectChat(phone)
              setMobileView('chat')
            }}
            onRefresh={onRefresh}
            loading={loading}
            onSeedTest={onSeedTest}
          />
        </div>

        {/* Middle Column (Chat Window) */}
        <div className={`${mobileView === 'chat' ? 'block' : 'hidden'} md:block h-full overflow-hidden`}>
          <ChatWindow
            phone={selectedPhone}
            onBackMobile={() => setMobileView('list')}
            onContactUpdated={onRefresh}
          />
        </div>

        {/* Right Column (Contact Panel with Info, Notes, Media tabs) */}
        <div className="hidden lg:block h-full overflow-hidden">
          <ContactPanel
            contact={selectedContact}
            onContactUpdated={onRefresh}
          />
        </div>
      </div>
    </div>
  )
}
