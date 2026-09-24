'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
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
  MessageCircle,
  FileImage,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  PhoneCall,
  MapPin,
  Send,
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

export interface ListingQrCodeProps {
  listingId: string
  slug: string
  title: string
  categoryName?: string | null
  villageName?: string | null
  logoUrl?: string | null
  phone?: string | null
  variant?: 'button' | 'card' | 'inline' | 'icon'
  className?: string
}

/**
 * Generates a high-resolution, print-ready branded merchant standee poster
 */
function createBrandedStandeeCanvas(
  sourceCanvas: HTMLCanvasElement,
  title: string,
  categoryName?: string | null,
  villageName?: string | null,
  phone?: string | null
): HTMLCanvasElement {
  const scale = 3 // High resolution 3x scaling for sharp printing
  const width = 600
  const height = 860
  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) return sourceCanvas

  ctx.scale(scale, scale)

  // 1. White Background Base
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  // 2. Outer Decorative Frame & Shadow Border
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 3
  ctx.strokeRect(8, 8, width - 16, height - 16)

  ctx.strokeStyle = '#1e40af'
  ctx.lineWidth = 1
  ctx.strokeRect(14, 14, width - 28, height - 28)

  // 3. Header Hero Bar (Navy & Royal Blue Gradient)
  const headerGrad = ctx.createLinearGradient(0, 0, width, 140)
  headerGrad.addColorStop(0, '#1e3a8a') // Navy Blue
  headerGrad.addColorStop(0.5, '#1d4ed8') // Royal Blue
  headerGrad.addColorStop(1, '#0f172a') // Slate
  ctx.fillStyle = headerGrad
  ctx.fillRect(8, 8, width - 16, 145)

  // 4. Verification Badge Pill
  ctx.fillStyle = 'rgba(255, 255, 255, 0.18)'
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(width / 2 - 150, 24, 300, 28, 14)
    ctx.fill()
  } else {
    ctx.fillRect(width / 2 - 150, 24, 300, 28)
  }

  ctx.fillStyle = '#93c5fd'
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('★ CHOUTUPPAL SUPER APP VERIFIED ★', width / 2, 42)

  // 5. Header Main Title
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 22px system-ui, -apple-system, sans-serif'
  ctx.fillText('OFFICIAL MERCHANT QR CODE', width / 2, 86)

  ctx.fillStyle = '#cbd5e1'
  ctx.font = '13px system-ui, -apple-system, sans-serif'
  ctx.fillText('Scan to View Catalog, Special Offers & Direct WhatsApp', width / 2, 114)

  // 6. Business Name & Category Section
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 24px system-ui, -apple-system, "Noto Sans Telugu", sans-serif'
  const displayTitle = title.length > 34 ? title.slice(0, 34) + '...' : title
  ctx.fillText(displayTitle, width / 2, 195)

  // Meta Subtitle
  const metaParts = [categoryName, villageName || 'Choutuppal', phone ? `Tel: ${phone}` : '']
    .filter(Boolean)
    .join('  •  ')
  ctx.fillStyle = '#475569'
  ctx.font = '600 14px system-ui, -apple-system, "Noto Sans Telugu", sans-serif'
  ctx.fillText(metaParts, width / 2, 224)

  // 7. QR Container Box (Card with rounded corners)
  const qrBoxX = 125
  const qrBoxY = 250
  const qrBoxSize = 350
  ctx.fillStyle = '#f8fafc'
  ctx.strokeStyle = '#cbd5e1'
  ctx.lineWidth = 2
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 24)
    ctx.fill()
    ctx.stroke()
  } else {
    ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize)
    ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize)
  }

  // Draw QR inside
  const qrDrawSize = 290
  const qrDrawX = qrBoxX + (qrBoxSize - qrDrawSize) / 2
  const qrDrawY = qrBoxY + (qrBoxSize - qrDrawSize) / 2
  ctx.drawImage(sourceCanvas, qrDrawX, qrDrawY, qrDrawSize, qrDrawSize)

  // 8. Scanning instruction badge
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
  ctx.fillText('Scan with Any Smartphone Camera or Payment App', width / 2, 642)

  ctx.fillStyle = '#64748b'
  ctx.font = '500 13px system-ui, -apple-system, sans-serif'
  ctx.fillText('Google Lens  •  PhonePe  •  Paytm  •  GPay  •  WhatsApp Camera', width / 2, 668)

  // 9. Verified & Security Tagline
  ctx.fillStyle = '#059669'
  ctx.font = 'bold 14px system-ui, -apple-system, sans-serif'
  ctx.fillText('✓ 100% Verified Local Business Listing in Choutuppal', width / 2, 725)

  // 10. Footer Bar
  ctx.fillStyle = '#f1f5f9'
  ctx.fillRect(8, 775, width - 16, 75)

  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(8, 775)
  ctx.lineTo(width - 8, 775)
  ctx.stroke()

  ctx.fillStyle = '#1e3a8a'
  ctx.font = 'bold 16px system-ui, -apple-system, sans-serif'
  ctx.fillText('www.choutuppal.in', width / 2, 815)

  ctx.fillStyle = '#64748b'
  ctx.font = '11px system-ui, -apple-system, sans-serif'
  ctx.fillText('Connecting Local Citizens & Businesses Across Choutuppal Mandal', width / 2, 834)

  return canvas
}

