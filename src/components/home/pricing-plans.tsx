import Link from 'next/link'
import { Sparkles, Crown, Rocket, Megaphone, Video, Send, HeartHandshake, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'

const REVENUE_PLANS = [
  {
    name: 'Story / Banner Ad',
    icon: Megaphone,
    price: '₹99',
    unit: '/ day',
    note: 'Top Homepage Banner Visibility',
    features: [
      'Top homepage banner placement',
      '24-hour guaranteed visibility',
      'Direct WhatsApp link click',
      'Automated daily stats report',
    ],
    cta: 'Book ₹99/day Ad',
    whatsappText: 'Hello! I want to book a ₹99/day Story/Banner Ad on Choutuppal App.',
    highlight: false,
    badge: 'Popular',
    grad: 'from-blue-600 to-indigo-600',
  },
  {
    name: 'Reels Promotion',
    icon: Video,
    price: '₹299',
    unit: '/ 3 days',
    note: 'Instagram & YouTube Shorts Rail',
    features: [
      'Promote your shop reel on homepage',
      '3-day featured reel placement',
      'Direct reel viewer analytics',
      'Social media cross-posting',
    ],
    cta: 'Promote My Reel',
    whatsappText: 'Hello! I want to promote my Reel (₹299/3 days) on Choutuppal App.',
    highlight: true,
    badge: 'Trending',
    grad: 'from-pink-600 to-purple-600',
  },
  {
    name: 'Bulk Promo Message',
    icon: Send,
    price: '₹499',
    unit: '/ campaign',
    note: 'Reach 1,000+ Local Users',
    features: [
      'Direct WhatsApp message broadcast',
      'Targeted user/business list',
      'Includes image & action buttons',
      'Instant delivery report',
    ],
    cta: 'Send Bulk Offer',
    whatsappText: 'Hello! I want to send a ₹499 Bulk Promo Message to Choutuppal users.',
    highlight: false,
    badge: 'High ROI',
    grad: 'from-emerald-600 to-teal-600',
  },
  {
    name: 'Festival Greetings',
    icon: HeartHandshake,
    price: '₹199',
    unit: '/ greeting',
    note: 'Custom Branded Greeting Card',
    features: [
      'Branded festival greeting design',
      'Your shop logo & phone number',
      'Shared across local WhatsApp groups',
      'Customer goodwill booster',
    ],
    cta: 'Order Greeting Card',
    whatsappText: 'Hello! I want to order a ₹199 Branded Festival Greeting for my shop.',
    highlight: false,
    badge: 'Seasonal',
    grad: 'from-amber-500 to-orange-500',
  },
  {
    name: 'City Franchise',
    icon: ShieldCheck,
    price: '₹10,000',
    unit: '+ ₹1,000/mo',
    note: 'White-Label Super App for Your Town',
    features: [
      'Custom domain & app branding',
      'Full Admin & Agent CRM Panel',
      '100% ad revenue retains with you',
      'Complete launch setup support',
    ],
    cta: 'Launch Franchise',
    whatsappText: 'Hello! I want to inquire about starting a City Franchise (₹10,000 + ₹1,000/mo).',
    highlight: false,
    badge: 'White-Label',
    grad: 'from-slate-800 to-slate-900',
  },
]

export function PricingPlans() {
  const waNumber = '919441348175'

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <SectionHeading
        eyebrow="Advertising & Monetization"
        title="Promote Your Business locally"
        subtitle="Transparent, high-impact marketing plans to reach thousands of Choutuppal residents."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {REVENUE_PLANS.map((p) => {
          const Icon = p.icon
          const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(p.whatsappText)}`

          return (
            <div
              key={p.name}
              className={cn(
                'relative flex flex-col overflow-hidden rounded-3xl p-5 transition-all duration-300',
                p.highlight
                  ? 'glass-strong ring-2 ring-purple-500 shadow-xl scale-[1.02]'
                  : 'glass hover-lift hover:border-blue-300',
              )}
            >
              {p.badge ? (
                <Badge className={cn('absolute right-4 top-4 border-none text-[10px] font-bold', p.highlight ? 'bg-purple-600 text-white' : 'bg-blue-100 text-blue-800')}>
                  {p.badge}
                </Badge>
              ) : null}

              <div
                className={cn(
                  'mb-4 grid h-12 w-12 place-items-center rounded-2xl text-white shadow-md',
                  p.grad,
                )}
              >
                <Icon className="h-6 w-6" />
              </div>

              <h3 className="text-base font-extrabold text-slate-900">{p.name}</h3>

              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-black tracking-tight text-slate-900">
                  {p.price}
                </span>
                <span className="text-xs font-semibold text-slate-500">{p.unit}</span>
              </div>

              <p className="mt-1 text-xs font-medium text-slate-500 line-clamp-1">{p.note}</p>

              <ul className="mt-4 flex-1 space-y-2 border-t border-slate-100 pt-4">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-700">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                className={cn(
                  'mt-5 w-full gap-1.5 font-bold text-xs shadow-md',
                  p.highlight
                    ? 'gradient-brand text-white'
                    : 'bg-slate-900 text-white hover:bg-slate-800',
                )}
              >
                <a href={waUrl} target="_blank" rel="noopener noreferrer">
                  {p.cta}
                </a>
              </Button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
