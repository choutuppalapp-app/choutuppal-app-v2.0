import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Noto_Sans_Telugu } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { Providers } from '@/components/providers'
import { PwaInstallPrompt } from '@/components/home/pwa-install-prompt'
import { SiteHeader } from '@/components/home/site-header'
import { BottomNav } from '@/components/home/bottom-nav'
import { WhatsAppFloat } from '@/components/home/whatsapp-float'

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
    icon: '/logo-pwa.png',
    apple: '/logo-pwa.png',
  },
  openGraph: {
    title: 'Choutuppal App v2.0 — Business, Real Estate & Community',
    description:
      'Businesses, services, real estate, news & community for Choutuppal, Yadadri, Telangana.',
    url: SITE_URL,
    siteName: 'Choutuppal App',
    images: [
      {
        url: `${SITE_URL}/logo-pwa.png`,
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
    images: [`${SITE_URL}/logo-pwa.png`],
  },
}

export const viewport: Viewport = {
  themeColor: '#1d4ed8',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const rawGa = process.env.NEXT_PUBLIC_GA4_ID?.trim()
  const gaId = rawGa && !rawGa.includes('XXXXX') && rawGa.length > 5 ? rawGa : null

  const rawFb = process.env.NEXT_PUBLIC_FB_PIXEL_ID?.trim()
  const fbPixelId = rawFb && !rawFb.includes('XXXXX') && rawFb.length > 5 ? rawFb : null

  return (
    <html lang="te" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoTelugu.variable} antialiased`}
      >
        <Providers>
          {gaId ? (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
                strategy="lazyOnload"
              />
              <Script id="google-analytics" strategy="lazyOnload">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${gaId}', {
                    page_path: window.location.pathname,
                  });
                `}
              </Script>
            </>
          ) : null}

          {fbPixelId ? (
            <Script id="fb-pixel" strategy="lazyOnload">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${fbPixelId}');
                fbq('track', 'PageView');
              `}
            </Script>
          ) : null}

          <SiteHeader />
          <div className="pb-20 md:pb-0">
            {children}
          </div>
          <BottomNav />
          <WhatsAppFloat />
          <PwaInstallPrompt />
          <Toaster />
          <SonnerToaster position="top-center" richColors closeButton />
        </Providers>
      </body>
    </html>
  )
}
