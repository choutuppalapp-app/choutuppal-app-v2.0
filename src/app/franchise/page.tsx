import type { Metadata } from 'next'
import Link from 'next/link'
import {
  MessageCircle,
  Sparkles,
  CheckCircle2,
  Globe,
  ShieldCheck,
  Building2,
  TrendingUp,
  Zap,
  Rocket,
  ChevronRight,
  HelpCircle,
  Smartphone,
  Store,
  Crown,
  MapPin,
  Phone,
  Check,
} from 'lucide-react'
import { SocialLinks } from '@/components/shared/social-links'

export const metadata: Metadata = {
  title: 'White-Label App Franchise | మీ ఊరికి ఈ యాప్ కావాలా?',
  description:
    'చౌటుప్పల్ యాప్ లాగా, మీ ఊరి పేరుతో కూడా ఒక సూపర్ యాప్ ని సెటప్ చేయొచ్చు. మీ ఊరి వ్యాపారాలను డిజిటల్ గా మార్చి నెలకు నిలకడైన ఆదాయం పొందండి.',
  verification: {
    other: {
      'facebook-domain-verification': 'azmrpgp5okeykmb62of7zz6j5si5i8',
    },
  },
}

const WHATSAPP_TELUGU_TEXT =
  'నమస్కారం, నా ఊరి కోసం ఒక వైట్-లేబుల్ సూపర్ యాప్ సెటప్ చేయాలనుకుంటున్నాను. సమాచారం కావాలి.'
const WHATSAPP_LINK = `https://wa.me/919494348175?text=${encodeURIComponent(
  WHATSAPP_TELUGU_TEXT,
)}`

