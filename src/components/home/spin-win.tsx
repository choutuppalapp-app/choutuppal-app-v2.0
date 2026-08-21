import { Gift, Sparkles, ChevronRight } from 'lucide-react'
import { SectionHeading } from './section-heading'
import Link from 'next/link'

export function SpinWin() {
  return (
    <section id="spin" className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <Link href="/spin-win" className="block relative overflow-hidden rounded-[2rem] glass-strong hover:scale-[1.01] transition-all duration-300 shadow-xl group border border-white/50">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-2 relative z-10">
          <div>
            <SectionHeading
              eyebrow="Daily Reward"
              title="Spin & Win"
              subtitle="One free spin every day for early-bird users."
            />
            <ul className="mt-4 space-y-3 text-sm font-medium text-slate-700">
              <li className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-amber-500" /> Win cashback, discounts & free ads.
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" /> 1 free spin daily — Early Bird Offer.
              </li>
            </ul>
            <div className="mt-6 inline-flex items-center gap-2 rounded-2xl gradient-brand px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all">
              Play Now <ChevronRight className="h-4 w-4" />
            </div>
          </div>

          {/* Wheel Graphic */}
          <div className="flex justify-center lg:justify-end pr-4">
            <div className="relative h-48 w-48 sm:h-56 sm:w-56 pointer-events-none transform group-hover:rotate-12 transition-transform duration-700">
              {/* ring */}
              <div className="absolute inset-0 rounded-full gradient-ring p-1.5 shadow-2xl">
                <div className="relative h-full w-full rounded-full overflow-hidden bg-white/20">
                  <svg viewBox="0 0 100 100" className="h-full w-full opacity-90">
                    {[
                      { color: '#1d4ed8' },
                      { color: '#f59e0b' },
                      { color: '#3b82f6' },
                      { color: '#fbbf24' },
                      { color: '#1d4ed8' },
                      { color: '#f59e0b' },
                      { color: '#3b82f6' },
                      { color: '#fbbf24' },
                    ].map((s, i, arr) => {
                      const segAngle = 360 / arr.length
                      const startAngle = i * segAngle - 90
                      const endAngle = startAngle + segAngle
                      const r = 50
                      const cx = 50
                      const cy = 50
                      const x1 = cx + r * Math.cos((startAngle * Math.PI) / 180)
                      const y1 = cy + r * Math.sin((startAngle * Math.PI) / 180)
                      const x2 = cx + r * Math.cos((endAngle * Math.PI) / 180)
                      const y2 = cy + r * Math.sin((endAngle * Math.PI) / 180)
                      const path = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`
                      return (
                        <path key={i} d={path} fill={s.color} />
                      )
                    })}
                  </svg>
                </div>
              </div>
              {/* hub */}
              <div className="absolute left-1/2 top-1/2 z-10 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-blue-700 shadow-xl">
                <Gift className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </section>
  )
}
