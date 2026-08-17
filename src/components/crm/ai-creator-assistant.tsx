'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Send, Copy, Layers, ListFilter, Check } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

interface AiCreatorAssistantProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUsePayload: (text: string, options?: any) => void
}

export function AiCreatorAssistant({ open, onOpenChange, onUsePayload }: AiCreatorAssistantProps) {
  const [prompt, setPrompt] = useState('')
  const [type, setType] = useState<'interactive' | 'list' | 'flow'>('interactive')
  const [generating, setGenerating] = useState(false)
  const [result, setResult] = useState<{ textMessage?: string; options?: any } | null>(null)

  async function handleGenerate() {
    if (!prompt.trim()) {
      toast.error('Please enter a topic or instruction for the AI')
      return
    }
    setGenerating(true)
    setResult(null)
    try {
      const res = await fetch('/api/crm/ai-creator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, type }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to generate')
      setResult(json)
      toast.success('Generated AI Content & Payload!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  function handleUseThis() {
    if (!result?.textMessage) return
    onUsePayload(result.textMessage, result.options)
    onOpenChange(false)
    toast.success('Inserted into Chat Input!')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-slate-800 bg-slate-950 text-white font-sans">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-white">
            <Sparkles className="h-5 w-5 text-purple-400" /> AI Content Creator Assistant
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-400">
            Generate Meta WhatsApp templates, quick reply buttons, list messages, or promotional flows in one click.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Tabs value={type} onValueChange={(val) => setType(val as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 border-slate-800 bg-slate-900 text-xs">
              <TabsTrigger value="interactive" className="gap-1.5 text-xs font-semibold">
                <Sparkles className="h-3.5 w-3.5" /> Buttons
              </TabsTrigger>
              <TabsTrigger value="list" className="gap-1.5 text-xs font-semibold">
                <ListFilter className="h-3.5 w-3.5" /> List Menu
              </TabsTrigger>
              <TabsTrigger value="flow" className="gap-1.5 text-xs font-semibold">
                <Layers className="h-3.5 w-3.5" /> Message Flow
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Generate Diwali special offer for shop owners with button..."
              className="border-slate-800 bg-slate-900 text-xs text-white placeholder:text-slate-500 focus:border-purple-500"
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />
            <Button
              onClick={handleGenerate}
              disabled={generating}
              className="gap-1.5 gradient-brand font-bold text-xs text-white shrink-0"
            >
              {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              Generate
            </Button>
          </div>

          {/* Generated Result Preview */}
          {result ? (
            <div className="space-y-3 rounded-xl border border-purple-500/30 bg-purple-500/10 p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300">Generated Preview</span>
                <Button onClick={handleUseThis} size="sm" className="gap-1.5 bg-purple-600 hover:bg-purple-500 text-xs text-white font-bold h-7">
                  <Send className="h-3 w-3" /> Use This in Chat
                </Button>
              </div>

              <div className="rounded-lg bg-slate-900 p-3 border border-slate-800 space-y-2">
                <p className="text-xs whitespace-pre-wrap text-slate-100">{result.textMessage}</p>
                {result.options?.buttons ? (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800">
                    {result.options.buttons.map((b: any, idx: number) => (
                      <span key={idx} className="rounded bg-blue-600/30 border border-blue-500/40 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                        [Button] {b.title}
                      </span>
                    ))}
                  </div>
                ) : null}
                {result.options?.listOptions ? (
                  <div className="space-y-1 pt-2 border-t border-slate-800">
                    {result.options.listOptions.map((opt: any, idx: number) => (
                      <div key={idx} className="text-[10px] text-slate-300 font-medium">
                        • {opt.title} {opt.description ? `- ${opt.description}` : ''}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
