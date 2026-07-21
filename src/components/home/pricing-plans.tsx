import Link from 'next/link'
import { Check, Sparkles, Crown, Rocket, Megaphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'

const PLANS = [
  {
    name: 'Basic',
    icon: Sparkles,
    price: 'Free',
    note: '₹0 forever',
    features: [
      '1 business listing',
      'Up to 5 photos',
      'Community access',
      'Basic analytics',
    ],
    cta: 'Get Started',
    highlight: false,
    grad: 'from-blue-500 to-blue-400',
  },
  {
    name: 'Pro',
    icon: Rocket,
    price: 'Free',
    note: '₹299 → ₹0 (Early Bird)',
    features: [
      '5 business listings',
      'Services catalog',
      'Priority support',
      'Advanced analytics',
    ],
    cta: 'Claim Pro',
    highlight: false,
    grad: 'from-sky-500 to-amber-400',
  },
  {
    name: 'Premium',
    icon: Crown,
    price: 'Free',
    note: '₹499 → ₹0 (Early Bird)',
    features: [
      'Unlimited listings',
      'Featured placement',
      '1 story / day',
      'Verified badge',
    ],
    cta: 'Go Premium',
    highlight: true,
    grad: 'from-amber-500 to-blue-500',
  },
  {
    name: 'Banner Ad',
    icon: Megaphone,
    price: 'Free',
    note: '₹99/day → ₹0 (Early Bird)',
    features: [
      'Homepage banner',
      '24-hour visibility',
      'Auto-rotate slides',
      '1-day free trial',
    ],
    cta: 'Start Free Day',
    highlight: false,
    grad: 'from-blue-600 to-amber-400',
  },
]

export function PricingPlans() {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <SectionHeading
        eyebrow="Pricing"
        title="Early Bird Offer — All FREE"
        subtitle="Launch pricing for Choutuppal. No credit card required."
      />

      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PLANS.map((p) => {
          const Icon = p.icon
          return (
            <div
              key={p.name}
              className={cn(
                'relative flex flex-col overflow-hidden rounded-3xl p-5 transition',
                p.highlight
                  ? 'glass-strong ring-2 ring-amber-400'
                  : 'glass hover-glow',
              )}
            >
              {p.highlight ? (
                <Badge className="absolute right-4 top-4 bg-amber-400 text-amber-950 hover:bg-amber-400">
                  Most Popular
                </Badge>
              ) : null}
              <div
                className={cn(
                  'mb-4 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br text-white shadow-lg',
                  p.grad,
                )}
              >
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-black tracking-tight gradient-text">
                  {p.price}
                </span>
              </div>
              <p className="mt-1 text-xs font-medium text-slate-500">{p.note}</p>

              <ul className="mt-4 flex-1 space-y-2">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  'mt-5 w-full gap-1',
                  p.highlight
                    ? 'gradient-brand text-white'
                    : 'border border-blue-200 bg-white text-blue-700 hover:bg-blue-50',
                )}
                variant={p.highlight ? 'default' : 'outline'}
              >
                <Link href="/login">{p.cta}</Link>
              </Button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
