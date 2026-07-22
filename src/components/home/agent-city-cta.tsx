import Link from 'next/link'
import { Briefcase, MapPin, ArrowRight, Building2, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SectionHeading } from './section-heading'

export function AgentCityCTA() {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Agent CTA */}
        <div className="relative overflow-hidden rounded-3xl glass-strong p-6 sm:p-8">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-400/10 blur-2xl" />
          <div className="relative">
            <span className="grid h-12 w-12 place-items-center rounded-xl gradient-brand text-white shadow-lg">
              <Briefcase className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-xl font-black text-slate-900 sm:text-2xl">
              Become a <span className="gradient-text">Choutuppal Agent</span>
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              List businesses in bulk via CSV, track leads, and publish local news.
              Earn while you grow the network.
            </p>
            <Button asChild className="mt-4 gap-1.5 gradient-brand text-white">
              <Link href="/agent">
                Apply as Agent <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* City Expansion CTA */}
        <div className="relative overflow-hidden rounded-3xl glass-strong p-6 sm:p-8">
          <div className="absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-amber-400/10 blur-2xl" />
          <div className="relative">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-amber-500 to-blue-400 text-white shadow-lg">
              <MapPin className="h-6 w-6" />
            </span>
            <h3 className="mt-4 text-xl font-black text-slate-900 sm:text-2xl">
              Expanding across <span className="gradient-text">Yadadri & beyond</span>
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              From Choutuppal mandal to the whole of Yadadri Bhuvanagiri — bring your
              village online. 18 villages already live.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild variant="outline" className="gap-1.5 border-blue-200 text-blue-700 hover:bg-blue-50">
                <Link href="/login">
                  <Building2 className="h-4 w-4" /> List Your Village
                </Link>
              </Button>
              <Button asChild variant="outline" className="gap-1.5 border-amber-200 text-amber-700 hover:bg-amber-50">
                <Link href="/community">
                  <Users className="h-4 w-4" /> Join Community
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
