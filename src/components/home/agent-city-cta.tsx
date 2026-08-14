'use client'

import { UserPlus, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

const AGENT_WA_LINK =
  'https://wa.me/919494348175?text=' +
  encodeURIComponent('నమస్కారం చౌటుప్పల్ యాప్, ఏజెంట్ గా పనిచేయాలనుకుంటున్నాను. వివరాలు తెలపండి.')

const CITY_WA_LINK =
  'https://wa.me/919494348175?text=' +
  encodeURIComponent('నమస్కారం చౌటుప్పల్ యాప్, వైట్ లేబుల్ గా మా ఊరి కోసం పనిచేయాలనుకుంటున్నాను. వివరాలు తెలపండి.')

export function AgentCityCTA() {
  return (
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

        {/* Card 2: City Expansion — direct WhatsApp link (no form) */}
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
          <Button asChild className="gap-2 gradient-brand text-white">
            <a href={CITY_WA_LINK} target="_blank" rel="noopener noreferrer">
              <Building2 className="h-4 w-4" />
              <span className="font-telugu">వివరాల కోసం సంప్రదించండి</span>
            </a>
          </Button>
        </div>
      </div>
    </section>
  )
}
