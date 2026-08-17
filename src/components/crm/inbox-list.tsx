'use client'

import { useState } from 'react'
import { Search, UserCheck, Store, Clock, RefreshCw } from 'lucide-react'
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
    <div className="flex h-full flex-col border-r border-slate-800 bg-slate-900/50">
      {/* Search Header */}
      <div className="p-3 border-b border-slate-800 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Conversations ({filtered.length})</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRefresh}
            className="h-7 w-7 text-slate-400 hover:text-white"
            title="Refresh chats"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, or tags..."
            className="h-8 border-slate-800 bg-slate-950/80 pl-8 text-xs text-white placeholder:text-slate-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 fancy-scroll">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
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
                    ? 'bg-blue-600/20 border-l-4 border-blue-500 text-white'
                    : 'hover:bg-slate-800/50 text-slate-300'
                }`}
              >
                <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700">
                  {chat.name.slice(0, 2).toUpperCase()}
                  {chat.userType === 'business_owner' ? (
                    <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-amber-500 text-[9px] text-black font-extrabold shadow">
                      ★
                    </span>
                  ) : null}
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="truncate font-semibold text-xs text-slate-200">
                      {chat.name}
                    </span>
                    <span className="text-[10px] text-slate-500 shrink-0">{timeStr}</span>
                  </div>

                  <p className="truncate text-[11px] text-slate-400 mt-0.5">
                    {chat.lastDirection === 'outbound' ? 'You: ' : ''}
                    {chat.lastMessage}
                  </p>

                  <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[9px] font-medium text-slate-400 border border-slate-700">
                      {chat.phone}
                    </span>
                    <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[9px] font-medium text-blue-400 border border-blue-500/20">
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
