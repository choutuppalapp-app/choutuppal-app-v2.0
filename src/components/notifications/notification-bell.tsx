'use client'

import { useState, useEffect, useRef } from 'react'
import { Bell, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NotificationItem {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [unread, setUnread] = useState(0)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch unread count on mount + when dropdown opens
  useEffect(() => {
    fetch('/api/notifications?limit=5')
      .then((r) => r.json())
      .then((j) => {
        if (j.ok) {
          setNotifications(j.notifications)
          setUnread(j.unreadCount)
        }
      })
      .catch(() => {})
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function toggleDropdown() {
    const newOpen = !open
    setOpen(newOpen)
    if (newOpen && unread > 0) {
      // Mark all as read when the dropdown opens
      setUnread(0)
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
      fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      }).catch(() => {})
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        aria-label="Notifications"
        className="relative grid h-9 w-9 place-items-center rounded-lg text-slate-600 transition hover:bg-slate-100 hover:text-blue-600"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
            <span className="text-sm font-bold text-slate-900">Notifications</span>
            {unread > 0 ? (
              <span className="text-[10px] font-semibold text-blue-600">{unread} unread</span>
            ) : null}
          </div>
          <div className="max-h-80 overflow-y-auto fancy-scroll">
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    'border-b border-slate-50 px-4 py-3 transition hover:bg-slate-50',
                    !n.isRead && 'bg-blue-50/40',
                  )}
                >
                  <div className="flex items-start gap-2">
                    {!n.isRead ? (
                      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                    ) : (
                      <Check className="mt-1 h-3 w-3 shrink-0 text-slate-300" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-slate-900">{n.title}</p>
                      <p className="text-xs text-slate-500">{n.message}</p>
                      <p className="mt-0.5 text-[10px] text-slate-400">{timeAgo(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}
