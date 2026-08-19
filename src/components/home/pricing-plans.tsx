import Link from 'next/link'
import { Megaphone, Video, Send, Building2, Briefcase, Globe, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { SectionHeading } from './section-heading'
import { Youtube, Instagram, Facebook } from 'lucide-react'

const REVENUE_PLANS = [
  {
    name: 'Story / Banner Ad',
    icon: Megaphone,
    price: '₹99',
    unit: '/ day',
    note: 'Top Homepage Visibility',
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
    name: 'Reels Promo',
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
    name: 'Bulk Msg Promo',
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
    name: 'Listings Promo',
    icon: Building2,
    price: '₹199',
    unit: '/ week',
    note: 'Top Position in Category',
    features: [
      'Featured at top of search results',
      'Verified trust badge',
      'Direct call/WhatsApp buttons',
      'Enhanced business profile',
    ],
    cta: 'Promote Listing',
    whatsappText: 'Hello! I want to promote my Listing for ₹199/week.',
    highlight: false,
    badge: 'Visibility',
    grad: 'from-amber-500 to-orange-500',
  },
]

export function PricingPlans() {
  const waNumber = '919494348175'

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <SectionHeading
        eyebrow="Advertising & Monetization"
        title="Promote Your Business Locally"
        subtitle="Transparent, high-impact marketing plans to reach thousands of Choutuppal residents."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {/* Agent Glass Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/40 p-6 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-md">
                    <Briefcase className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-telugu text-lg font-bold text-slate-900">చౌటుప్పల్ యాప్ ఏజెంట్ గా పనిచేయండి!</h3>
                    <p className="text-sm font-medium text-slate-600">నెల నెలా మంచి ఆదాయం పొందండి.</p>
                </div>
            </div>
            <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Hello! I want to join as an Agent for Choutuppal App.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition"
            >
                <MessageCircle size={16} className="text-[#25D366]" /> Join Now
            </a>
        </div>

        {/* Franchise Glass Card */}
        <div className="relative overflow-hidden rounded-3xl border border-white/50 bg-white/40 p-6 backdrop-blur-xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-md">
                    <Globe className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="font-telugu text-lg font-bold text-slate-900">మీ ఊరికి ఈ యాప్ కావాలా?</h3>
                    <p className="text-sm font-medium text-slate-600">ఫ్రాంచైజీ తీసుకుని సొంత బిజినెస్ ప్రారంభించండి.</p>
                </div>
            </div>
            <a
                href={`https://wa.me/${waNumber}?text=${encodeURIComponent('Hello! I want to get info about starting a City Franchise.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition"
            >
                <MessageCircle size={16} className="text-[#25D366]" /> Get Info
            </a>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <a href="https://chat.whatsapp.com/choutuppal" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition">
            <MessageCircle size={16} className="text-[#25D366]" /> Join Community
        </a>
        <a href="https://whatsapp.com/channel/choutuppal" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition">
            <MessageCircle size={16} className="text-[#25D366]" /> WhatsApp Channel
        </a>
        <a href="https://youtube.com/@choutuppalapp" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition">
            <Youtube size={16} className="text-[#FF0000]" /> YouTube
        </a>
        <a href="https://instagram.com/choutuppalapp" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition">
            <Instagram size={16} className="text-[#E1306C]" /> Instagram
        </a>
        <a href="https://facebook.com/choutuppalapp" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition">
            <Facebook size={16} className="text-[#1877F2]" /> Facebook
        </a>
      </div>
    </section>
  )
}
