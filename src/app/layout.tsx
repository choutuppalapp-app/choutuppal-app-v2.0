import Image from 'next/image';
export const revalidate = 3600;
// AdSense Update Force
import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import { Geist, Geist_Mono, Noto_Sans_Telugu } from 'next/font/google'
import Script from 'next/script'
import { Suspense } from 'react'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from 'sonner'
import { Providers } from '@/components/providers'
import { PwaInstallPrompt } from '@/components/home/pwa-install-prompt'
import { SiteHeader } from '@/components/home/site-header'
import { SiteFooter } from '@/components/home/site-footer'
import { BottomNav } from '@/components/home/bottom-nav'
import { WhatsAppFloat } from '@/components/home/whatsapp-float'
import { MetaPixel } from '@/components/analytics/meta-pixel'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
  display: 'swap',
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
})

const notoTelugu = Noto_Sans_Telugu({
  variable: '--font-noto-telugu',
  subsets: ['telugu'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const SITE_URL = process.env.NEXTAUTH_URL ?? 'https://choutuppal.in'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Choutuppal App v2.0 — Business, Real Estate & Community',
    template: '%s | Choutuppal App',
  },
  description:
    'Discover businesses, services, real estate, news and community in Choutuppal, Yadadri Bhuvanagiri, Telangana. Promote your business, list properties, and connect locally.',
  keywords: [
    'Choutuppal',
    'Yadadri',
    'Telangana business',
    'real estate Choutuppal',
    'local services',
    'community',
  ],
  authors: [{ name: 'Choutuppal App Team' }],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/logo-pwa.webp',
    apple: '/logo-pwa.webp',
  },
  openGraph: {
    title: 'Choutuppal App v2.0 — Business, Real Estate & Community',
    description:
      'Businesses, services, real estate, news & community for Choutuppal, Yadadri, Telangana.',
    url: SITE_URL,
    siteName: 'Choutuppal App',
    images: [
      {
        url: `${SITE_URL}/logo-pwa.webp`,
        width: 1200,
        height: 630,
        alt: 'Choutuppal App v2.0',
      },
    ],
    type: 'website',
    locale: 'te_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Choutuppal App v2.0',
    description:
      'Businesses, services, real estate, news & community for Choutuppal, Yadadri, Telangana.',
    images: [`${SITE_URL}/logo-pwa.webp`],
  },
  verification: {
    other: {
      'google-adsense-account': 'ca-pub-1914892456105863',
    },
  },
}

import { getCurrentTenant, DEFAULT_TENANT } from '@/lib/tenant'
import { Phone, AlertTriangle } from 'lucide-react'
import { DelayedScripts } from '@/components/analytics/delayed-scripts'

export const viewport: Viewport = {
  themeColor: '#1d4ed8',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const pathname = headersList.get('x-pathname') || headersList.get('next-url') || ''
  const isFranchise = host.includes('franchise.choutuppal.in')

  const hideGlobalChrome =
    isFranchise ||
    pathname.startsWith('/franchise')

  const tenant = await getCurrentTenant()
  const isExpired = tenant.id !== DEFAULT_TENANT.id && tenant.subscriptionStatus === 'EXPIRED'

  const rawGa = process.env.NEXT_PUBLIC_GA4_ID?.trim()
  const gaId = rawGa && !rawGa.includes('XXXXX') && rawGa.length > 5 ? rawGa : null

  const rawFb = (process.env.NEXT_PUBLIC_META_PIXEL_ID || process.env.NEXT_PUBLIC_FB_PIXEL_ID || '1644414366433411').trim()
  const fbPixelId = rawFb && !rawFb.includes('XXXXX') && rawFb.length > 5 ? rawFb : '1644414366433411'

  return (
    <html lang="te" suppressHydrationWarning>
      <head>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoTelugu.variable} antialiased`}
      >
        {/* @ts-ignore */}
        <amp-auto-ads type="adsense" data-ad-client="ca-pub-1914892456105863"></amp-auto-ads>
        <Providers>
          {gaId ? (
            <>
              <Suspense fallback={null}>
                <MetaPixel pixelId={fbPixelId} />
              </Suspense>
            </>
          ) : null}

          <DelayedScripts gaId={gaId} fbPixelId={fbPixelId} />

          {isExpired ? (
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 p-6 text-center text-white">
              <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h1 className="text-2xl font-black sm:text-3xl">{tenant.name} — Subscription Expired</h1>
              <p className="mt-3 max-w-md text-sm text-slate-300">
                ఈ సిటీ యాప్ సబ్‌స్క్రిప్షన్ గడువు ముగిసింది. సేవల పునరుద్ధరణకు దయచేసి అడ్మిన్‌ను సంప్రదించండి.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <a
                  href={`tel:${tenant.adminPhone}`}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-blue-700"
                >
                  <Phone className="h-4 w-4" /> Call Admin ({tenant.adminPhone})
                </a>
                <a
                  href={`https://wa.me/91${tenant.adminPhone.replace(/\D/g, '')}?text=Subscription%20renewal%20request%20for%20${encodeURIComponent(tenant.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg hover:bg-emerald-700"
                >
                  WhatsApp Admin
                </a>
              </div>
            </div>
          ) : hideGlobalChrome ? (
            children
          ) : (
            <>
              <SiteHeader tenant={tenant} />
              <div className="pb-20 md:pb-0">
                {children}
              </div>
              <SiteFooter tenant={tenant} />
              <BottomNav />
              <WhatsAppFloat tenant={tenant} />
              <PwaInstallPrompt />
            </>
          )}

          <Toaster />
          <SonnerToaster position="top-center" richColors closeButton />
        </Providers>
      </body>
    </html>
  )
}
