import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono, Noto_Sans_Telugu } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import { PwaInstallPrompt } from '@/components/home/pwa-install-prompt'
import { SiteHeader } from '@/components/home/site-header'
import { BottomNav } from '@/components/home/bottom-nav'
import { WhatsAppFloat } from '@/components/home/whatsapp-float'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const notoTelugu = Noto_Sans_Telugu({
  variable: '--font-noto-telugu',
  subsets: ['telugu'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const SITE_URL = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'

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
  authors: [{ name: 'Choutuppal' }],
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'Choutuppal App v2.0',
    description:
      'Businesses, services, real estate, news & community for Choutuppal, Yadadri, Telangana.',
    url: SITE_URL,
    siteName: 'Choutuppal App',
    type: 'website',
    locale: 'te_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Choutuppal App v2.0',
    description:
      'Businesses, services, real estate, news & community for Choutuppal, Yadadri, Telangana.',
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
  return (
    <html lang="te" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${notoTelugu.variable} antialiased`}
      >
        <SiteHeader />
        <div className="pb-20 md:pb-0">
          {children}
        </div>
        <BottomNav />
        <WhatsAppFloat />
        <PwaInstallPrompt />
        <Toaster />
        <SonnerToaster position="top-center" richColors closeButton />
      </body>
    </html>
  )
}
