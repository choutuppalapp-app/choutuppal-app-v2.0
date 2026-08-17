'use client'

import { useState } from 'react'
import { Search, RefreshCw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export interface ChatItem {
  id: string
  phone: string
  name: string
  userType: string
  tag: string
  dateOfBirth?: string | null
  lastMessage: string
  lastMessageAt: string
  lastDirection: 'inbound' | 'outbound'
  chatState: string
}

interface InboxListProps {
  chats: ChatItem[]
  selectedPhone: string | null
  onSelectChat: (phone: string) => void
  onRefresh: () => void
  loading?: boolean
}

export function InboxList({
  chats,
  selectedPhone,
  onSelectChat,
  onRefresh,
  loading,
}: InboxListProps) {
  const [search, setSearch] = useState('')

  const filtered = chats.filter((c) => {
    const q = search.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.tag.toLowerCase().includes(q) ||
      c.lastMessage.toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex h-full flex-col border-r border-gray-200 bg-white">
      {/* Search Header */}
      <div className="p-3 border-b border-gray-200 space-y-2 bg-gray-50/50">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
            Conversations ({filtered.length})
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            className="h-7 w-7 text-gray-500 hover:text-gray-900"
            title="Refresh chats"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, or tags..."
            className="h-8 border-gray-200 bg-white pl-8 text-xs text-gray-900 placeholder:text-gray-400 focus:border-blue-500 rounded-lg"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 fancy-scroll">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500">
            {loading ? 'Loading chats...' : 'No conversations found'}
          </div>
        ) : (
          filtered.map((chat) => {
            const isSelected = chat.phone === selectedPhone
            const timeStr = new Date(chat.lastMessageAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <button
                key={chat.phone}
                onClick={() => onSelectChat(chat.phone)}
                className={`flex w-full text-left p-3 gap-3 transition-colors ${
                  isSelected
                    ? 'bg-blue-50 border-l-4 border-blue-600 text-blue-900 font-medium'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gray-100 text-gray-700 font-bold text-xs border border-gray-200">
                  {chat.name.slice(0, 2).toUpperCase()}
                  {chat.userType === 'business_owner' ? (
                    <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-amber-500 text-[9px] text-white font-extrabold shadow-xs">
                      ★
                    </span>
                  ) : null}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="truncate font-semibold text-xs text-gray-900">
                      {chat.name}
                    </span>
                    <span className="text-[10px] text-gray-400 shrink-0">{timeStr}</span>
                  </div>

                  <p className="truncate text-[11px] text-gray-500 mt-0.5">
                    {chat.lastDirection === 'outbound' ? 'You: ' : ''}
                    {chat.lastMessage}
                  </p>

                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] font-medium text-gray-600 border border-gray-200">
                      {chat.phone}
                    </span>
                    <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-semibold text-blue-600 border border-blue-100">
                      {chat.tag}
                    </span>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