/**
 * Creates a clean padded QR code canvas
 */
function createCleanQrCanvas(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const scale = 3
  const size = 500
  const canvas = document.createElement('canvas')
  canvas.width = size * scale
  canvas.height = size * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) return sourceCanvas

  ctx.scale(scale, scale)

  // White base with rounded border
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)

  // Padded QR
  const pad = 35
  const qrSize = size - pad * 2
  ctx.drawImage(sourceCanvas, pad, pad, qrSize, qrSize)

  return canvas
}

/**
 * Converts a canvas element to Blob (with fallbacks)
 */
function canvasToBlobAsync(canvas: HTMLCanvasElement, type = 'image/png', quality = 1.0): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof canvas.toBlob === 'function') {
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              // Fallback: convert dataURL to Blob
              try {
                const dataUrl = canvas.toDataURL(type, quality)
                const binary = atob(dataUrl.split(',')[1])
                const array = []
                for (let i = 0; i < binary.length; i++) {
                  array.push(binary.charCodeAt(i))
                }
                resolve(new Blob([new Uint8Array(array)], { type }))
              } catch (err) {
                reject(err)
              }
            }
          },
          type,
          quality
        )
      } else {
        const dataUrl = canvas.toDataURL(type, quality)
        const binary = atob(dataUrl.split(',')[1])
        const array = []
        for (let i = 0; i < binary.length; i++) {
          array.push(binary.charCodeAt(i))
        }
        resolve(new Blob([new Uint8Array(array)], { type }))
      }
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Triggers a cross-browser download of a Blob or DataURL
 */
