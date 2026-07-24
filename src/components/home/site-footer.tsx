import Link from 'next/link'
import { MapPin, Phone, MessageCircle, Mail, Facebook, Instagram, Youtube, Send } from 'lucide-react'

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Column 1 — Pages */}
          <div>
            <div className="mb-3 flex items-center gap-2">
              <img src="/logo.png" alt="Choutuppal App" className="h-10 w-auto" />
            </div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-900">
              Pages
            </h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-slate-500 transition hover:text-blue-600">Home</Link></li>
              <li><Link href="/news" className="text-sm text-slate-500 transition hover:text-blue-600">News</Link></li>
              <li><Link href="/blog" className="text-sm text-slate-500 transition hover:text-blue-600">Blog</Link></li>
              <li><Link href="/community" className="text-sm text-slate-500 transition hover:text-blue-600">Community</Link></li>
            </ul>
          </div>

          {/* Column 2 — Company */}
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-900">
              Company
            </h4>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-sm text-slate-500 transition hover:text-blue-600">About Us</Link></li>
              <li><Link href="/terms" className="text-sm text-slate-500 transition hover:text-blue-600">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy" className="text-sm text-slate-500 transition hover:text-blue-600">Privacy Policy</Link></li>
              <li><Link href="/login" className="text-sm text-slate-500 transition hover:text-blue-600">Login / Sign Up</Link></li>
            </ul>
            <div className="mt-4 flex gap-2">
              {[Facebook, Instagram, Youtube, Send].map((Icon, i) => (
                <a
                  key={i}
                  href="https://wa.me/919441348175"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Social link"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:text-blue-600"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 3 — Contact */}
          <div>
            <h4 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-900">
              Contact
            </h4>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <span className="font-telugu">
                  చౌటుప్పల్, యాదాద్రి, తెలంగాణ - 508252.
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-amber-500" />
                <a href="tel:9441348175" className="font-semibold text-slate-700 hover:text-blue-600">
                  9441348175
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 shrink-0 text-green-500" />
                <a
                  href="https://wa.me/919441348175"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-700 hover:text-green-600"
                >
                  9441348175
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-blue-500" />
                <a href="mailto:info@choutuppal.in" className="font-semibold text-slate-700 hover:text-blue-600">
                  info@choutuppal.in
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-5 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>
            Powered by <span className="font-semibold text-slate-700">Choutuppal App</span>,
            Choutuppal, Yadadri, Telangana, 508252.
          </p>
          <p>© {new Date().getFullYear()} Choutuppal App v2.0. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
