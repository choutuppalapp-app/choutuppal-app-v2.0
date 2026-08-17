'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ArrowLeft,
  Send,
  Loader2,
  Sparkles,
  Brain,
  MessageSquare,
  Zap,
  CheckCheck,
  Plus,
  Store,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { AiCreatorAssistant } from './ai-creator-assistant'

interface LogMessage {
  id: string
  phone: string
  direction: 'inbound' | 'outbound'
  message: string
  status?: string | null
  createdAt: string
}

interface ChatWindowProps {
  phone: string | null
  onBackMobile?: () => void
  onContactUpdated?: () => void
}

export function ChatWindow({ phone, onBackMobile, onContactUpdated }: ChatWindowProps) {
  const [logs, setLogs] = useState<LogMessage[]>([])
  const [contact, setContact] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [inputMessage, setInputMessage] = useState('')
  const [sending, setSending] = useState(false)

  // AI Assistant Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false)

  // Category Listing Sender Modal
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCatId, setSelectedCatId] = useState('')
  const [sendingCat, setSendingCat] = useState(false)

  // Quick Replies / Templates State
  const [templates, setTemplates] = useState<any[]>([])

  // Self-Analysis State
  const [analyzing, setAnalyzing] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [addingToBrain, setAddingToBrain] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (phone) {
      fetchMessages(phone)
    } else {
      setLogs([])
      setContact(null)
    }
  }, [phone])

  useEffect(() => {
    fetchTemplates()
    fetchCategories()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  async function fetchMessages(targetPhone: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/crm/messages/${targetPhone}`)
      const json = await res.json()
      if (res.ok) {
        setLogs(json.logs || [])
        setContact(json.contact || null)
      }
    } catch {
      toast.error('Failed to fetch chat history')
    } finally {
      setLoading(false)
    }
  }

  async function fetchTemplates() {
    try {
      const res = await fetch('/api/crm/templates')
      const json = await res.json()
      if (res.ok) setTemplates(json.templates || [])
    } catch (e) {
      console.warn('Could not fetch templates:', e)
    }
  }

  async function fetchCategories() {
    try {
      const res = await fetch('/api/categories')
      const json = await res.json()
      const list = json.categories || json.data || (Array.isArray(json) ? json : [])
      if (Array.isArray(list)) setCategories(list)
    } catch (e) {
      console.warn('Could not fetch categories:', e)
    }
  }

  async function handleSendMessage(customOptions?: any) {
    if (!phone || (!inputMessage.trim() && !customOptions)) return
    const textToSend = inputMessage.trim()
    setSending(true)
    try {
      const res = await fetch(`/api/crm/messages/${phone}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          options: customOptions || { messageType: 'text' },
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to send')

      // Optimistically append outbound log
      setLogs((prev) => [
        ...prev,
        {
          id: String(Date.now()),
          phone,
          direction: 'outbound',
          message: textToSend || 'Sent Interactive Card',
          createdAt: new Date().toISOString(),
        },
      ])

      setInputMessage('')
      toast.success('Message sent!')
      if (onContactUpdated) onContactUpdated()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Send failed')
    } finally {
      setSending(false)
    }
  }

  async function handleSendCategoryListings() {
    if (!phone || !selectedCatId) {
      toast.error('Please select a category')
      return
    }
    setSendingCat(true)
    try {
      const res = await fetch('/api/crm/category-listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, categoryId: selectedCatId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to send category listings')

      toast.success('Category listings sent to contact!')
      setCatModalOpen(false)
      fetchMessages(phone)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Category send failed')
    } finally {
      setSendingCat(false)
    }
  }

  // Self-Analysis & Auto-Upgrade Logic
  async function handleAnalyzeConversation() {
    if (!logs.length) return
    setAnalyzing(true)
    setSuggestion(null)
    try {
      const res = await fetch('/api/crm/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, messages: logs }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to analyze')
      setSuggestion(json.suggestion || 'No specific improvement suggested.')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setAnalyzing(false)
    }
  }

  async function handleAddToBrain() {
    if (!suggestion) return
    setAddingToBrain(true)
    try {
      const getRes = await fetch('/api/crm/ai-brain')
      const getJson = await getRes.json()
      const currentContent = getJson.content || ''
      const updatedContent = currentContent ? `${currentContent.trim()}\n- ${suggestion}` : `- ${suggestion}`

      const postRes = await fetch('/api/crm/ai-brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: updatedContent }),
      })
      if (!postRes.ok) throw new Error('Failed to update AI Brain')
      toast.success('Added to AI Brain! Bot will now use this rule live.')
      setSuggestion(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error adding to AI Brain')
    } finally {
      setAddingToBrain(false)
    }
  }

  if (!phone) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-gray-400 bg-[#efeae2]/40">
        <MessageSquare className="h-10 w-10 text-gray-300 mb-2" />
        <p className="text-xs">Select a conversation from the left to start chatting.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-[#efeae2]/50 font-sans">
      {/* Real WhatsApp Header Bar */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-xs">
        <div className="flex items-center gap-3">
          {onBackMobile ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackMobile}
              className="md:hidden h-8 w-8 text-gray-600"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : null}

          <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
            {(contact?.name || phone).slice(0, 2).toUpperCase()}
          </div>

          <div>
            <h3 className="font-bold text-xs text-gray-900">
              {contact?.name || 'WhatsApp Contact'}
            </h3>
            <p className="text-[10px] text-gray-500">{phone}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCatModalOpen(true)}
            className="gap-1 border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[11px] font-semibold h-7"
          >
            <Store className="h-3 w-3 text-emerald-600" /> Send Category
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleAnalyzeConversation}
            disabled={analyzing || logs.length === 0}
            className="gap-1.5 border-purple-200 bg-purple-50 text-[11px] font-semibold text-purple-700 hover:bg-purple-100 h-7"
          >
            {analyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3 text-purple-600" />}
            Analyze
          </Button>

          <Button
            size="sm"
            onClick={() => setAiModalOpen(true)}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-[11px] font-bold text-white h-7 shadow-xs"
          >
            <Sparkles className="h-3 w-3" /> AI Assistant
          </Button>
        </div>
      </div>

      {/* AI Suggestion Banner */}
      {suggestion ? (
        <div className="m-3 p-3 rounded-xl border border-purple-200 bg-purple-50 space-y-2 text-xs text-purple-900 shadow-xs">
          <div className="flex items-center justify-between font-bold text-purple-950">
            <span className="flex items-center gap-1.5">
              <Brain className="h-4 w-4 text-purple-600" /> AI Learning Suggestion:
            </span>
            <button onClick={() => setSuggestion(null)} className="text-gray-400 hover:text-gray-700 text-xs">
              ✕
            </button>
          </div>
          <p className="text-[11px] text-purple-900 italic bg-white p-2 rounded border border-purple-200">
            "{suggestion}"
          </p>
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleAddToBrain}
              disabled={addingToBrain}
              className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs h-7"
            >
              {addingToBrain ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Add to AI Brain Live
            </Button>
          </div>
        </div>
      ) : null}

      {/* WhatsApp Chat Bubbles */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 fancy-scroll">
        {loading ? (
          <div className="flex h-full items-center justify-center text-xs text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading chat messages...
          </div>
        ) : logs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-xs text-gray-500">
            No message history. Type a message below to start chatting via Meta WhatsApp.
          </div>
        ) : (
          logs.map((m) => {
            const isInbound = m.direction === 'inbound'
            const timeStr = new Date(m.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })

            return (
              <div
                key={m.id}
                className={`flex flex-col ${isInbound ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-2xs ${
                    isInbound
                      ? 'bg-white text-gray-900 rounded-tl-xs border border-gray-200'
                      : 'bg-[#d9fdd3] text-gray-900 rounded-tr-xs border border-[#c1e8b8]'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${
                      isInbound ? 'text-gray-400' : 'text-emerald-700 font-semibold'
                    }`}
                  >
                    <span>{timeStr}</span>
                    {!isInbound ? <CheckCheck className="h-3 w-3 text-emerald-600" /> : null}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom Bar */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white p-3 space-y-2">
        {/* Pre-built Templates & Revenue Pitches Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-500" /> Pre-built Pitches:
          </span>

          <button
            onClick={() =>
              setInputMessage(
                '📢 మీ షాప్ ని వేలాదిమందికి చూపించండి! ₹99/రోజుకే చౌటుప్పల్ యాప్ టాప్ బ్యానర్ ఆడ్. బుక్ చేయడానికి "AD" అని రిప్లై చేయండి. 🎁',
              )
            }
            className="shrink-0 rounded-full border border-purple-200 bg-purple-50 px-2.5 py-1 text-[10px] font-bold text-purple-700 hover:bg-purple-100 transition"
          >
            ₹99 Banner Ad Pitch
          </button>

          <button
            onClick={() =>
              setInputMessage(
                '🎬 మీ బిజినెస్ రీల్ ని చౌటుప్పల్ యాప్ లో ప్రమోట్ చేయండి (₹299/3 రోజులు). రీల్ లింక్ ఇక్కడ పంపండి!',
              )
            }
            className="shrink-0 rounded-full border border-pink-200 bg-pink-50 px-2.5 py-1 text-[10px] font-bold text-pink-700 hover:bg-pink-100 transition"
          >
            ₹299 Reels Promo Pitch
          </button>

          <button
            onClick={() =>
              setInputMessage(
                '🚀 చౌటుప్పల్ ప్రజలందరికీ మీ బిజినెస్ ఆఫర్ మెసేజ్ ఒకేసారి పంపండి (₹499). బుకింగ్ కోసం రిప్లై చేయండి.',
              )
            }
            className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 hover:bg-emerald-100 transition"
          >
            ₹499 Bulk Promo Pitch
          </button>

          <button
            onClick={() =>
              setInputMessage(
                '💼 మీ సొంత పట్టణానికి చౌటుప్పల్ టైప్ వైట్-లేబుల్ యాప్ ని ₹10,000 కే ప్రారంభించండి! సబ్‌స్క్రిప్షన్ ₹1,000/నెల.',
              )
            }
            className="shrink-0 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-800 hover:bg-slate-200 transition"
          >
            Franchise Pitch
          </button>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a response or click a pitch template..."
            className="border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 h-10 rounded-xl"
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />

          <Button
            onClick={() => handleSendMessage()}
            disabled={sending || !inputMessage.trim()}
            className="h-10 w-10 shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs grid place-items-center"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Send Category Listings Modal */}
      <Dialog open={catModalOpen} onOpenChange={setCatModalOpen}>
        <DialogContent className="max-w-md bg-white border-gray-200 text-gray-900 font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <Store className="h-5 w-5 text-emerald-600" /> Send Category Listings to Contact
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Select a category to fetch top listings from the database and send directly to this WhatsApp contact.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Select Category</label>
              <Select value={selectedCatId} onValueChange={setSelectedCatId}>
                <SelectTrigger className="border-gray-200 bg-white text-xs text-gray-900">
                  <SelectValue placeholder="Choose Category" />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-xs">
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSendCategoryListings}
              disabled={sendingCat || !selectedCatId}
              className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 mt-2"
            >
              {sendingCat ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send Listings Payload
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Assistant Generator Modal */}
      <AiCreatorAssistant
        open={aiModalOpen}
        onOpenChange={setAiModalOpen}
        onUsePayload={(text, options) => {
          setInputMessage(text)
          if (options?.messageType && options.messageType !== 'text') {
            handleSendMessage(options)
          }
        }}
      />
    </div>
  )
}
