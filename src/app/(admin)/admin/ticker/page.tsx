'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Megaphone,
  PlusCircle,
  AlertTriangle,
  CheckCircle,
  EyeOff,
  Trash2,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Clock,
  ArrowRight,
} from 'lucide-react'
import { AdminHeader } from '@/components/admin/admin-header'
import { toast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'

export default function AdminTickerPage() {
  const [tickers, setTickers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    text: '',
    link: '',
    isUrgent: false,
  })

  const fetchTickers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/ticker')
      const data = await res.json()
      if (data.ok) {
        setTickers(data.tickers || [])
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to fetch ticker items', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTickers()
  }, [])

  const handleToggleActive = async (id: string, currentVal: boolean) => {
    try {
      const res = await fetch('/api/admin/ticker', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !currentVal }),
      })
      const data = await res.json()
      if (data.ok) {
        setTickers(data.tickers)
        toast({
          title: !currentVal ? 'Ticker Enabled' : 'Ticker Disabled',
          description: !currentVal ? 'Item is now scrolling on live marquee' : 'Item removed from marquee',
        })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to update ticker', variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this ticker announcement?')) return
    try {
      const res = await fetch(`/api/admin/ticker?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.ok) {
        setTickers(data.tickers)
        toast({ title: 'Deleted', description: 'Ticker item deleted' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to delete ticker', variant: 'destructive' })
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/admin/ticker', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (data.ok) {
        setTickers(data.tickers)
        toast({ title: 'Success', description: 'New ticker announcement added to live marquee' })
        setModalOpen(false)
        setFormData({ text: '', link: '', isUrgent: false })
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' })
      }
    } catch {
      toast({ title: 'Error', description: 'Failed to add ticker', variant: 'destructive' })
    }
  }

  const activeMarqueeText = tickers
    .filter((t) => t.isActive)
    .map((t) => t.text)
    .join('  ✦  ')

  return (
    <div>
      <AdminHeader
        title="Live Ticker & Announcements"
        teluguTitle="లైవ్ టిక్కర్ & బ్రేకింగ్ అలర్ట్స్"
        description="Broadcast instant scrolling announcements, emergency alerts, or offers across the entire website."
        actionButton={{
          label: 'Add Ticker Alert',
          onClick: () => setModalOpen(true),
          icon: PlusCircle,
        }}
      />

      <div className="px-4 py-6 sm:px-6 lg:px-8 space-y-6 max-w-7xl mx-auto">
        {/* Live Marquee Preview Box */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 shadow-xs">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-900">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
            <span className="uppercase tracking-wider">Live Homepage Preview:</span>
          </div>
          <div className="rounded-lg bg-white border border-blue-200 px-4 py-2.5 overflow-hidden shadow-2xs">
            <div className="whitespace-nowrap overflow-hidden text-sm font-semibold text-slate-800 flex items-center gap-4">
              <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase shrink-0">
                Live Alert
              </span>
              <span className="truncate">{activeMarqueeText || 'No active ticker announcements.'}</span>
            </div>
          </div>
        </div>

        {/* Ticker Items List */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Announcements Queue</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Toggle, edit, and organize ticker items in priority order.
              </p>
            </div>
            <button
              onClick={fetchTickers}
              title="Refresh"
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="p-12 text-center text-slate-500 text-sm">Loading ticker items...</div>
            ) : tickers.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">
                No ticker items. Click "Add Ticker Alert" to create one.
              </div>
            ) : (
              tickers.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {item.isUrgent && (
                        <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-2 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-200">
                          <AlertTriangle className="h-3 w-3" /> URGENT
                        </span>
                      )}
                      <p className="font-semibold text-slate-900 text-sm">{item.text}</p>
                    </div>

                    {item.link && (
                      <p className="text-xs text-blue-700 flex items-center gap-1 font-medium">
                        <ExternalLink className="h-3 w-3" />
                        <span>Link: {item.link}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                    <button
                      onClick={() => handleToggleActive(item.id, Boolean(item.isActive))}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold border transition ${
                        item.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                      }`}
                    >
                      {item.isActive ? (
                        <>
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-600" /> Active (Live)
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-3.5 w-3.5 text-slate-400" /> Paused
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition"
                      title="Delete Ticker Item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Ticker Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md bg-white p-6 rounded-2xl border border-slate-200 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              Create Ticker Announcement
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              This message will immediately appear in the homepage scrolling marquee.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreate} className="space-y-4 pt-3">
            <div>
              <label className="text-xs font-bold text-slate-700">Announcement Text *</label>
              <textarea
                rows={3}
                required
                placeholder="e.g. 📢 చౌటుప్పల్ వ్యవసాయ మార్కెట్లో నేడు పత్తి క్వింటాల్ ధర ₹7,500..."
                value={formData.text}
                onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">Optional Action Link URL</label>
              <input
                type="text"
                placeholder="/news or /business/register"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isUrgent}
                  onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                  className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                />
                <span>Highlight as Urgent Alert (Red Badge)</span>
              </label>
            </div>

            <DialogFooter className="pt-4 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 shadow-xs"
              >
                Broadcast Alert
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
