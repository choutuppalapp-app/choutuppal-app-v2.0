'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface Notification {
  id: string
  type: string
  title: string
  message: string
  link: string | null
  isRead: boolean
  createdAt: string
}

export function MyNotifications() {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/notifications?limit=100')
      .then((r) => r.json())
      .then((j) => { if (active) setItems(Array.isArray(j?.notifications) ? j.notifications : []) })
      .catch(() => { if (active) setItems([]) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  async function markAllRead() {
    try {
      await fetch('/api/notifications', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: '{}' })
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
      toast.success('All marked as read')
    } catch {
      toast.error('Failed')
    }
  }

  if (loading) {
    return <div className="grid place-items-center py-20"><Loader2 className="h-6 w-6 animate-spin text-blue-500" /></div>
  }

  const unreadCount = items.filter((n) => !n.isRead).length

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
          <p className="text-sm text-slate-500">{unreadCount} unread · {items.length} total</p>
        </div>
        {unreadCount > 0 ? (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1.5">
            <Check className="h-3.5 w-3.5" /> Mark all read
          </Button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="rounded-3xl glass p-10 text-center">
          <Bell className="mx-auto h-10 w-10 text-slate-300" />
          <p className="mt-2 text-sm text-slate-500">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <div
              key={n.id}
              className={cn(
                'flex items-start gap-3 rounded-2xl glass p-4',
                !n.isRead && 'ring-1 ring-blue-200',
              )}
            >
              <span className={cn('mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full', n.isRead ? 'bg-slate-300' : 'bg-blue-500')} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-slate-900">{n.title}</p>
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500">{n.type.replace('_', ' ')}</span>
                  {!n.isRead ? <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-600">NEW</span> : null}
                </div>
                <p className="mt-0.5 text-sm text-slate-600">{n.message}</p>
                <div className="mt-1 flex items-center gap-3">
                  <span className="text-[11px] text-slate-400">{timeAgo(n.createdAt)}</span>
                  {n.link ? <a href={n.link} className="text-[11px] font-semibold text-blue-600 hover:underline">View →</a> : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
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
