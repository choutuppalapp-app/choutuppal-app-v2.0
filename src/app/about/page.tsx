import type { Metadata } from 'next'
import Link from 'next/link'
import { Phone, MapPin, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'About | Choutuppal App',
  description: 'About the Choutuppal App — the local marketplace & community platform.',
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-24 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-3 sm:px-4">
          <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-base font-black text-white">C</Link>
          <h1 className="text-sm font-extrabold text-slate-900">About</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-3 py-8 sm:px-4">
        <div className="rounded-3xl glass-strong p-8">
          <h1 className="font-telugu text-2xl font-black text-slate-900">
            చౌటుప్పల్ యాప్ v2.0 గురించి
          </h1>
          <p className="font-telugu mt-3 text-sm leading-relaxed text-slate-600">
            చౌటుప్పల్ యాప్ అనేది చౌటుప్పల్ మండలంలోని 18 గ్రామాల వ్యాపారాలు, సేవలు, రియల్ ఎస్టేట్, వార్తలు మరియు కమ్యూనిటీని ఒకే వేదికపై అందించే ఒక సూపర్ యాప్. స్థానిక వ్యాపారాలను డిజిటల్ గా మార్చడం, గ్రామస్తులకు సేవలందించడం మరియు కమ్యూనిటీని అనుసంధానించడం మా లక్ష్యం.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            The Choutuppal App is a local marketplace and community platform for the 18 villages of
            Choutuppal mandal, Yadadri Bhuvanagiri, Telangana. Our mission is to digitize local
            businesses, connect the community, and bring every village online.
          </p>

          <div className="mt-6 space-y-3 rounded-2xl gradient-brand-soft p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
              <Heart className="h-4 w-4 text-amber-500" /> Powered By
            </h2>
            <p className="font-telugu text-base font-bold text-slate-900">
              చౌటుప్పల్, యాదాద్రి, తెలంగాణ - 508252
            </p>
            <div className="flex flex-col gap-1 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-500" />
                <a href="tel:9441348175" className="font-semibold hover:text-blue-600">9441348175</a>
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-amber-500" />
                చౌటుప్పల్, యాదాద్రి భువనగిరి జిల్లా, తెలంగాణ - 508252
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/" className="rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-white">Back to Home</Link>
            <Link href="/community" className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:text-blue-600">Community</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