function triggerBrowserDownload(blobOrUrl: Blob | string, filename: string) {
  let objectUrl: string | null = null
  let href = ''

  if (typeof blobOrUrl === 'string') {
    href = blobOrUrl
  } else {
    objectUrl = URL.createObjectURL(blobOrUrl)
    href = objectUrl
  }

  const link = document.createElement('a')
  link.href = href
  link.download = filename
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()

  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link)
    }
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl)
    }
  }, 2000)
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
  const [activeTab, setActiveTab] = useState<'standee' | 'qr-only'>('standee')
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedImage, setCopiedImage] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [targetUrl, setTargetUrl] = useState('')
  const canvasWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://www.choutuppal.in'
    const cleanSlug = slug || listingId || 'choutuppal'
    setTargetUrl(`${origin}/business/${cleanSlug}`)
  }, [slug, listingId])

  // Get source QR canvas from DOM
  const getSourceCanvas = useCallback((): HTMLCanvasElement | null => {
    if (!canvasWrapperRef.current) return null
    return canvasWrapperRef.current.querySelector('canvas')
  }, [])

  // 1. Copy Target URL
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(targetUrl)
      setCopiedLink(true)
      toast.success('Listing URL copied to clipboard!')
      setTimeout(() => setCopiedLink(false), 2500)
    } catch {
      toast.error('Failed to copy link')
    }
  }

  // 2. Copy QR Image to Clipboard (for desktop pasting to WhatsApp Web, Canva, etc.)
  const handleCopyImage = async () => {
    try {
      const source = getSourceCanvas()
      if (!source) {
        toast.error('QR code not ready yet')
        return
      }

      const canvasToExport =
        activeTab === 'standee'
          ? createBrandedStandeeCanvas(source, title, categoryName, villageName, phone)
          : createCleanQrCanvas(source)

      const blob = await canvasToBlobAsync(canvasToExport, 'image/png')

      if (typeof window !== 'undefined' && navigator.clipboard && typeof (window as any).ClipboardItem !== 'undefined') {
        const item = new (window as any).ClipboardItem({ 'image/png': blob })
        await navigator.clipboard.write([item])
        setCopiedImage(true)
        toast.success('QR Image copied to clipboard! You can paste it directly.')
        setTimeout(() => setCopiedImage(false), 2500)
      } else {
        toast.error('Clipboard image copying is not supported in this browser.')
      }
    } catch (err: any) {
      console.warn('Copy image error:', err)
      toast.error('Failed to copy image to clipboard')
    }
  }

  // 3. Download Branded Standee Poster (PNG)
  const handleDownloadStandee = async () => {
    try {
      setDownloading(true)
      const source = getSourceCanvas()
      if (!source) {
        toast.error('QR code is still loading. Please try again.')
        return
      }

      const standee = createBrandedStandeeCanvas(source, title, categoryName, villageName, phone)
      const blob = await canvasToBlobAsync(standee, 'image/png', 1.0)
      const cleanTitle = (title || 'shop').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)
      const filename = `${cleanTitle}-counter-standee.png`

      triggerBrowserDownload(blob, filename)
      toast.success('Branded Standee Poster downloaded!')
    } catch (err) {
      console.error('Download standee error:', err)
      toast.error('Download failed. You can copy the link or share via WhatsApp.')
    } finally {
      setDownloading(false)
    }
  }

  // 4. Download Clean QR Only (PNG)
  const handleDownloadRawQr = async () => {
    try {
      setDownloading(true)
      const source = getSourceCanvas()
      if (!source) {
        toast.error('QR code is still loading')
        return
      }

      const cleanCanvas = createCleanQrCanvas(source)
      const blob = await canvasToBlobAsync(cleanCanvas, 'image/png', 1.0)
      const cleanTitle = (title || 'shop').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)
      const filename = `${cleanTitle}-qr-code.png`

      triggerBrowserDownload(blob, filename)
      toast.success('Clean QR Code downloaded!')
    } catch (err) {
      console.error('Download QR error:', err)
      toast.error('Download failed')
    } finally {
      setDownloading(false)
    }
  }

  // 5. WhatsApp Direct Share
  const handleShareWhatsApp = () => {
    const message = `🏪 *${title}*\n📍 ${villageName || 'Choutuppal'}${
      categoryName ? ` • ${categoryName}` : ''
    }${phone ? `\n📞 ${phone}` : ''}\n\n🔍 Scan our QR Code or visit our verified shop on Choutuppal Super App:\n🔗 ${targetUrl}`
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`
    window.open(waUrl, '_blank')
  }

  // 6. Mobile Web Share API with File or URL
  const handleNativeShare = async () => {
    try {
      setSharing(true)
      const source = getSourceCanvas()
      const shareTitle = `${title} - QR Code & Profile`
      const shareText = `Check out ${title} (${villageName || 'Choutuppal'}) on Choutuppal Super App:\n${targetUrl}`

      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        // Attempt file sharing if supported
        if (source && typeof navigator.canShare === 'function') {
          try {
            const standee = createBrandedStandeeCanvas(source, title, categoryName, villageName, phone)
            const blob = await canvasToBlobAsync(standee, 'image/png')
            const cleanTitle = (title || 'shop').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)
            const file = new File([blob], `${cleanTitle}-qr.png`, { type: 'image/png' })

            if (navigator.canShare({ files: [file] })) {
              await navigator.share({
                title: shareTitle,
                text: shareText,
                files: [file],
              })
              toast.success('Shared successfully!')
              return
            }
          } catch (fileErr: any) {
            if (fileErr?.name === 'AbortError') return
            console.warn('File share failed, falling back to URL share:', fileErr)
          }
        }

        // Standard link / text share
        try {
          await navigator.share({
            title: shareTitle,
            text: shareText,
            url: targetUrl,
          })
          toast.success('Shared successfully!')
          return
        } catch (shareErr: any) {
          if (shareErr?.name === 'AbortError') return
          console.warn('Text share failed, falling back to WhatsApp:', shareErr)
          handleShareWhatsApp()
        }
      } else {
        handleShareWhatsApp()
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        handleShareWhatsApp()
      }
    } finally {
      setSharing(false)
    }
  }

  // 7. Print Standee
  const handlePrint = () => {
    try {
      const source = getSourceCanvas()
      if (!source) {
        toast.error('QR code not ready')
        return
      }

      const standee = createBrandedStandeeCanvas(source, title, categoryName, villageName, phone)
      const dataUrl = standee.toDataURL('image/png', 1.0)
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        toast.error('Please allow popups to open print preview')
        return
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Print Standee - ${title}</title>
            <style>
              @page { size: auto; margin: 8mm; }
              body {
                margin: 0;
                padding: 20px;
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 95vh;
                background: #f8fafc;
                font-family: system-ui, -apple-system, sans-serif;
              }
              img {
                max-width: 100%;
                max-height: 94vh;
                box-shadow: 0 10px 30px rgba(0,0,0,0.15);
                border-radius: 12px;
              }
              @media print {
                body { background: transparent; padding: 0; }
                img { box-shadow: none; border-radius: 0; max-width: 100%; max-height: 100%; }
              }
            </style>
          </head>
          <body>
            <img src="${dataUrl}" onload="window.print();" alt="${title} Standee" />
          </body>
        </html>
      `)
      printWindow.document.close()
    } catch (err) {
      console.error('Print Error:', err)
      toast.error('Failed to prepare print standee')
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {variant === 'button' ? (
            <Button
              variant="outline"
              size="sm"
              className={`gap-1.5 rounded-xl border-slate-200 bg-white font-bold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-blue-700 transition ${className}`}
            >
              <QrCode className="h-4 w-4 text-blue-700" />
              <span>QR Code</span>
            </Button>
          ) : variant === 'card' ? (
            <div
              className={`group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-blue-50/50 p-4 shadow-xs transition hover:border-blue-300 hover:shadow-md ${className}`}
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-700 text-white shadow-xs group-hover:scale-105 transition-transform">
                  <QrCode className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition">
                    Shop QR Code
                  </h4>
                  <p className="text-xs text-slate-500">
                    Scan on mobile, download standee & share
                  </p>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="text-xs font-bold text-blue-700">
                View & Share
              </Button>
            </div>
          ) : variant === 'icon' ? (
            <button
              type="button"
              className={`p-1.5 text-slate-500 hover:text-blue-700 rounded-lg hover:bg-slate-100 transition ${className}`}
              title="View & Download QR Code"
            >
              <QrCode className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              className={`inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 ${className}`}
            >
              <QrCode className="h-3.5 w-3.5" />
              QR Code
            </button>
          )}
        </DialogTrigger>

        <DialogContent className="max-w-md rounded-3xl p-0 overflow-hidden border-slate-200 bg-white shadow-2xl max-h-[92vh] overflow-y-auto">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-6 text-white text-center relative overflow-hidden">
            <div className="relative z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-3 py-1 text-[11px] font-bold text-blue-300 border border-blue-400/30 mb-2">
                <Sparkles className="h-3 w-3" /> Choutuppal Instant QR
              </span>
              <DialogTitle className="text-xl font-black text-white">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300 mt-1">
                {[categoryName, villageName].filter(Boolean).join(' • ') || 'Verified Local Business in Choutuppal'}
              </DialogDescription>
            </div>
          </div>

          {/* Mode Switcher Tabs (Standee Poster vs Clean QR) */}
          <div className="px-5 pt-4">
            <div className="grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('standee')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                  activeTab === 'standee'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                <span>Branded Standee</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('qr-only')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-lg transition ${
                  activeTab === 'qr-only'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Clean QR Code</span>
              </button>
            </div>
          </div>

          {/* QR Canvas Display */}
          <div className="p-5 flex flex-col items-center">
            <div
              ref={canvasWrapperRef}
              className="relative p-5 rounded-3xl border-2 border-slate-100 bg-white shadow-lg flex flex-col items-center justify-center transition-transform hover:scale-[1.01]"
            >
              <QRCodeCanvas
                value={targetUrl || 'https://www.choutuppal.in'}
                size={210}
                level="H"
                includeMargin={false}
              />

              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                <Smartphone className="h-3.5 w-3.5 text-blue-700" />
                <span>Scan with Camera / PhonePe / GPay</span>
              </div>
            </div>

            {/* Quick URL Bar */}
            <div className="mt-4 w-full flex items-center gap-2 rounded-2xl bg-slate-50 p-2 border border-slate-200">
              <span className="truncate font-mono text-xs text-slate-600 pl-2 flex-1 select-all">
                {targetUrl}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCopyLink}
                className="h-8 rounded-xl text-xs font-bold gap-1 shrink-0 bg-white hover:bg-slate-100"
              >
                {copiedLink ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy Link
                  </>
                )}
              </Button>
            </div>

            {/* Primary Action Buttons */}
            <div className="mt-4 grid grid-cols-2 gap-2.5 w-full">
              {/* WhatsApp Share */}
              <Button
                onClick={handleShareWhatsApp}
                className="h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition"
              >
                <MessageCircle className="h-4 w-4 fill-white" />
                <span>WhatsApp Share</span>
              </Button>

              {/* Native Mobile Share Sheet */}
              <Button
                onClick={handleNativeShare}
                disabled={sharing}
                variant="outline"
                className="h-11 rounded-2xl border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition"
              >
                <Share2 className="h-4 w-4 text-blue-700" />
                <span>Share QR Poster</span>
              </Button>

              {/* Download Active Version */}
              <Button
                onClick={activeTab === 'standee' ? handleDownloadStandee : handleDownloadRawQr}
                disabled={downloading}
                className="h-11 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition"
              >
                <Download className="h-4 w-4" />
                <span>
                  {activeTab === 'standee' ? 'Download Standee (PNG)' : 'Download QR (PNG)'}
                </span>
              </Button>

              {/* Copy Image to Clipboard */}
              <Button
                onClick={handleCopyImage}
                variant="outline"
                className="h-11 rounded-2xl border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition"
              >
                {copiedImage ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-600" />
                    <span>Image Copied!</span>
                  </>
                ) : (
                  <>
                    <FileImage className="h-4 w-4 text-slate-600" />
                    <span>Copy QR Image</span>
                  </>
                )}
              </Button>
            </div>

            {/* Secondary Actions: Print & View Page */}
            <div className="mt-3 w-full flex items-center justify-between px-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-blue-700 transition"
              >
                <Printer className="h-3.5 w-3.5 text-blue-700" />
                <span>Print Standee (A4)</span>
              </button>
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"
              >
                <span>Visit Page</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <p className="mt-3 text-[11px] text-center text-slate-400">
              Print this QR code for your shop counter or share on WhatsApp status so customers can instantly view your catalog & call you.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
