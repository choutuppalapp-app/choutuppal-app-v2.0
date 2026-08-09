import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, MapPin, Heart } from 'lucide-react'
import { getCurrentTenant, DEFAULT_TENANT } from '@/lib/tenant'

export async function generateMetadata(): Promise<Metadata> {
  const tenant = await getCurrentTenant()
  return {
    title: `About | ${tenant.name}`,
    description: `About ${tenant.name} — the local marketplace & community platform.`,
  }
}

export default async function AboutPage() {
  const tenant = await getCurrentTenant()
  const isDefault = tenant.id === DEFAULT_TENANT.id

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-24 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-3 sm:px-4">
          <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-base font-black text-white">
            {tenant.name.substring(0, 1).toUpperCase()}
          </Link>
          <h1 className="text-sm font-extrabold text-slate-900">About {tenant.name}</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-3 py-8 sm:px-4">
        <div className="rounded-3xl glass-strong p-8">
          <h1 className="font-telugu text-2xl font-black text-slate-900">
            {tenant.name} గురించి
          </h1>
          <p className="font-telugu mt-3 text-sm leading-relaxed text-slate-600">
            {tenant.name} అనేది స్థానిక వ్యాపారాలు, సేవలు, రియల్ ఎస్టేట్, వార్తలు మరియు కమ్యూనిటీని ఒకే వేదికపై అందించే డిజిటల్ ప్లాట్‌ఫారమ్. స్థానిక వ్యాపారాలను ప్రోత్సహించడం మరియు గ్రామస్తులను అనుసంధానించడం మా లక్ష్యం.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {tenant.name} is a local marketplace and community platform connecting local businesses, services, real estate, and news. Our mission is to digitize local businesses and bring every community online.
          </p>

          <div className="mt-6 space-y-3 rounded-2xl gradient-brand-soft p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
              <Heart className="h-4 w-4 text-amber-500" /> Platform Details
            </h2>
            <p className="font-telugu text-base font-bold text-slate-900">
              {tenant.name}
            </p>
            <div className="flex flex-col gap-1 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-500" />
                <a href={`tel:${tenant.adminPhone}`} className="font-semibold hover:text-blue-600">
                  {tenant.adminPhone}
                </a>
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-500" />
                {isDefault ? 'చౌటుప్పల్, యాదాద్రి భువనగిరి జిల్లా, తెలంగాణ - 508252' : `${tenant.name} Services`}
              </span>
            </div>
          </div>

          {!isDefault ? (
            <div className="mt-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
              Powered by <a href="https://www.choutuppal.in" target="_blank" rel="noopener noreferrer" className="font-semibold text-blue-600 hover:underline">Choutuppal App SaaS</a>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-white">Back to Home</Link>
            <Link href="/community" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600">Community</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
