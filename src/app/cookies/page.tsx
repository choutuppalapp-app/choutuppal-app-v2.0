import type { Metadata } from 'next'
import Link from 'next/link'
import { Cookie, ShieldCheck, Info, CheckCircle2, ChevronLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Cookie Policy | Choutuppal App',
  description: 'Learn how Choutuppal App uses cookies, local storage, and caching to provide a fast and secure experience.',
}

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-24 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-3 sm:px-4">
          <Link
            href="/"
            className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 bg-white shadow-xs transition hover:bg-slate-50"
            aria-label="Back to Home"
          >
            <ChevronLeft className="h-4 w-4 text-slate-700" />
          </Link>
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-base font-black text-white">
            C
          </span>
          <h1 className="text-sm font-extrabold text-slate-900">Cookie Policy</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-3 py-8 sm:px-4">
        <div className="rounded-3xl glass p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-600 shadow-xs">
              <Cookie className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 sm:text-2xl">Cookie &amp; Storage Policy</h1>
              <p className="text-xs text-slate-500 font-medium">చిరునామా మరియు కుకీ విధానం · Updated {new Date().getFullYear()}</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            చౌటుప్పల్ యాప్ (Choutuppal App) మీకు వేగవంతమైన మరియు అనుకూలమైన అనుభవాన్ని అందించడానికి కుకీలు (Cookies), లోకల్ స్టోరేజ్ (Local Storage) మరియు క్యాషింగ్ (Offline Caching) టెక్నాలజీలను ఉపయోగిస్తుంది.
          </p>

          <div className="mt-6 space-y-6 text-sm leading-relaxed text-slate-600">
            <section className="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-blue-600" />
                <h2>1. What Are Cookies &amp; Local Caching? (కుకీలు అంటే ఏమిటి?)</h2>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-slate-600">
                Cookies are tiny text files stored in your browser or phone that remember your preferences, secure your login session, and allow pages to load almost instantly without reloading all assets every single time.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-bold text-slate-900 text-base">2. Categories of Cookies We Use (మేము ఉపయోగించే కుకీలు)</h2>
              
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <span>Essential &amp; Security Cookies</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Required for authentication, session protection, security tokens, and account access. These cannot be turned off.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                    <CheckCircle2 className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Speed &amp; Cache Storage (PWA)</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Saves application layouts, fonts, and static assets in phone cache so individual listings and menus open instantly.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                    <CheckCircle2 className="h-4 w-4 text-amber-600 shrink-0" />
                    <span>User Preferences</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Remembers your selected village/ward filters, categories, theme preferences, and daily spin rewards.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-4 shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                    <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span>Performance Analytics</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-500">
                    Helps us understand listing view counts and optimize slow networks for rural and suburban 4G/5G users.
                  </p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200/80 bg-white/70 p-4">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Info className="h-4 w-4 text-amber-600" />
                <h2>3. Phone Caching &amp; Offline Experience (ఫోన్ లో క్యాష్ సేవ్ అవ్వడం)</h2>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-slate-600">
                Choutuppal App utilizes modern Service Workers and Web Application Cache. Once you visit the site, core resources and listing templates are securely cached in your device’s browser storage. This ensures:
              </p>
              <ul className="mt-2 list-disc list-inside space-y-1 text-xs sm:text-sm text-slate-600 pl-1">
                <li>Immediate opening of individual listings with zero wait time.</li>
                <li>Reduced mobile data consumption on mobile networks.</li>
                <li>Quick access even under low connectivity or fluctuating network conditions.</li>
              </ul>
            </section>

            <section>
              <h2 className="font-bold text-slate-900">4. How to Manage or Clear Cookies (కుకీలను ఎలా క్లియర్ చేయాలి?)</h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
                You can configure your browser (Chrome, Safari, Firefox, Edge) to reject or clear cookies at any time via your browser Settings &gt; Privacy and Security &gt; Clear Browsing Data. Note that disabling essential cookies may require you to log in repeatedly.
              </p>
            </section>

            <section>
              <h2 className="font-bold text-slate-900">5. Contact &amp; Assistance</h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
                If you have questions about our cookie usage or caching mechanisms, please reach out to us at{' '}
                <a href="mailto:info@choutuppal.in" className="font-semibold text-blue-600 hover:underline">
                  info@choutuppal.in
                </a>{' '}
                or call{' '}
                <a href="tel:9494348175" className="font-semibold text-blue-600 hover:underline">
                  +91 94943 48175
                </a>.
              </p>
            </section>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/"
              className="rounded-xl gradient-brand px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm hover:opacity-90"
            >
              Back to Home
            </Link>
            <Link
              href="/privacy"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Privacy Policy
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
