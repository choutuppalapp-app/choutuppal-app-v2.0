import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms & Conditions | Choutuppal App',
  description: 'Terms and conditions for using the Choutuppal App.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-24 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-3 sm:px-4">
          <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-base font-black text-white">C</Link>
          <h1 className="text-sm font-extrabold text-slate-900">Terms & Conditions</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-3 py-8 sm:px-4">
        <div className="rounded-3xl glass p-8">
          <h1 className="text-xl font-black text-slate-900">Terms & Conditions</h1>
          <p className="mt-1 text-xs text-slate-400">Last updated: {new Date().getFullYear()}</p>

          <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-600">
            <section>
              <h2 className="font-bold text-slate-900">1. Acceptance of Terms</h2>
              <p className="mt-1">By using the Choutuppal App, you agree to these Terms & Conditions. If you do not agree, please do not use the app.</p>
            </section>
            <section>
              <h2 className="font-bold text-slate-900">2. User Accounts</h2>
              <p className="mt-1">You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration.</p>
            </section>
            <section>
              <h2 className="font-bold text-slate-900">3. Listings & Content</h2>
              <p className="mt-1">All business listings, real estate posts, stories, banners, and community posts must be accurate and lawful. The admin reserves the right to approve, reject, or remove any content.</p>
            </section>
            <section>
              <h2 className="font-bold text-slate-900">4. Stories & Banners</h2>
              <p className="mt-1">Stories and Banners auto-expire after 24 hours. Media is automatically deleted from our servers after expiry.</p>
            </section>
            <section>
              <h2 className="font-bold text-slate-900">5. Prohibited Content</h2>
              <p className="mt-1">Spam, illegal content, hate speech, and misleading information are strictly prohibited. Violators will be banned.</p>
            </section>
            <section>
              <h2 className="font-bold text-slate-900">6. Limitation of Liability</h2>
              <p className="mt-1">The app is provided &quot;as is&quot;. We are not liable for any damages arising from the use of this platform or transactions between users.</p>
            </section>
            <section>
              <h2 className="font-bold text-slate-900">7. Contact</h2>
              <p className="mt-1">For questions about these terms, contact: Choutuppal, Yadadri, Telangana - 508252. Phone: 9441348175.</p>
            </section>
          </div>

          <Link href="/" className="mt-6 inline-block rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-white">Back to Home</Link>
        </div>
      </main>
    </div>
  )
}