export default function FranchisePage() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans text-slate-100 selection:bg-amber-500 selection:text-slate-900">
      {/* -------------------------------------------------------------------------- */}
      {/* Dynamic Background Glow FX                                                */}
      {/* -------------------------------------------------------------------------- */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-600/20 blur-[140px]" />
        <div className="absolute top-1/3 -right-40 h-[500px] w-[500px] rounded-full bg-amber-500/15 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-indigo-600/20 blur-[140px]" />
      </div>

      {/* -------------------------------------------------------------------------- */}
      {/* Dedicated Header                                                           */}
      {/* -------------------------------------------------------------------------- */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-amber-400 font-black text-white shadow-lg shadow-blue-500/20 transition group-hover:scale-105">
              C
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-white sm:text-lg">
                Choutuppal<span className="text-amber-400">App</span>
              </span>
              <span className="ml-2 inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 border border-amber-500/30">
                Franchise SaaS
              </span>
            </div>
          </Link>

          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-slate-950 transition hover:bg-emerald-400 active:scale-95 sm:text-sm shadow-lg shadow-emerald-500/20"
          >
            <MessageCircle className="h-4 w-4 fill-slate-950 text-emerald-500" />
            <span className="hidden sm:inline">WhatsApp Contact</span>
            <span className="sm:hidden">WhatsApp</span>
          </a>
        </div>
      </header>

      {/* -------------------------------------------------------------------------- */}
      {/* Hero Section                                                               */}
      {/* -------------------------------------------------------------------------- */}
      <section className="relative z-10 mx-auto max-w-5xl px-4 pt-12 pb-16 text-center sm:px-6 sm:pt-20 sm:pb-24">
        {/* Top Pill */}
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 backdrop-blur-md">
          <Sparkles className="h-4 w-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-extrabold tracking-wide text-amber-300 sm:text-sm">
            100% White-Label App Franchise Partner Opportunity
          </span>
        </div>

        {/* Main Telugu Headline */}
        <h1 className="text-3xl font-black tracking-tight text-white leading-tight sm:text-5xl lg:text-6xl">
          మీ ఊరికి ఈ <span className="bg-gradient-to-r from-blue-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">యాప్ కావాలా?</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mt-6 max-w-3xl text-base font-medium leading-relaxed text-slate-300 sm:text-xl">
          చౌటుప్పల్ యాప్ లాగా, మీ ఊరి పేరుతో కూడా ఒక సూపర్ యాప్ ని సెటప్ చేయొచ్చు. మీ ఊరి వ్యాపారాలను డిజిటల్ గా మార్చండి.
        </p>

        {/* Primary CTA Button */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={WHATSAPP_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-8 py-4 text-lg font-black text-slate-950 shadow-xl shadow-emerald-500/30 transition hover:bg-emerald-400 active:scale-95 sm:w-auto"
          >
            <MessageCircle className="h-6 w-6 fill-slate-950 text-emerald-500 transition group-hover:scale-110" />
            <span>ఇప్పుడే వాట్సాప్ లో మాట్లాడండి</span>
            <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </a>
        </div>

        {/* Highlight Stats Bar */}
        <div className="mt-14 grid grid-cols-2 gap-3 rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl sm:grid-cols-4 sm:gap-6 sm:p-6">
          <div className="flex flex-col items-center p-2">
            <Zap className="h-6 w-6 text-amber-400 mb-1" />
            <span className="text-base font-extrabold text-white sm:text-lg">24-48h Setup</span>
            <span className="text-xs text-slate-400">లైవ్ రెడీ యాప్</span>
          </div>
          <div className="flex flex-col items-center p-2">
            <Globe className="h-6 w-6 text-blue-400 mb-1" />
            <span className="text-base font-extrabold text-white sm:text-lg">Your Domain</span>
            <span className="text-xs text-slate-400">మీ ఊరి డొమైన్</span>
          </div>
          <div className="flex flex-col items-center p-2">
            <ShieldCheck className="h-6 w-6 text-emerald-400 mb-1" />
            <span className="text-base font-extrabold text-white sm:text-lg">Super Admin</span>
            <span className="text-xs text-slate-400">పూర్తి పానెల్ కంట్రోల్</span>
          </div>
          <div className="flex flex-col items-center p-2">
            <TrendingUp className="h-6 w-6 text-purple-400 mb-1" />
            <span className="text-base font-extrabold text-white sm:text-lg">High Income</span>
            <span className="text-xs text-slate-400">ప్రతి నెలా ఆదాయం</span>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------- */}
      {/* Features Grid                                                              */}
      {/* -------------------------------------------------------------------------- */}
      <section className="relative z-10 border-t border-white/10 bg-slate-900/60 py-16 sm:py-24 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xs font-black uppercase tracking-widest text-amber-400">Feature Highlights</h2>
            <p className="mt-2 text-2xl font-black text-white sm:text-4xl">
              మీ ఫ్రాంచైజ్ యాప్ తో వచ్చే ముఖ్యమైన సదుపాయాలు
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Feature 1 */}
            <div className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 backdrop-blur-xl transition hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-500/10">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                <Rocket className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white">100% Ready App</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                యాప్ కోసం కోడ్ అన్నీ రెడీ. మీకు కేవలం మార్కెటింగ్ చేయాలి.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 backdrop-blur-xl transition hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-500/10">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <Globe className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white">Your Own Brand</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                మీ సొంత డొమైన్ (ఉదా: warangalapp.in), మీ లోగో, మీ కలర్స్.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 backdrop-blur-xl transition hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-500/10">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white">Admin Panel</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                మీకు పూర్తి సూపర్ అడ్మిన్ పానెల్ అధికారం ఉంటుంది.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 backdrop-blur-xl transition hover:border-amber-400/50 hover:shadow-2xl hover:shadow-amber-500/10">
              <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-white">Local Listings</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                మీ ఊరి షాపులు, హాస్పిటల్స్, రియల్ ఎస్టేట్ అన్నీ ఒకేచోట.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------- */}
      {/* Earning Potential Section                                                  */}
      {/* -------------------------------------------------------------------------- */}
      <section className="relative z-10 py-16 sm:py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-blue-600/10 to-slate-900 p-6 sm:p-10 backdrop-blur-2xl shadow-2xl">
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-400/20 px-3 py-1 text-xs font-black uppercase text-amber-300 border border-amber-400/30">
                <Crown className="h-3.5 w-3.5" /> High Monthly Earnings
              </span>
              <h2 className="mt-3 text-2xl font-black text-white sm:text-4xl">
                మీరు ఎలా సంపాదిస్తారు?
              </h2>
              <p className="mt-2 text-sm font-medium text-slate-300 sm:text-base">
                వివిధ మార్గాల ద్వారా మీ ఊరిలో ప్రతి నెలా స్థిరమైన ఆదాయం పొందండి.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-base">బిజినెస్ లిస్టింగ్ ఫీజులు</h4>
                  <p className="text-xs text-slate-300 mt-1">మీ ఊరి లోకల్ వ్యాపారుల నుండి వార్షిక లిస్టింగ్ & వెరిఫైడ్ బ్యాడ్జ్ రుసుము.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-base">బ్యానర్ & స్టోరీ యాడ్స్ (₹99/day)</h4>
                  <p className="text-xs text-slate-300 mt-1">హోమ్‌పేజీ హెడర్ బ్యానర్లు & 24 గంటల స్టోరీ ప్రమోషన్ల ద్వారా రోజువారీ ఆదాయం.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-base">ప్రీమియం సబ్స్క్రిప్షన్స్</h4>
                  <p className="text-xs text-slate-300 mt-1">షాపులు, డాక్టర్లు, సర్వీస్ ప్రొవైడర్లకు టాప్ పొజిషన్ సబ్‌స్క్రిప్షన్ ప్లాన్స్.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <CheckCircle2 className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white text-base">రియల్ ఎస్టేట్ ప్లాన్స్ & లీడ్స్</h4>
                  <p className="text-xs text-slate-300 mt-1">ప్లాట్లు, ఇళ్ళు అమ్మే స్థానిక బ్రోకర్లు & బిల్డర్ల నుండి కమీషన్ మరియు ప్రమోషన్స్.</p>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3.5 text-sm font-black text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-400 active:scale-95"
              >
                <MessageCircle className="h-5 w-5 fill-slate-950 text-emerald-500" />
                ఫ్రాంచైజ్ ప్లాన్ల వివరాల కోసం వాట్సాప్ చేయండి
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------- */}
      {/* FAQ Section                                                                */}
      {/* -------------------------------------------------------------------------- */}
      <section className="relative z-10 border-t border-white/10 bg-slate-900/40 py-16 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="text-center mb-10">
            <HelpCircle className="mx-auto h-8 w-8 text-amber-400" />
            <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">తరచుగా అడిగే ప్రశ్నలు (FAQ)</h2>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <h3 className="font-bold text-white text-base">1. నాకు కోడింగ్ లేదా సాంకేతిక పరిజ్ఞానం అవసరమా?</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                అవసరం లేదు! సాంకేతికత, కోడింగ్, సర్వర్ల నిర్వహణ మరియు అప్‌డేట్‌లు అన్నీ మేమే చూసుకుంటాం. మీరు కేవలం మీ టౌన్‌లో ప్రచారం చేసి బిజినెస్‌లు జాయిన్ చేస్తే చాలు.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <h3 className="font-bold text-white text-base">2. యాప్ లైవ్ కావడానికి ఎంత సమయం పడుతుంది?</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                మీరు వివరాలు నమోదు చేసిన 24 నుండి 48 గంటల్లో మీ సొంత డొమైన్‌పై యాప్ సంపూర్ణంగా లైవ్ అవుతుంది.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <h3 className="font-bold text-white text-base">3. నేను నా సొంత డొమైన్ (ఉదా: warangalapp.in) వాడొచ్చా?</h3>
              <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                అవును! మీ ఊరి పేరుతో ఉన్న ఎలాంటి డొమైన్‌నైనా మీ సూపర్ యాప్‌కి సులభంగా కనెక్ట్ చేయవచ్చు.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------- */}
      {/* Final Conversion CTA Section                                               */}
      {/* -------------------------------------------------------------------------- */}
      <section className="relative z-10 border-t border-white/10 py-16 sm:py-24 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl leading-tight">
            ఇంకా ఆలస్యం ఎందుకు? <br />
            <span className="bg-gradient-to-r from-emerald-400 to-amber-300 bg-clip-text text-transparent">
              మీ ఊరిని డిజిటల్ గా మార్చండి!
            </span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-300 sm:text-lg">
            ఈరోజే ప్రారంభించండి. మీ టౌన్ కి డిజిటల్ లీడర్ గా మారి స్వయం ఉపాధి మరియు నిలకడైన ఆదాయం పొందండి.
          </p>
          <div className="mt-8 flex justify-center">
            <a
              href={WHATSAPP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-8 py-4 text-lg font-black text-slate-950 shadow-xl shadow-emerald-500/30 transition hover:bg-emerald-400 active:scale-95"
            >
              <MessageCircle className="h-6 w-6 fill-slate-950 text-emerald-500 transition group-hover:scale-110" />
              <span>ఇప్పుడే వాట్సాప్ లో మాట్లాడండి</span>
              <ChevronRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------------- */}
      {/* Premium Standalone Franchise Footer                                       */}
      {/* -------------------------------------------------------------------------- */}
      <footer className="border-t border-white/10 bg-slate-950 py-12 text-slate-400">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {/* 1. PAGES */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-amber-400">PAGES</h4>
              <ul className="space-y-2 text-sm font-medium">
                <li>
                  <Link href="/" className="hover:text-amber-300 transition-colors">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/listings" className="hover:text-amber-300 transition-colors">
                    Listings
                  </Link>
                </li>
              </ul>
            </div>

            {/* 2. COMPANY */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-amber-400">COMPANY</h4>
              <ul className="space-y-2 text-sm font-medium">
                <li>
                  <Link href="/about" className="hover:text-amber-300 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <a
                    href={WHATSAPP_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-amber-300 transition-colors"
                  >
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>

            {/* 3. CONTACT */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-amber-400">CONTACT</h4>
              <ul className="space-y-2.5 text-sm font-medium">
                <li className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Choutuppal, Telangana 508252</span>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-amber-400 shrink-0" />
                  <a href="tel:9441348175" className="hover:text-amber-300 transition-colors">
                    +91 9441348175
                  </a>
                </li>
              </ul>
            </div>

            {/* 4. CONNECT WITH US */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-widest text-amber-400">CONNECT WITH US</h4>
              <div className="pt-1">
                <SocialLinks />
              </div>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p>© {new Date().getFullYear()} Choutuppal App Franchise. All rights reserved.</p>
            <p className="text-slate-400 font-medium">Powered by White-Label Super App Engine</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
