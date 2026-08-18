'use client'

import { useState, useEffect } from 'react'
import {
  Brain,
  Save,
  Sparkles,
  Loader2,
  Info,
  Zap,
  Plus,
  Trash2,
  FileText,
  GitBranch,
  Check,
} from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'

const DEFAULT_SYSTEM_PROMPT =
  'You are the Choutuppal App AI Assistant. Help users find local businesses, real estate, and news in Choutuppal town. Be polite, realistic, and answer in Telugu or English based on the user\'s language. Do not sound like a robot.'

interface TriggerRuleItem {
  id: string
  keyword: string
  templateId?: string | null
  replyText?: string | null
  createdAt: string
}

interface TemplateOption {
  id: string
  name: string
  type: string
  payload: any
}

interface FlowStepItem {
  id: string
  delayMs: number
  message: string
}

export function AiTrainingPanel() {
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)

  // Trigger Rules State
  const [triggerRules, setTriggerRules] = useState<TriggerRuleItem[]>([])
  const [templates, setTemplates] = useState<TemplateOption[]>([])
  const [newKeyword, setNewKeyword] = useState('')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('custom')
  const [customReplyText, setCustomReplyText] = useState('')
  const [addingRule, setAddingRule] = useState(false)

  // Quick Template Creator Modal State
  const [tplModalOpen, setTplModalOpen] = useState(false)
  const [tplName, setTplName] = useState('')
  const [tplType, setTplType] = useState<'text' | 'button' | 'list'>('text')
  const [tplText, setTplText] = useState('')
  const [savingTpl, setSavingTpl] = useState(false)

  // Quick Flow Creator Modal State
  const [flowModalOpen, setFlowModalOpen] = useState(false)
  const [flowName, setFlowName] = useState('')
  const [flowSteps, setFlowSteps] = useState<FlowStepItem[]>([
    { id: '1', delayMs: 2000, message: 'నమస్కారం! చౌటుప్పల్ యాప్ కి స్వాగతం.' },
  ])
  const [savingFlow, setSavingFlow] = useState(false)

  useEffect(() => {
    loadBrainData()
  }, [])

  async function loadBrainData() {
    setLoading(true)
    try {
      const [resBrain, resTrig, resTpl] = await Promise.all([
        fetch('/api/crm/ai-brain'),
        fetch('/api/crm/triggers'),
        fetch('/api/crm/templates'),
      ])

      const jsonBrain = await resBrain.json()
      const jsonTrig = await resTrig.json()
      const jsonTpl = await resTpl.json()

      if (resBrain.ok) {
        setContent(jsonBrain.content || DEFAULT_SYSTEM_PROMPT)
        setUpdatedAt(jsonBrain.updatedAt)
      } else {
        setContent(DEFAULT_SYSTEM_PROMPT)
      }

      if (resTrig.ok) setTriggerRules(jsonTrig.rules || [])
      if (resTpl.ok) setTemplates(jsonTpl.templates || [])
    } catch {
      toast.error('Failed to load AI Brain data')
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveBrain() {
    setSaving(true)
    try {
      const res = await fetch('/api/crm/ai-brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim() || DEFAULT_SYSTEM_PROMPT }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to save')
      toast.success('AI Brain System Prompt updated live!')
      setUpdatedAt(new Date().toISOString())
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save error')
    } finally {
      setSaving(false)
    }
  }

  async function handleAddTriggerRule() {
    if (!newKeyword.trim()) {
      toast.error('Please enter exact message keyword to trigger rule')
      return
    }

    setAddingRule(true)
    try {
      const res = await fetch('/api/crm/triggers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: newKeyword.trim(),
          templateId: selectedTemplateId !== 'custom' ? selectedTemplateId : undefined,
          replyText: customReplyText.trim() || undefined,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to add trigger rule')

      toast.success(`Trigger rule added for "${newKeyword.trim()}"!`)
      setNewKeyword('')
      setCustomReplyText('')
      setSelectedTemplateId('custom')
      loadBrainData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Add rule error')
    } finally {
      setAddingRule(false)
    }
  }

  async function handleDeleteTriggerRule(id: string) {
    try {
      const res = await fetch(`/api/crm/triggers?id=${id}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to delete rule')

      toast.success('Trigger rule deleted!')
      setTriggerRules((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Delete error')
    }
  }

  async function handleCreateQuickTemplate() {
    if (!tplName.trim() || !tplText.trim()) {
      toast.error('Template Name and Text Content are required')
      return
    }

    setSavingTpl(true)
    try {
      const payload = {
        text: tplText.trim(),
        messageType: tplType,
      }

      const res = await fetch('/api/crm/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tplName.trim(),
          type: tplType,
          payload,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to save template')

      toast.success(`Template "${tplName}" created and added to Template Library!`)
      setTplModalOpen(false)
      setTplName('')
      setTplText('')
      loadBrainData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Template error')
    } finally {
      setSavingTpl(false)
    }
  }

  async function handleCreateQuickFlow() {
    if (!flowName.trim() || flowSteps.length === 0) {
      toast.error('Flow Name and at least 1 step are required')
      return
    }

    setSavingFlow(true)
    try {
      const payload = {
        text: flowSteps[0].message,
        sequence: flowSteps.map((s) => ({ delayMs: s.delayMs, message: s.message })),
      }

      const res = await fetch('/api/crm/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: flowName.trim(),
          type: 'flow',
          payload,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.ok) throw new Error(json.error || 'Failed to save flow')

      toast.success(`Flow Chat "${flowName}" created and added to Template Library!`)
      setFlowModalOpen(false)
      setFlowName('')
      setFlowSteps([{ id: '1', delayMs: 2000, message: 'నమస్కారం! చౌటుప్పల్ యాప్ కి స్వాగతం.' }])
      loadBrainData()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Flow creation error')
    } finally {
      setSavingFlow(false)
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
    <div className="flex h-full w-full flex-col bg-gray-50 p-4 md:p-6 space-y-5 overflow-y-auto fancy-scroll font-sans text-gray-900">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 bg-white p-4 rounded-2xl border shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-purple-100 text-purple-700 border border-purple-200">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900 tracking-tight">
              AI Brain — Dynamic System Prompt & Trigger Rules
            </h2>
            <p className="text-xs text-gray-500">
              Train Gemini AI live, configure exact-match keyword trigger rules, and quick-create templates or flows.
            </p>
          </div>
        </div>

        <Button
          onClick={handleSaveBrain}
          disabled={saving || loading}
          className="gap-2 bg-purple-600 hover:bg-purple-700 font-bold text-xs text-white shadow-xs h-9"
        >
          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          Save AI Brain Prompt
        </Button>
      </div>

      {/* SECTION 1: Dynamic System Prompt Editor */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="h-4 w-4 text-purple-600" /> 1. Dynamic AI System Prompt & Persona
          </h3>
          {updatedAt ? (
            <span className="text-[10px] text-gray-400">
              Last saved: {new Date(updatedAt).toLocaleString()}
            </span>
          ) : null}
        </div>

        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter AI Assistant persona, rules, and training instructions..."
          rows={6}
          className="w-full border-gray-200 bg-gray-50/50 font-mono text-xs leading-relaxed text-gray-900 placeholder:text-gray-400 focus:border-purple-500 p-3.5 rounded-xl shadow-2xs"
        />

        {/* Sample Rules Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-semibold text-gray-600 block">
            Click to append sample rules:
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleRules.map((r, idx) => (
              <button
                key={idx}
                onClick={() => appendSample(r)}
                className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-medium text-gray-700 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-900 transition text-left"
              >
                + {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 2: Trigger Rules Management */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <h3 className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Zap className="h-4 w-4 text-amber-500" /> 2. Keyword Trigger Rules (Instant Auto-Reply - No AI Cost)
          </h3>
          <span className="text-[11px] font-bold text-gray-500">
            {triggerRules.length} Active Rules
          </span>
        </div>

        {/* Add Trigger Rule Builder Box */}
        <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
          <span className="text-xs font-bold text-amber-950 block">Configure New Exact-Match Trigger Rule:</span>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-end">
            <div className="md:col-span-4">
              <label className="block text-[11px] font-bold text-gray-700 mb-1">If user sends exact message:</label>
              <Input
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                placeholder="e.g. ad, offers, emergency"
                className="h-8 text-xs bg-white border-amber-200"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-[11px] font-bold text-gray-700 mb-1">Then send Template:</label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger className="h-8 text-xs bg-white border-amber-200">
                  <SelectValue placeholder="Select Template..." />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-xs">
                  <SelectItem value="custom">-- Custom Text Reply --</SelectItem>
                  {templates.map((tpl) => (
                    <SelectItem key={tpl.id} value={tpl.id}>
                      [{tpl.type}] {tpl.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTemplateId === 'custom' ? (
              <div className="md:col-span-4">
                <label className="block text-[11px] font-bold text-gray-700 mb-1">Custom Reply Text:</label>
                <Input
                  value={customReplyText}
                  onChange={(e) => setCustomReplyText(e.target.value)}
                  placeholder="Instant text response..."
                  className="h-8 text-xs bg-white border-amber-200"
                />
              </div>
            ) : null}
          </div>

          <div className="flex justify-end">
            <Button
              onClick={handleAddTriggerRule}
              disabled={addingRule || !newKeyword.trim()}
              size="sm"
              className="gap-1.5 bg-amber-600 hover:bg-amber-700 font-bold text-xs text-white h-8"
            >
              {addingRule ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add Trigger Rule
            </Button>
          </div>
        </div>

        {/* Existing Trigger Rules List */}
        <div className="space-y-2">
          {triggerRules.length === 0 ? (
            <p className="text-xs text-gray-400 italic p-3 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              No trigger rules created yet. Add exact keywords above (e.g. "ad", "offers") for instant auto-replies.
            </p>
          ) : (
            triggerRules.map((rule) => {
              const linkedTpl = templates.find((t) => t.id === rule.templateId)
              return (
                <div
                  key={rule.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-gray-200 shadow-2xs"
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="rounded bg-amber-100 px-2 py-0.5 font-mono font-bold text-xs text-amber-900 border border-amber-200 shrink-0">
                      "{rule.keyword}"
                    </span>
                    <span className="text-xs text-gray-400">➔</span>
                    <span className="text-xs text-gray-800 font-medium truncate">
                      {linkedTpl ? (
                        <span className="font-bold text-emerald-700">Template: [{linkedTpl.type}] {linkedTpl.name}</span>
                      ) : (
                        rule.replyText || 'Standard Auto Reply'
                      )}
                    </span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteTriggerRule(rule.id)}
                    className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-700 shrink-0"
                    title="Delete trigger rule"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* SECTION 3: Quick Template & Flow Creators */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3 shadow-2xs">
        <h3 className="font-extrabold text-xs text-gray-900 flex items-center gap-1.5 uppercase tracking-wider">
          <FileText className="h-4 w-4 text-emerald-600" /> 3. Quick Creators for Template Library
        </h3>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={() => setTplModalOpen(true)}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white h-9 shadow-xs"
          >
            <FileText className="h-4 w-4" /> Create Template
          </Button>

          <Button
            onClick={() => setFlowModalOpen(true)}
            className="gap-2 bg-purple-600 hover:bg-purple-700 font-bold text-xs text-white h-9 shadow-xs"
          >
            <GitBranch className="h-4 w-4" /> Create Flow Chat
          </Button>
        </div>
      </div>

      {/* Modal 1: Quick Create Template */}
      <Dialog open={tplModalOpen} onOpenChange={setTplModalOpen}>
        <DialogContent className="max-w-md bg-white border-gray-200 text-gray-900 font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <FileText className="h-5 w-5 text-emerald-600" /> Quick Create Template
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Create a reusable message template for Quick Replies and Campaigns.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Template Name *</label>
              <Input
                value={tplName}
                onChange={(e) => setTplName(e.target.value)}
                placeholder="e.g. Ugadi Special Offer Pitch"
                className="h-8 text-xs border-gray-200 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Template Type</label>
              <Select value={tplType} onValueChange={(val) => setTplType(val as any)}>
                <SelectTrigger className="h-8 border-gray-200 bg-white text-xs text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-gray-200 text-xs">
                  <SelectItem value="text">Plain Text Template</SelectItem>
                  <SelectItem value="button">Button Message Template</SelectItem>
                  <SelectItem value="list">List Menu Template</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Message Text Content *</label>
              <Textarea
                value={tplText}
                onChange={(e) => setTplText(e.target.value)}
                placeholder="Type template message content..."
                rows={4}
                className="border-gray-200 bg-white text-xs"
              />
            </div>

            <Button
              onClick={handleCreateQuickTemplate}
              disabled={savingTpl || !tplName.trim() || !tplText.trim()}
              className="w-full h-9 bg-emerald-600 hover:bg-emerald-700 font-bold text-xs text-white"
            >
              {savingTpl ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Template to Library
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal 2: Quick Create Flow Chat */}
      <Dialog open={flowModalOpen} onOpenChange={setFlowModalOpen}>
        <DialogContent className="max-w-lg bg-white border-gray-200 text-gray-900 font-sans">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-bold">
              <GitBranch className="h-5 w-5 text-purple-600" /> Quick Create Sequential Flow Chat
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-500">
              Build an automated sequence of WhatsApp messages sent with timed delays.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Flow Name *</label>
              <Input
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                placeholder="e.g. Franchise Onboarding Sequence"
                className="h-8 text-xs border-gray-200 bg-white"
              />
            </div>

            {/* Sequence Steps */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-700">Sequential Flow Steps:</label>
                <button
                  onClick={() =>
                    setFlowSteps((prev) => [
                      ...prev,
                      { id: String(Date.now()), delayMs: 2000, message: 'Followup message...' },
                    ])
                  }
                  className="text-[11px] font-bold text-purple-700 hover:underline"
                >
                  + Add Step
                </button>
              </div>

              {flowSteps.map((step, idx) => (
                <div key={step.id} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
                    <span>Step {idx + 1} (Delay: {step.delayMs / 1000}s)</span>
                    {flowSteps.length > 1 ? (
                      <button
                        onClick={() => setFlowSteps((prev) => prev.filter((s) => s.id !== step.id))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    ) : null}
                  </div>
                  <Input
                    value={step.message}
                    onChange={(e) => {
                      const val = e.target.value
                      setFlowSteps((prev) => prev.map((s) => (s.id === step.id ? { ...s, message: val } : s)))
                    }}
                    placeholder={`Message for Step ${idx + 1}...`}
                    className="h-7 text-xs bg-white border-gray-200"
                  />
                </div>
              ))}
            </div>

            <Button
              onClick={handleCreateQuickFlow}
              disabled={savingFlow || !flowName.trim()}
              className="w-full h-9 bg-purple-600 hover:bg-purple-700 font-bold text-xs text-white"
            >
              {savingFlow ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save Flow to Library
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
