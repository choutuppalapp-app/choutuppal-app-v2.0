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
  ListFilter,
  CheckCheck,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
      // First fetch existing brain prompt
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
      <div className="flex h-full flex-col items-center justify-center p-6 text-center text-slate-500 bg-slate-950">
        <MessageSquare className="h-10 w-10 text-slate-800 mb-2" />
        <p className="text-xs">Select a conversation from the left to start chatting.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col bg-slate-950">
      {/* Chat Window Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-900/60 px-4">
        <div className="flex items-center gap-3">
          {onBackMobile ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackMobile}
              className="md:hidden h-8 w-8 text-slate-300"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          ) : null}

          <div>
            <h3 className="font-bold text-xs text-white">
              {contact?.name || 'WhatsApp Contact'}
            </h3>
            <p className="text-[10px] text-slate-400">{phone}</p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleAnalyzeConversation}
            disabled={analyzing || logs.length === 0}
            className="gap-1.5 border-purple-500/30 bg-purple-500/10 text-[11px] font-semibold text-purple-300 hover:bg-purple-500/20 h-7"
          >
            {analyzing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Brain className="h-3 w-3 text-purple-400" />}
            Analyze & Learn
          </Button>

          <Button
            size="sm"
            onClick={() => setAiModalOpen(true)}
            className="gap-1.5 gradient-brand text-[11px] font-bold text-white h-7"
          >
            <Sparkles className="h-3 w-3" /> AI Assistant
          </Button>
        </div>
      </div>

      {/* AI Self-Analysis Suggestion Banner */}
      {suggestion ? (
        <div className="m-3 p-3 rounded-xl border border-purple-500/40 bg-purple-950/60 space-y-2 text-xs text-purple-200">
          <div className="flex items-center justify-between font-bold text-purple-300">
            <span className="flex items-center gap-1.5">
              <Brain className="h-4 w-4 text-purple-400" /> AI Brain Learning Suggestion:
            </span>
            <button onClick={() => setSuggestion(null)} className="text-slate-400 hover:text-white text-xs">
              ✕
            </button>
          </div>
          <p className="text-[11px] text-slate-300 italic bg-slate-900/60 p-2 rounded border border-purple-500/20">
            "{suggestion}"
          </p>
          <div className="flex justify-end">
            <Button
              size="sm"
              onClick={handleAddToBrain}
              disabled={addingToBrain}
              className="gap-1.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs h-7"
            >
              {addingToBrain ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
              Add to AI Brain Live
            </Button>
          </div>
        </div>
      ) : null}

      {/* Message Bubbles Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 fancy-scroll">
        {loading ? (
          <div className="flex h-full items-center justify-center text-xs text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading chat messages...
          </div>
        ) : logs.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-xs text-slate-500">
            No message history recorded yet. Type a message below to send via Meta WhatsApp API.
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
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-xs ${
                    isInbound
                      ? 'bg-slate-800 text-slate-100 rounded-tl-xs border border-slate-700'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-xs shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                  <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[9px] ${
                      isInbound ? 'text-slate-400' : 'text-blue-200'
                    }`}
                  >
                    <span>{timeStr}</span>
                    {!isInbound ? <CheckCheck className="h-3 w-3" /> : null}
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Sticky Bottom Area: Quick Replies & Input */}
      <div className="sticky bottom-0 border-t border-slate-800 bg-slate-900/90 p-3 space-y-2 backdrop-blur">
        {/* Quick Replies Row */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Zap className="h-3 w-3 text-amber-400" /> Quick Replies:
          </span>
          <button
            onClick={() =>
              setInputMessage(
                'నమస్తే! చౌటుప్పల్ యాప్ ఉచిత లిస్టింగ్ కోసం: https://choutuppal.in/dashboard',
              )
            }
            className="shrink-0 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] text-slate-300 hover:border-blue-500 hover:text-white transition"
          >
            + Listing Link
          </button>

          <button
            onClick={() =>
              setInputMessage(
                '🚨 అత్యవసర నంబర్లు:\nపోలీస్: 100 | అంబులెన్స్: 108 | ఫైర్: 101 | హాస్పిటల్: 08694-273200',
              )
            }
            className="shrink-0 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] text-slate-300 hover:border-blue-500 hover:text-white transition"
          >
            + Emergency Numbers
          </button>

          {templates.map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => setInputMessage(tpl.name)}
              className="shrink-0 rounded-full border border-slate-700 bg-slate-800 px-2.5 py-1 text-[10px] text-slate-300 hover:border-blue-500 hover:text-white transition"
            >
              + {tpl.name}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a response or AI prompt..."
            className="border-slate-800 bg-slate-950 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 h-10 rounded-xl"
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />

          <Button
            onClick={() => handleSendMessage()}
            disabled={sending || !inputMessage.trim()}
            className="h-10 w-10 shrink-0 rounded-xl gradient-brand text-white shadow-md grid place-items-center"
          >
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>

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
