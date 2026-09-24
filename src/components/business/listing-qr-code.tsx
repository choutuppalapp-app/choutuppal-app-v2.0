'use client'

import { useState, useRef, useEffect } from 'react'
import { QRCodeSVG, QRCodeCanvas } from 'qrcode.react'
import {
  QrCode,
  Download,
  Share2,
  Copy,
  Check,
  Smartphone,
  Printer,
  Sparkles,
  ExternalLink,
  Store,
  BadgeCheck,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ListingQrCodeProps {
  listingId: string
  slug: string
  title: string
  categoryName?: string | null
  villageName?: string | null
  logoUrl?: string | null
  phone?: string | null
  variant?: 'button' | 'card' | 'inline'
  className?: string
}

export function ListingQrCodeModal({
  listingId,
  slug,
  title,
  categoryName,
  villageName,
  logoUrl,
  phone,
  variant = 'button',
  className = '',
}: ListingQrCodeProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [targetUrl, setTargetUrl] = useState('')
  const canvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.choutuppal.in'
    setTargetUrl(`${origin}/listings/${slug || listingId}`)
  }, [slug, listingId])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl)
      setCopied(true)
      toast.success('Listing URL copied to clipboard!')
      setTimeout(() => setCopied(false), 2500)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${title} - Choutuppal App`,
          text: `Scan or visit ${title} (${villageName || 'Choutuppal'}) on Choutuppal Super App:`,
          url: targetUrl,
        })
      } catch (err) {
        // user cancelled or share failed
      }
    } else {
      handleCopyLink()
    }
  }

  const handleDownloadQr = () => {
    try {
      const canvas = canvasRef.current?.querySelector('canvas')
      if (!canvas) {
        toast.error('QR code canvas not ready')
        return
      }

      // Create a composite branded canvas for high-quality printing
      const printCanvas = document.createElement('canvas')
      const ctx = printCanvas.getContext('2d')
      if (!ctx) return

      const scale = 2
      const width = 600
      const height = 800
      printCanvas.width = width * scale
      printCanvas.height = height * scale
      ctx.scale(scale, scale)

      // Background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)

      // Header background gradient
      const gradient = ctx.createLinearGradient(0, 0, width, 140)
      gradient.addColorStop(0, '#1e3a8a') // blue-900
      gradient.addColorStop(1, '#0f172a') // slate-900
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, width, 140)

      // Header Text
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 22px system-ui, -apple-system, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('CHOUTUPPAL SUPER APP', width / 2, 45)

      ctx.fillStyle = '#93c5fd'
      ctx.font = '14px system-ui, -apple-system, sans-serif'
      ctx.fillText('Official Verified Business QR', width / 2, 75)

      // Business Title
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 26px system-ui, -apple-system, sans-serif'
      ctx.fillText(title.length > 28 ? title.slice(0, 28) + '...' : title, width / 2, 190)

      // Subtitle (Village & Category)
      ctx.fillStyle = '#64748b'
      ctx.font = '15px system-ui, -apple-system, sans-serif'
      const sub = [categoryName, villageName].filter(Boolean).join(' • ')
      ctx.fillText(sub || 'Choutuppal Directory', width / 2, 220)

      // Border frame for QR
      ctx.fillStyle = '#f8fafc'
      ctx.strokeStyle = '#e2e8f0'
      ctx.lineWidth = 2
      if (typeof ctx.roundRect === 'function') {
        ctx.roundRect(120, 260, 360, 360, 24)
      } else {
        ctx.rect(120, 260, 360, 360)
      }
      ctx.fill()
      ctx.stroke()

      // Draw QR Canvas in center
      ctx.drawImage(canvas, 150, 290, 300, 300)

      // Scan instruction
      ctx.fillStyle = '#1e3a8a'
      ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
      ctx.fillText('Scan with Phone Camera or Google Lens', width / 2, 660)

      ctx.fillStyle = '#64748b'
      ctx.font = '13px system-ui, -apple-system, sans-serif'
      ctx.fillText('to view contact, services, offers & directions', width / 2, 688)

      // Footer
      ctx.fillStyle = '#0284c7'
      ctx.font = 'bold 14px system-ui, -apple-system, sans-serif'
      ctx.fillText('www.choutuppal.in', width / 2, 750)

      // Trigger download
      const dataUrl = printCanvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-qr-code.png`
      link.href = dataUrl
      link.click()

      toast.success('High-resolution QR code downloaded!')
    } catch (err) {
      console.error('QR Download Error:', err)
      toast.error('Failed to download QR image')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {variant === 'button' ? (
            <Button
              variant="outline"
              size="sm"
              className={`gap-1.5 rounded-xl border-slate-200 bg-white/90 font-bold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-blue-600 transition ${className}`}
            >
              <QrCode className="h-4 w-4 text-blue-600" />
              <span>QR Code</span>
            </Button>
          ) : variant === 'card' ? (
            <div
              className={`group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50/40 p-4 shadow-xs transition hover:border-blue-300 hover:shadow-md ${className}`}
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition">
                    Shop QR Code
                  </h4>
                  <p className="text-xs text-slate-500">
                    Scan on mobile or download printable standee
                  </p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-xs font-bold text-blue-600">
                View
              </Button>
            </div>
          ) : (
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 ${className}`}
            >
              <QrCode className="h-3.5 w-3.5" />
              QR Code
            </button>
          )}
        </DialogTrigger>

        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-bold text-blue-300 border border-blue-400/30 mb-2">
                <Sparkles className="h-3 w-3" /> Choutuppal Instant QR
              </span>
              <DialogTitle className="text-xl font-black text-white">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300 mt-1">
                {[categoryName, villageName].filter(Boolean).join(' • ') || 'Verified Local Business'}
              </DialogDescription>
            </div>
          </div>

          {/* QR Container */}
          <div className="p-6 flex flex-col items-center">
            <div
              ref={canvasRef}
              className="relative p-5 rounded-3xl border-2 border-slate-100 bg-white shadow-lg flex flex-col items-center justify-center transition-transform hover:scale-[1.02]"
            >
              <QRCodeCanvas
                value={targetUrl || 'https://www.choutuppal.in'}
                size={220}
                level="H"
                includeMargin={false}
                imageSettings={
                  logoUrl
                    ? {
                        src: logoUrl,
                        x: undefined,
                        y: undefined,
                        height: 38,
                        width: 38,
                        excavate: true,
                      }
                    : undefined
                }
              />

              <div className="mt-4 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                <Smartphone className="h-3.5 w-3.5 text-blue-600" />
                Scan with any QR scanner / Camera
              </div>
            </div>

            {/* Quick URL Box */}
            <div className="mt-5 w-full flex items-center gap-2 rounded-2xl bg-slate-50 p-2 border border-slate-200">
              <span className="truncate font-mono text-xs text-slate-600 pl-2 flex-1">
                {targetUrl}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCopyLink}
                className="h-8 rounded-xl text-xs font-bold gap-1 shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy
                  </>
                )}
              </Button>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 grid grid-cols-2 gap-3 w-full">
              <Button
                onClick={handleDownloadQr}
                className="h-11 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition"
              >
                <Download className="h-4 w-4" />
                Download Standee PNG
              </Button>

              <Button
                onClick={handleShare}
                variant="outline"
                className="h-11 rounded-2xl border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition"
              >
                <Share2 className="h-4 w-4 text-emerald-600" />
                Share on WhatsApp
              </Button>
            </div>

            <p className="mt-4 text-[11px] text-center text-slate-400">
              Shop owners: Print this QR code and paste it on your billing counter so visiting customers can open your profile, save your contact, and order directly.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
