import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy | Choutuppal App',
  description: 'Privacy policy for the Choutuppal App.',
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50 pb-24 md:pb-10">
      <header className="sticky top-0 z-30 border-b border-white/50 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-3 sm:px-4">
          <Link href="/" className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-base font-black text-white">C</Link>
          <h1 className="text-sm font-extrabold text-slate-900">Privacy Policy</h1>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-3 py-8 sm:px-4">
        <div className="rounded-3xl glass p-8">
          <h1 className="text-xl font-black text-slate-900">Privacy Policy</h1>
          <p className="mt-1 text-xs text-slate-400">Last updated: {new Date().getFullYear()}</p>

          <div className="mt-5 space-y-4 text-sm leading-relaxed text-slate-600">
            <section>
              <h2 className="font-bold text-slate-900">1. Information We Collect</h2>
              <p className="mt-1">We collect your name, email/phone, username, profile photo, and any content you post (listings, stories, banners, community posts).</p>
            </section>
            <section>
              <h2 className="font-bold text-slate-900">2. How We Use Your Information</h2>
              <p className="mt-1">Your information is used to display your listings, connect you with customers, and provide analytics. We do not sell your data to third parties.</p>
            </section>
            <section>
              <h2 className="font-bold text-slate-900">3. Media Storage</h2>
              <p className="mt-1">All uploaded images and videos are stored on Cloudflare R2. Images are compressed to ~500KB before upload. Stories and Banners are automatically deleted after 24 hours.</p>
            </section>
            <section>
              <h2 className="font-bold text-slate-900">4. Profile Visibility</h2>
              <p className="mt-1">You can control your profile visibility (Public/Private) from the dashboard. Only public profiles appear in the community feed.</p>
            </section>
            <section>
              <h2 className="font-bold text-slate-900">5. Cookies & Authentication</h2>
              <p className="mt-1">We use secure JWT cookies for authentication. We do not use third-party tracking cookies except Google Analytics (if enabled by admin).</p>
            </section>
            <section>
              <h2 className="font-bold text-slate-900">6. Data Deletion</h2>
              <p className="mt-1">You can delete your listings, stories, and community posts at any time. Account deletion requests can be sent to 9912353705.</p>
            </section>
            <section>
              <h2 className="font-bold text-slate-900">7. Contact</h2>
              <p className="mt-1">For privacy concerns, contact: MSOIN MD, Choutuppal, Yadadri, Telangana - 508252. Phone: 9912353705.</p>
            </section>
          </div>

          <Link href="/" className="mt-6 inline-block rounded-xl gradient-brand px-4 py-2 text-sm font-semibold text-white">Back to Home</Link>
        </div>
      </main>
    </div>
  )
}
