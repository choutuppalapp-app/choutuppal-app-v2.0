'use client'

import Link from 'next/link'
import { Newspaper, Gift, UserCheck, Building, MessageCircle, Sparkles, ChevronRight } from 'lucide-react'

export function CommunityHub() {
  const newsWhatsAppLink = `https://wa.me/919441348175?text=${encodeURIComponent(
    'నమస్కారం, మా ఊరిలో ఒక లోకల్ న్యూస్/ఈవెంట్ ఉంది. దయచేసి యాప్ లో పబ్లిష్ చేయండి: ',
  )}`

  const franchiseWhatsAppLink = `https://wa.me/919441348175?text=${encodeURIComponent(
    'నమస్కారం, నా ఊరి కోసం ఒక వైట్-లేబుల్ సూపర్ యాప్ సెటప్ చేయాలనుకుంటున్నాను. సమాచారం కావాలి.',
  )}`

  return (
    <section className="relative w-full py-4">
      {/* Section Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-100 mb-1">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Community & Opportunities Hub</span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">
            కమ్యూనిటీ & <span className="bg-gradient-to-r from-blue-600 to-amber-500 bg-clip-text text-transparent">అవకాశాలు</span>
          </h2>
        </div>
      </div>

      {/* 2x2 Responsive Grid */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {/* Card 1: Local News Submission */}
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/30 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-500/10">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <Newspaper className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                మీకు ఏదైనా లోకల్ న్యూస్ తెలుసా?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                మీ ఊరిలో జరుగుతున్న విశేషాలను, ఈవెంట్స్ ని మాతో షేర్ చేయండి. మేము యాప్ లో ప్రచురిస్తాము.
              </p>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
            <a
              href={newsWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-emerald-600/20 transition-all duration-200 hover:bg-emerald-500 active:scale-95"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp పంపండి</span>
            </a>
          </div>
        </div>

        {/* Card 2: Spin & Win */}
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-amber-50/30 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-2xl hover:shadow-amber-500/10">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <Gift className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                Spin & Win
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                చౌటుప్పల్ యాప్ లో అద్భుతమైన బహుమతులు గెలుచుకోండి!
              </p>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
            <Link
              href="/#spin-win"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-amber-500/20 transition-all duration-200 hover:from-amber-400 hover:to-amber-500 active:scale-95"
            >
              <span>ఇప్పుడే ఆడండి</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Card 3: Become an Agent */}
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-500/10">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-blue-500/10 text-blue-600 border border-blue-500/20 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <UserCheck className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                చౌటుప్పల్ యాప్ ఏజెంట్ గా పనిచేయండి!
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                మీ ఊరి బిజినెస్ లిస్టింగ్స్ ను అప్డేట్ చేసి ఆదాయం పొందండి.
              </p>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
            <Link
              href="/agent"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-blue-600/20 transition-all duration-200 hover:bg-blue-500 active:scale-95"
            >
              <span>ఏజెంట్ గా సైన్ అప్ చేయండి</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Card 4: Franchise Opportunity */}
        <div className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white via-slate-50/50 to-emerald-50/30 p-6 shadow-xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-2xl hover:shadow-emerald-500/10">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm transition-transform duration-300 group-hover:scale-110">
              <Building className="h-6 w-6" />
            </div>
            <div className="flex-1 space-y-1.5">
              <h3 className="text-lg font-bold text-slate-900 leading-snug">
                మీ ఊరికి ఈ యాప్ కావాలా?
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                చౌటుప్పల్ యాప్ లాగా, మీ ఊరి పేరుతో ఒక సూపర్ యాప్ ని సెటప్ చేయొచ్చు.
              </p>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
            <a
              href={franchiseWhatsAppLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-md shadow-emerald-600/20 transition-all duration-200 hover:bg-emerald-500 active:scale-95"
            >
              <MessageCircle className="h-4 w-4" />
              <span>వాట్సాప్ లో మాట్లాడండి</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
