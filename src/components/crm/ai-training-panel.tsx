'use client'

import { useState, useEffect } from 'react'
import { Brain, Save, Sparkles, RefreshCw, Loader2, Info } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export function AiTrainingPanel() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  useEffect(() => {
    fetchBrainPrompt()
  }, [])

  async function fetchBrainPrompt() {
    setLoading(true)
    try {
      const res = await fetch('/api/crm/ai-brain')
      const json = await res.json()
      if (res.ok) {
        setContent(json.content || '')
        setUpdatedAt(json.updatedAt)
      }
    } catch {
      toast.error('Failed to load AI Brain instructions')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/crm/ai-brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to save')
      toast.success('AI Brain rules updated live! The WhatsApp bot will now follow these instructions immediately.')
      setUpdatedAt(new Date().toISOString())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save error')
    } finally {
      setSaving(false)
    }
  }

  const sampleRules = [
    'If user asks for plumbers in Choutuppal, recommend "Ravi Plumbing Services (9848022338)".',
    'If user inquires about real estate near NH-65, highlight plots in "Sri City Layout" starting ₹15,000/sq yd.',
    'Always maintain a warm, welcoming Telugu tone and sign off as "చౌటుప్పల్ యాప్ టీమ్".',
  ]

  function appendSample(rule: string) {
    setContent((prev) => (prev ? `${prev.trim()}\n- ${rule}` : `- ${rule}`))
  }

  return (
    <div className="flex h-full w-full flex-col bg-slate-950 p-4 md:p-6 space-y-4 overflow-y-auto fancy-scroll">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">AI Brain — Dynamic System Prompt & Rules</h2>
            <p className="text-xs text-slate-400">
              Train the Gemini AI bot in real-time. Any rules added here take effect instantly on incoming WhatsApp chats.
            </p>
          </div>
        </div>

        <Button
          onClick={handleSave}
          disabled={saving || loading}
          className="gap-2 bg-gradient-to-r from-purple-600 to-blue-600 font-bold text-xs text-white shadow-lg shadow-purple-500/20"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save Rules
        </Button>
      </div>

      {/* Info Callout */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 flex items-start gap-2.5 text-xs text-blue-300">
        <Info className="h-4 w-4 shrink-0 text-blue-400 mt-0.5" />
        <div>
          <span className="font-bold">Zero Code Deployment:</span> You can update business recommendations, emergency contacts, local offers, and response guidelines dynamically below.
          {updatedAt ? (
            <span className="ml-2 text-[10px] text-slate-400">
              Last saved: {new Date(updatedAt).toLocaleString()}
            </span>
          ) : null}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="flex-1 space-y-2">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter custom instructions, business recommendations, contact details, or specific rules for the bot..."
          rows={12}
          className="w-full border-slate-800 bg-slate-900/90 font-mono text-xs leading-relaxed text-slate-100 placeholder:text-slate-600 focus:border-purple-500 p-4 rounded-xl shadow-inner min-h-[250px]"
        />
      </div>

      {/* Sample Rules Chips */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" /> Click to add sample rules:
        </span>
        <div className="flex flex-wrap gap-2">
          {sampleRules.map((r, idx) => (
            <button
              key={idx}
              onClick={() => appendSample(r)}
              className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-[11px] text-slate-300 hover:border-purple-500/50 hover:bg-slate-800 transition text-left"
            >
              + {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
