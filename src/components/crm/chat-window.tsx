import Image from 'next/image';
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
  Check,
  CheckCheck,
  Plus,
  Store,
  FileText,
  Paperclip,
  X,
  Image as ImageIcon,
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
  mediaUrl?: string | null
  imageUrl?: string | null
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

  // Media Attachment Upload State
  const [mediaUrl, setMediaUrl] = useState<string | null>(null)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // AI Assistant Modal State
  const [aiModalOpen, setAiModalOpen] = useState(false)

  // Category Listing Sender Modal
  const [catModalOpen, setCatModalOpen] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [selectedCatId, setSelectedCatId] = useState('')
  const [sendingCat, setSendingCat] = useState(false)

  // Quick Replies / Saved Templates Dropdown State
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('default')

  // Analyze & Learn Modal State
  const [analyzing, setAnalyzing] = useState(false)
  const [suggestion, setSuggestion] = useState<string | null>(null)
  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false)
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

  function handleSelectQuickReply(tplId: string) {
    setSelectedTemplateId(tplId)
    if (tplId === 'default') return

    const tpl = templates.find((t) => t.id === tplId)
    if (tpl) {
      const text = typeof tpl.payload === 'object' && tpl.payload?.text ? tpl.payload.text : String(tpl.payload)
      setInputMessage(text)
      toast.success(`Loaded template "${tpl.name}"`)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingMedia(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'crm-chat-media')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      const json = await res.json()
      if (!res.ok || !json.url) throw new Error(json.error || 'Failed to upload media file')

      setMediaUrl(json.url)
      toast.success('Media file attached successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Media upload failed')
    } finally {
      setUploadingMedia(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleSendMessage(customOptions?: any) {
    if (!phone || (!inputMessage.trim() && !mediaUrl && !customOptions)) return
    const textToSend = inputMessage.trim()
    const activeMedia = mediaUrl
    setSending(true)
    try {
      const payloadOptions = customOptions || (activeMedia ? { messageType: 'image', imageUrl: activeMedia } : { messageType: 'text' })

      const res = await fetch(`/api/crm/messages/${phone}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSend,
          options: payloadOptions,
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
          message: textToSend || (activeMedia ? '[Image Attachment]' : ''),
          imageUrl: activeMedia,
          mediaUrl: activeMedia,
          status: 'sent',
          createdAt: new Date().toISOString(),
        },
      ])

      setInputMessage('')
      setMediaUrl(null)
      setSelectedTemplateId('default')
      toast.success('Message sent via Meta WhatsApp!')
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
      
      const resultSuggestion = json.suggestion || 'No specific improvement suggested.'
      setSuggestion(resultSuggestion)
      setAnalyzeModalOpen(true)
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
      toast.success('Added to AI Brain Live! Bot will use this instruction immediately.')
      setAnalyzeModalOpen(false)
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

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setCatModalOpen(true)}
            className="gap-1 border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-[11px] font-bold h-7"
          >
            <Store className="h-3 w-3 text-emerald-600" /> Send Category
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleAnalyzeConversation}
            disabled={analyzing || logs.length === 0}
            className="gap-1 border-purple-200 bg-purple-50 text-[11px] font-semibold text-purple-700 hover:bg-purple-100 h-7"
          >
            {analyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3 text-purple-600" />}
            Analyze & Learn
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
                  {m.imageUrl || m.mediaUrl ? (
                    <div className="mb-2 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                      <Image width={800} height={800} loading="lazy" decoding="async"
                        src={m.imageUrl || m.mediaUrl || ''}
                        alt="Attachment preview"
                        className="max-h-48 w-full object-cover"
                      />
                    </div>
                  ) : null}
                  <p className="whitespace-pre-wrap leading-relaxed font-sans">{m.message}</p>
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${
                      isInbound ? 'text-gray-400' : 'text-emerald-700 font-bold'
                    }`}
                  >
                    <span>{timeStr}</span>
                    {!isInbound ? (
                      m.status === 'read' ? (
                        <span title="Read"><CheckCheck className="h-3 w-3 text-blue-600 font-black" /></span>
                      ) : m.status === 'delivered' ? (
                        <span title="Delivered"><CheckCheck className="h-3 w-3 text-emerald-600 font-bold" /></span>
                      ) : (
                        <span title="Sent"><Check className="h-3 w-3 text-emerald-600" /></span>
                      )
                    ) : null}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom Bar with Quick Replies & Media Attachment */}
      <div className="sticky bottom-0 border-t border-gray-200 bg-white p-3 space-y-2.5">
        {/* Thumbnail Preview Box when media is selected */}
        {mediaUrl ? (
          <div className="flex items-center gap-2 p-2 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="h-10 w-10 shrink-0 rounded-lg overflow-hidden border border-emerald-300 bg-white">
              <Image width={800} height={800} loading="lazy" decoding="async" src={mediaUrl} alt="Attached preview" className="h-full w-full object-cover" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs font-bold text-emerald-950 truncate">Image Attached</p>
              <p className="text-[10px] text-emerald-700 truncate">{mediaUrl}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMediaUrl(null)}
              className="h-6 w-6 text-red-500 hover:bg-red-50 rounded-full"
              title="Remove attachment"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : null}

        {/* Quick Replies / Saved Templates Row */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <FileText className="h-3 w-3 text-emerald-600" /> Quick Replies:
          </span>

          {/* Quick Replies Dropdown */}
          <Select value={selectedTemplateId} onValueChange={handleSelectQuickReply}>
            <SelectTrigger className="h-7 border-gray-200 bg-gray-50 text-[11px] text-gray-900 rounded-lg shrink-0 w-44">
              <SelectValue placeholder="Select Saved Template..." />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 text-xs">
              <SelectItem value="default">-- Select Template --</SelectItem>
              {templates.map((tpl) => (
                <SelectItem key={tpl.id} value={tpl.id}>
                  [{tpl.type}] {tpl.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Pre-built Pitch Chips */}
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
        </div>

        {/* Input Bar with Paperclip Button */}
        <div className="flex items-center gap-2">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*,application/pdf"
            className="hidden"
          />

          {/* Visible Paperclip Media Attachment Button */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingMedia}
            className="h-10 w-10 shrink-0 rounded-xl border-gray-200 bg-white hover:bg-emerald-50 text-gray-600 hover:border-emerald-300"
            title="Attach Image or Document"
          >
            {uploadingMedia ? (
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            ) : (
              <Paperclip className="h-4 w-4 text-emerald-600" />
            )}
          </Button>

          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a response or select a template..."
            className="border-gray-200 bg-white text-xs text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 h-10 rounded-xl"
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />

          <Button
            onClick={() => handleSendMessage()}
            disabled={sending || (!inputMessage.trim() && !mediaUrl)}
            className="h-10 w-10 shrink-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs grid place-items-center"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Analyze & Learn AI Brain Suggestion Modal */}
      <Dialog open={analyzeModalOpen} onOpenChange={setAnalyzeModalOpen}>
        <DialogContent className="max-w-md bg-white border-purple-200 text-gray-900 font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold text-purple-950">
              <Brain className="h-5 w-5 text-purple-600" /> Analyze & Learn — AI Brain Suggestion
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Gemini AI analyzed this conversation and generated an instruction to save directly to the AI Brain.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 font-sans leading-relaxed">
              "{suggestion}"
            </div>

            <Button
              onClick={handleAddToBrain}
              disabled={addingToBrain}
              className="w-full gap-2 bg-purple-600 hover:bg-purple-700 font-bold text-xs text-white h-9"
            >
              {addingToBrain ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Add to AI Brain Live
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
