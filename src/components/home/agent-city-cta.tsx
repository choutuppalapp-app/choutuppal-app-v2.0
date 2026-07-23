'use client'

import { useState } from 'react'
import { UserPlus, Building2, Loader2, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const AGENT_WA_LINK =
  'https://wa.me/918790083706?text=' +
  encodeURIComponent('నేను చౌటుప్పల్ యాప్ ఏజెంట్ గా చేరాలనుకుంటున్నాను')

export function AgentCityCTA() {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <>
      <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Card 1: Become an Agent */}
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-blue-500/30 bg-white/20 p-8 text-center backdrop-blur-lg">
            <span className="grid h-14 w-14 place-items-center rounded-2xl gradient-brand text-white shadow-lg">
              <UserPlus className="h-7 w-7" />
            </span>
            <h3 className="font-telugu text-xl font-black text-slate-900 sm:text-2xl">
              చౌటుప్పల్ యాప్ ఏజెంట్ గా పనిచేయండి!
            </h3>
            <p className="font-telugu max-w-sm text-sm leading-relaxed text-slate-600">
              మీ పరిసరాల్లో ఉన్న వ్యాపారాలను యాప్ లో చేర్చి నిలకడైన ఆదాయం పొందండి. కేవలం వ్యాపార వివరాలు అందించండి, మేము బల్క్ గా అప్‌లోడ్ చేస్తామ్.
            </p>
            <Button asChild className="gap-2 gradient-brand text-white">
              <a href={AGENT_WA_LINK} target="_blank" rel="noopener noreferrer">
                <UserPlus className="h-4 w-4" />
                <span className="font-telugu">ఏజెంట్ గా చేరండి</span>
              </a>
            </Button>
          </div>

          {/* Card 2: White Label / City Expansion */}
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-blue-500/30 bg-white/20 p-8 text-center backdrop-blur-lg">
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-500 to-blue-400 text-white shadow-lg">
              <Building2 className="h-7 w-7" />
            </span>
            <h3 className="font-telugu text-xl font-black text-slate-900 sm:text-2xl">
              మీ ఊరికి ఈ యాప్ కావాలా?
            </h3>
            <p className="font-telugu max-w-sm text-sm leading-relaxed text-slate-600">
              చౌటుప్పల్ లాగా, మీ ఊరి పేరుతో కూడా ఒక సూపర్ యాప్ ని సెటప్ చేయొచ్చు. మీ ఊరి వ్యాపారాలను డిజిటల్ గా మార్చండి.
            </p>
            <Button
              onClick={() => setModalOpen(true)}
              className="gap-2 gradient-brand text-white"
            >
              <Building2 className="h-4 w-4" />
              <span className="font-telugu">వివరాల కోసం సంప్రదించండి</span>
            </Button>
          </div>
        </div>
      </section>

      {/* City Expansion Contact Modal */}
      {modalOpen ? <CityInquiryModal onClose={() => setModalOpen(false)} /> : null}
    </>
  )
}

/* -------------------------------------------------------------------------- */
/* City Inquiry Modal                                                          */
/* -------------------------------------------------------------------------- */

function CityInquiryModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [town, setTown] = useState('')
  const [phone, setPhone] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  async function submit() {
    if (!name.trim() || !town.trim() || !phone.trim()) {
      toast.error('దయచేసి అన్ని ఫీల్డ్‌లను పూరించండి')
      return
    }
    setBusy(true)
    try {
      const res = await fetch('/api/city-inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), town: town.trim(), phone: phone.trim() }),
      })
      const j = await res.json()
      if (!res.ok || !j.ok) throw new Error(j.error || 'Failed')
      setDone(true)
      toast.success('మీ అభ్యర్థన సమర్పించబడింది! మేము త్వరలో మీకు సంప్రదిస్తాము.')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'సమర్పించడం విఫలమైంది')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-3xl glass-strong p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-telugu flex items-center gap-2 text-lg font-black text-slate-900">
            <Building2 className="h-5 w-5 text-blue-600" />
            మీ ఊరికి ఈ యాప్ కావాలా?
          </h3>
          <button onClick={onClose} aria-label="Close" className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="py-8 text-center">
            <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
              <Check className="h-7 w-7" />
            </span>
            <p className="font-telugu mt-3 text-sm font-semibold text-slate-900">
              మీ అభ్యర్థన విజయవంతంగా సమర్పించబడింది!
            </p>
            <p className="font-telugu mt-1 text-xs text-slate-500">
              మా బృందం త్వరలో మీకు సంప్రదిస్తుంది.
            </p>
            <Button onClick={onClose} className="mt-4 gradient-brand text-white">మూసివేయి</Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="font-telugu mb-1 block text-xs font-semibold text-slate-600">పేరు</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="మీ పేరు" />
            </div>
            <div>
              <Label className="font-telugu mb-1 block text-xs font-semibold text-slate-600">ఊరు / పట్టణం</Label>
              <Input value={town} onChange={(e) => setTown(e.target.value)} placeholder="మీ ఊరి పేరు" />
            </div>
            <div>
              <Label className="font-telugu mb-1 block text-xs font-semibold text-slate-600">ఫోన్ నంబర్</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91…" inputMode="tel" />
            </div>
            <Button
              onClick={submit}
              disabled={busy}
              className="font-telugu w-full gap-2 gradient-brand text-white"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
              సమర్పించండి
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
