import Link from 'next/link'
import { MapPin, Phone, Facebook, Instagram, Youtube, Send } from 'lucide-react'

const LINKS = [
  { label: 'News', href: '/?cat=news' },
  { label: 'Blog', href: '/?cat=blogs' },
  { label: 'Community', href: '/?cat=community' },
  { label: 'List Business', href: '/login' },
  { label: 'Pricing', href: '/#pricing' },
]

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-lg font-black text-white shadow">
                C
              </span>
              <span className="font-extrabold tracking-tight text-slate-900">
                Choutuppal App
              </span>
            </div>
            <p className="mt-3 max-w-xs text-sm text-slate-500">
              The local marketplace & community platform for Choutuppal and
              nearby villages in Yadadri Bhuvanagiri, Telangana.
            </p>
            <div className="mt-4 flex gap-2">
              {[Facebook, Instagram, Youtube, Send].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="social link"
                  className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-300 hover:text-blue-600"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900">
              Quick Links
            </h4>
            <ul className="mt-3 space-y-2">
              {LINKS.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-slate-500 transition hover:text-blue-600"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wide text-slate-900">
              Contact
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <span>
                  MSOIN MD, Choutuppal, Yadadri,
                  <br />
                  Telangana, 508252
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-amber-500" />
                <a href="tel:9912353705" className="font-semibold text-slate-700 hover:text-blue-600">
                  9912353705
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-slate-200 pt-5 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <p>
            Powered by <span className="font-semibold text-slate-700">MSOIN MD</span>,
            Choutuppal, Yadadri, Telangana, 508252.
          </p>
          <p>© {new Date().getFullYear()} Choutuppal App v2.0. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
