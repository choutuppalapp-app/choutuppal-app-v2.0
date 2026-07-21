'use client'

import { useState } from 'react'
import { Gift, Sparkles, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from './section-heading'

const SEGMENTS = [
  { label: '₹50', color: '#1d4ed8' },
  { label: '10% Off', color: '#f59e0b' },
  { label: '₹100', color: '#3b82f6' },
  { label: 'Try Again', color: '#fbbf24' },
  { label: 'Free Ad', color: '#1d4ed8' },
  { label: '₹20', color: '#f59e0b' },
  { label: '5% Off', color: '#3b82f6' },
  { label: 'Spin Again', color: '#fbbf24' },
]

export function SpinWin() {
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)

  const spin = () => {
    if (spinning) return
    setSpinning(true)
    const winner = Math.floor(Math.random() * SEGMENTS.length)
    const segAngle = 360 / SEGMENTS.length
    const target = 360 * 5 + (360 - winner * segAngle - segAngle / 2)
    setRotation((prev) => prev + target)
    window.setTimeout(() => setSpinning(false), 4200)
  }

  return (
    <section id="spin" className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <div className="overflow-hidden rounded-3xl glass-strong">
        <div className="grid items-center gap-6 p-6 sm:p-8 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Daily Reward"
              title="Spin & Win"
              subtitle="One free spin every day for early-bird users."
            />
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-amber-500" /> Win cashback,
                discounts & free banner ads.
              </li>
              <li className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-500" /> 1 free spin daily
                — Early Bird Offer, all FREE.
              </li>
            </ul>
            <Button
              onClick={spin}
              disabled={spinning}
              className="mt-5 gap-2 gradient-brand text-white shadow-lg shadow-blue-500/30"
            >
              <RotateCw className={spinning ? 'h-4 w-4 animate-spin' : 'h-4 w-4'} />
              {spinning ? 'Spinning…' : 'Spin Now (Free)'}
            </Button>
          </div>

          {/* Wheel */}
          <div className="flex justify-center">
            <div className="relative h-56 w-56 sm:h-64 sm:w-64">
              {/* pointer */}
              <div className="absolute left-1/2 top-[-6px] z-20 h-0 w-0 -translate-x-1/2 border-x-[12px] border-t-[20px] border-x-transparent border-t-amber-500 drop-shadow" />
              {/* ring */}
              <div className="absolute inset-0 rounded-full gradient-ring p-1.5 shadow-2xl">
                <div
                  className="relative h-full w-full rounded-full overflow-hidden transition-transform duration-[4000ms] ease-out"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    {SEGMENTS.map((s, i) => {
                      const segAngle = 360 / SEGMENTS.length
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
                      const mid = startAngle + segAngle / 2
                      const tx = cx + (r * 0.6) * Math.cos((mid * Math.PI) / 180)
                      const ty = cy + (r * 0.6) * Math.sin((mid * Math.PI) / 180)
                      return (
                        <g key={i}>
                          <path d={path} fill={s.color} />
                          <text
                            x={tx}
                            y={ty}
                            fill="#ffffff"
                            fontSize="5"
                            fontWeight="700"
                            textAnchor="middle"
                            dominantBaseline="middle"
                            transform={`rotate(${mid + 90} ${tx} ${ty})`}
                          >
                            {s.label}
                          </text>
                        </g>
                      )
                    })}
                  </svg>
                </div>
              </div>
              {/* hub */}
              <div className="absolute left-1/2 top-1/2 z-10 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-blue-700 shadow-lg">
                <RotateCw className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
