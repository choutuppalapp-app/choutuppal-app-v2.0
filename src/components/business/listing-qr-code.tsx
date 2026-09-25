'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import Image from 'next/image'
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
  Instagram,
  Facebook,
  Youtube,
  ShieldCheck,
  BadgeCheck,
  Megaphone,
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
  whatsapp?: string | null
  address?: string | null
  variant?: 'button' | 'card' | 'inline' | 'icon' | 'badge'
  className?: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const CHOUTUPPAL_APP_LOGO = 'https://i.ibb.co/BVdvN5rB/Untitled-design-removebg-preview.png'
const OFFICIAL_INSTAGRAM = 'https://www.instagram.com/choutuppalapp/'
const OFFICIAL_FACEBOOK = 'https://www.facebook.com/Choutuppalapp/'
const OFFICIAL_YOUTUBE = 'https://www.youtube.com/@choutuppalapp'
const OFFICIAL_WA_CHANNEL = 'https://whatsapp.com/channel/0029VbD28mkGpLHOk8wrLE1a'

/**
 * Generates a high-resolution, print-ready branded merchant standee poster
 */
function createBrandedStandeeCanvas(
  sourceCanvas: HTMLCanvasElement,
  title: string,
  categoryName?: string | null,
  villageName?: string | null,
  phone?: string | null,
  address?: string | null
): HTMLCanvasElement {
  const scale = 3 // High resolution 3x scaling for ultra sharp printing
  const width = 600
  const height = 900
  const canvas = document.createElement('canvas')
  canvas.width = width * scale
  canvas.height = height * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) return sourceCanvas

  ctx.scale(scale, scale)

  // 1. Background Base
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)

  // 2. Outer Decorative Frame
  ctx.strokeStyle = '#e2e8f0'
  ctx.lineWidth = 4
  ctx.strokeRect(8, 8, width - 16, height - 16)

  ctx.strokeStyle = '#2563eb'
  ctx.lineWidth = 1.5
  ctx.strokeRect(14, 14, width - 28, height - 28)

  // 3. Header Hero Bar
  const headerGrad = ctx.createLinearGradient(0, 0, width, 160)
  headerGrad.addColorStop(0, '#0f172a') // Slate 900
  headerGrad.addColorStop(0.35, '#1e3a8a') // Deep Navy
  headerGrad.addColorStop(0.7, '#1d4ed8') // Royal Blue
  headerGrad.addColorStop(1, '#0284c7') // Sky Blue
  ctx.fillStyle = headerGrad
  ctx.fillRect(8, 8, width - 16, 160)

  // Decorative Accent bar at top
  const goldGrad = ctx.createLinearGradient(0, 0, width, 0)
  goldGrad.addColorStop(0, '#f59e0b')
  goldGrad.addColorStop(0.5, '#fbbf24')
  goldGrad.addColorStop(1, '#f59e0b')
  ctx.fillStyle = goldGrad
  ctx.fillRect(8, 8, width - 16, 6)

  // 4. Verification Badge Pill
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)'
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(width / 2 - 165, 24, 330, 28, 14)
    ctx.fill()
  } else {
    ctx.fillRect(width / 2 - 165, 24, 330, 28)
  }

  ctx.fillStyle = '#fef08a' // Warm Gold
  ctx.font = 'bold 12px system-ui, -apple-system, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('★ CHOUTUPPAL SUPER APP VERIFIED ★', width / 2, 42)

  // 5. Header Main App Branding & Telugu Tagline
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 24px system-ui, -apple-system, "Noto Sans Telugu", sans-serif'
  ctx.fillText('చౌటుప్పల్ యాప్ · CHOUTUPPAL APP', width / 2, 86)

  ctx.fillStyle = '#93c5fd'
  ctx.font = 'bold 14px system-ui, -apple-system, sans-serif'
  ctx.fillText('OFFICIAL VERIFIED MERCHANT QR CODE', width / 2, 112)

  ctx.fillStyle = '#e0f2fe'
  ctx.font = '12px system-ui, -apple-system, sans-serif'
  ctx.fillText('Scan to View Shop Catalog, Offers & Connect on WhatsApp', width / 2, 134)

  // 6. Business Name & Category Section
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 26px system-ui, -apple-system, "Noto Sans Telugu", sans-serif'
  const displayTitle = title.length > 32 ? title.slice(0, 32) + '...' : title
  ctx.fillText(displayTitle, width / 2, 215)

  // Meta Subtitle (Category & Village)
  const metaParts = [categoryName, villageName || 'Choutuppal', phone ? `📞 ${phone}` : '']
    .filter(Boolean)
    .join('   •   ')
  ctx.fillStyle = '#0369a1'
  ctx.font = 'bold 14px system-ui, -apple-system, "Noto Sans Telugu", sans-serif'
  ctx.fillText(metaParts, width / 2, 246)

  if (address) {
    ctx.fillStyle = '#64748b'
    ctx.font = '500 12px system-ui, -apple-system, sans-serif'
    const cleanAddr = address.length > 50 ? address.slice(0, 50) + '...' : address
    ctx.fillText(`📍 ${cleanAddr}`, width / 2, 268)
  }

  // 7. QR Container Box
  const qrBoxX = 120
  const qrBoxY = address ? 285 : 270
  const qrBoxSize = 360
  ctx.fillStyle = '#f8fafc'
  ctx.strokeStyle = '#bfdbfe'
  ctx.lineWidth = 3
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 28)
    ctx.fill()
    ctx.stroke()
  } else {
    ctx.fillRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize)
    ctx.strokeRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize)
  }

  // Draw QR code inside
  const qrDrawSize = 295
  const qrDrawX = qrBoxX + (qrBoxSize - qrDrawSize) / 2
  const qrDrawY = qrBoxY + (qrBoxSize - qrDrawSize) / 2
  ctx.drawImage(sourceCanvas, qrDrawX, qrDrawY, qrDrawSize, qrDrawSize)

  // 8. Scanning instruction badge
  const scanBadgeY = qrBoxY + qrBoxSize + 30
  ctx.fillStyle = '#0f172a'
  ctx.font = 'bold 18px system-ui, -apple-system, sans-serif'
  ctx.fillText('Scan with Any Smartphone Camera or Payment App', width / 2, scanBadgeY)

  ctx.fillStyle = '#475569'
  ctx.font = '600 13px system-ui, -apple-system, sans-serif'
  ctx.fillText('PhonePe  •  Google Pay  •  Paytm  •  WhatsApp Camera  •  Google Lens', width / 2, scanBadgeY + 24)

  // 9. Telugu & English Guarantee
  ctx.fillStyle = '#16a34a'
  ctx.font = 'bold 13px system-ui, -apple-system, "Noto Sans Telugu", sans-serif'
  ctx.fillText('✓ 100% Verified Local Business Listing in Choutuppal Mandal', width / 2, scanBadgeY + 54)

  // 10. Social Media & Channels Bar
  const socialY = scanBadgeY + 74
  ctx.fillStyle = '#f1f5f9'
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(40, socialY, width - 80, 32, 16)
    ctx.fill()
  } else {
    ctx.fillRect(40, socialY, width - 80, 32)
  }

  ctx.fillStyle = '#475569'
  ctx.font = 'bold 11px system-ui, -apple-system, sans-serif'
  ctx.fillText('Follow us:  Instagram @choutuppalapp   •   Facebook /Choutuppalapp   •   YouTube @choutuppalapp', width / 2, socialY + 20)

  // 11. Footer Bar
  ctx.fillStyle = '#0f172a'
  ctx.fillRect(8, height - 70, width - 16, 62)

  ctx.fillStyle = '#38bdf8'
  ctx.font = 'bold 16px system-ui, -apple-system, sans-serif'
  ctx.fillText('www.choutuppal.in', width / 2, height - 38)

  ctx.fillStyle = '#94a3b8'
  ctx.font = '11px system-ui, -apple-system, "Noto Sans Telugu", sans-serif'
  ctx.fillText('చౌటుప్పల్ ప్రజల మరియు వ్యాపారస్తుల విశ్వసనీయ వేదిక', width / 2, height - 18)

  return canvas
}

/**
 * Creates a clean padded QR code canvas
 */
function createCleanQrCanvas(sourceCanvas: HTMLCanvasElement): HTMLCanvasElement {
  const scale = 3
  const size = 600
  const canvas = document.createElement('canvas')
  canvas.width = size * scale
  canvas.height = size * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) return sourceCanvas

  ctx.scale(scale, scale)

  // White base with soft border
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, size, size)

  // Padded QR
  const pad = 40
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
  whatsapp,
  address,
  variant = 'button',
  className = '',
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: ListingQrCodeProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen

  const setOpen = useCallback(
    (val: boolean) => {
      if (isControlled && setControlledOpen) {
        setControlledOpen(val)
      } else {
        setInternalOpen(val)
      }
    },
    [isControlled, setControlledOpen]
  )

  const [activeTab, setActiveTab] = useState<'standee' | 'whatsapp' | 'socials' | 'qr-only'>('standee')
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedMessage, setCopiedMessage] = useState(false)
  const [copiedImage, setCopiedImage] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [targetUrl, setTargetUrl] = useState('')
  const [renderedQrImage, setRenderedQrImage] = useState<string>('')
  const hiddenCanvasRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const origin =
      typeof window !== 'undefined' && window.location.origin
        ? window.location.origin
        : 'https://www.choutuppal.in'
    const cleanSlug = slug || listingId || 'choutuppal'
    setTargetUrl(`${origin}/business/${cleanSlug}`)
  }, [slug, listingId])

  // Get source QR canvas from hidden DOM container
  const getSourceCanvas = useCallback((): HTMLCanvasElement | null => {
    if (!hiddenCanvasRef.current) return null
    return hiddenCanvasRef.current.querySelector('canvas')
  }, [])

  // Sync rendered QR canvas to image data URL so the generated QR code renders strictly as an <img> tag
  const refreshRenderedImage = useCallback(() => {
    const canvas = getSourceCanvas()
    if (!canvas) return

    try {
      if (activeTab === 'standee') {
        const standee = createBrandedStandeeCanvas(canvas, title, categoryName, villageName, phone, address)
        const dataUrl = standee.toDataURL('image/png')
        setRenderedQrImage(dataUrl)
      } else {
        const cleanCanvas = createCleanQrCanvas(canvas)
        const dataUrl = cleanCanvas.toDataURL('image/png')
        setRenderedQrImage(dataUrl)
      }
    } catch {
      try {
        const dataUrl = canvas.toDataURL('image/png')
        setRenderedQrImage(dataUrl)
      } catch {}
    }
  }, [getSourceCanvas, activeTab, title, categoryName, villageName, phone, address])

  useEffect(() => {
    if (!open) return
    const timer = setTimeout(() => {
      refreshRenderedImage()
    }, 150)
    return () => clearTimeout(timer)
  }, [open, targetUrl, activeTab, refreshRenderedImage])

  // Clean phone / whatsapp numbers for WhatsApp URL API
  const rawWaPhone = (whatsapp || phone || '').replace(/\D/g, '')
  const formattedWaPhone = rawWaPhone.length === 10 ? `91${rawWaPhone}` : rawWaPhone

  // Pre-filled text for direct customer -> merchant chat
  const merchantPrefilledText = `Namaste! I found "${title}" on Choutuppal Super App (${targetUrl}). I would like to inquire about your products & services.`

  // Pre-filled text for sharing shop with friends / WhatsApp status
  const promotionalShareText = `🏪 *${title}*
📍 *Location:* ${villageName || 'Choutuppal'}${categoryName ? ` • ${categoryName}` : ''}${phone ? `\n📞 *Contact:* ${phone}` : ''}
${address ? `🏠 *Address:* ${address}\n` : ''}
✨ *View Complete Shop Catalog, Offers & Contact on Choutuppal Super App:*
🔗 ${targetUrl}

_Download Choutuppal Super App for all local businesses, services & updates!_`

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

  // 2. Copy Promotional WhatsApp Message
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(promotionalShareText)
      setCopiedMessage(true)
      toast.success('Pre-filled WhatsApp message copied!')
      setTimeout(() => setCopiedMessage(false), 2500)
    } catch {
      toast.error('Failed to copy message')
    }
  }

  // 3. Direct WhatsApp Chat with Merchant
  const handleDirectWhatsAppChat = () => {
    if (!formattedWaPhone) {
      toast.error('No phone number provided for this merchant.')
      return
    }
    const waUrl = `https://api.whatsapp.com/send?phone=${formattedWaPhone}&text=${encodeURIComponent(merchantPrefilledText)}`
    window.open(waUrl, '_blank')
  }

  // 4. WhatsApp Share with Pre-filled Text (To Status / Groups)
  const handleShareWhatsAppStatus = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(promotionalShareText)}`
    window.open(waUrl, '_blank')
  }

  // 5. Facebook Share
  const handleShareFacebook = () => {
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(targetUrl)}&quote=${encodeURIComponent(`Check out ${title} on Choutuppal Super App!`)}`
    window.open(fbUrl, '_blank', 'width=600,height=500')
  }

  // 6. Instagram Share helper
  const handleShareInstagram = async () => {
    try {
      await navigator.clipboard.writeText(`${title} - Local Business in ${villageName || 'Choutuppal'}\n${targetUrl}\n\n#Choutuppal #ChoutuppalApp #${(categoryName || 'Business').replace(/\s+/g, '')} #Telangana`)
      toast.success('Instagram caption copied! Opening Instagram...')
      window.open(OFFICIAL_INSTAGRAM, '_blank')
    } catch {
      window.open(OFFICIAL_INSTAGRAM, '_blank')
    }
  }

  // 7. YouTube Channel
  const handleOpenYouTube = () => {
    window.open(OFFICIAL_YOUTUBE, '_blank')
  }

  // 8. Copy QR Image to Clipboard
  const handleCopyImage = async () => {
    try {
      const source = getSourceCanvas()
      if (!source) {
        toast.error('QR code not ready yet')
        return
      }

      const canvasToExport =
        activeTab === 'standee'
          ? createBrandedStandeeCanvas(source, title, categoryName, villageName, phone, address)
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

  // 9. Download PNG Button handler
  const handleDownloadPng = async () => {
    try {
      setDownloading(true)
      const source = getSourceCanvas()
      if (!source) {
        toast.error('QR code is still loading. Please try again.')
        return
      }

      const cleanTitle = (title || 'shop').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)

      if (activeTab === 'standee') {
        const standee = createBrandedStandeeCanvas(source, title, categoryName, villageName, phone, address)
        const blob = await canvasToBlobAsync(standee, 'image/png', 1.0)
        const filename = `${cleanTitle}-choutuppal-standee.png`
        triggerBrowserDownload(blob, filename)
        toast.success('Branded Standee Poster downloaded as PNG!')
      } else {
        const cleanCanvas = createCleanQrCanvas(source)
        const blob = await canvasToBlobAsync(cleanCanvas, 'image/png', 1.0)
        const filename = `${cleanTitle}-qr-code.png`
        triggerBrowserDownload(blob, filename)
        toast.success('QR Code downloaded as PNG!')
      }
    } catch (err) {
      console.error('Download QR error:', err)
      toast.error('Download failed. You can copy the link or share via WhatsApp.')
    } finally {
      setDownloading(false)
    }
  }

  // 10. Web Share API on mobile devices with Image file, URL, and graceful fallback
  const handleWebShare = async () => {
    try {
      setSharing(true)
      const source = getSourceCanvas()
      const shareTitle = `${title} - Choutuppal Super App`
      const shareText = promotionalShareText

      // Check for navigator.share (Web Share API)
      if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
        let fileToShare: File | null = null

        if (source && typeof navigator.canShare === 'function') {
          try {
            const canvasToUse =
              activeTab === 'standee'
                ? createBrandedStandeeCanvas(source, title, categoryName, villageName, phone, address)
                : createCleanQrCanvas(source)

            const blob = await canvasToBlobAsync(canvasToUse, 'image/png')
            const cleanTitle = (title || 'shop').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)
            fileToShare = new File([blob], `${cleanTitle}-choutuppal-qr.png`, { type: 'image/png' })

            if (navigator.canShare({ files: [fileToShare] })) {
              await navigator.share({
                title: shareTitle,
                text: shareText,
                url: targetUrl,
                files: [fileToShare],
              })
              toast.success('Shared successfully!')
              return
            }
          } catch (fileErr: any) {
            if (fileErr?.name === 'AbortError') return
            console.warn('File share check failed, proceeding to URL share:', fileErr)
          }
        }

        // Share text + URL if file sharing is not supported by target
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
          handleShareWhatsAppStatus()
        }
      } else {
        // Fallback for desktop / unsupported browsers: WhatsApp Status & Chats
        handleShareWhatsAppStatus()
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        handleShareWhatsAppStatus()
      }
    } finally {
      setSharing(false)
    }
  }

  // 11. Print Standee
  const handlePrint = () => {
    try {
      const source = getSourceCanvas()
      if (!source) {
        toast.error('QR code not ready')
        return
      }

      const standee = createBrandedStandeeCanvas(source, title, categoryName, villageName, phone, address)
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
            <title>Choutuppal Standee - ${title}</title>
            <style>
              @page { size: auto; margin: 6mm; }
              body {
                margin: 0;
                padding: 16px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                min-height: 96vh;
                background: #f8fafc;
                font-family: system-ui, -apple-system, sans-serif;
              }
              img {
                max-width: 100%;
                max-height: 94vh;
                box-shadow: 0 10px 35px rgba(0,0,0,0.18);
                border-radius: 14px;
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

  const handleOpenClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setOpen(true)
  }

  return (
    <>
      {/* Hidden offscreen QR Canvas Generator Engine */}
      <div
        ref={hiddenCanvasRef}
        aria-hidden="true"
        className="fixed -left-[9999px] -top-[9999px] opacity-0 pointer-events-none"
      >
        <QRCodeCanvas
          value={targetUrl || 'https://www.choutuppal.in'}
          size={512}
          level="H"
          includeMargin={false}
        />
      </div>

      {/* Trigger element based on variant */}
      {variant === 'button' ? (
        <Button
          type="button"
          onClick={handleOpenClick}
          variant="outline"
          size="sm"
          className={`gap-1.5 rounded-xl border-slate-200 bg-white font-bold text-slate-700 shadow-xs hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition ${className}`}
        >
          <QrCode className="h-4 w-4 text-blue-700" />
          <span>QR Code</span>
        </Button>
      ) : variant === 'card' ? (
        <div
          role="button"
          tabIndex={0}
          onClick={handleOpenClick}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setOpen(true)
            }
          }}
          className={`group flex cursor-pointer items-center justify-between rounded-2xl border border-blue-100 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/30 p-4 shadow-xs transition hover:border-blue-300 hover:shadow-md ${className}`}
        >
          <div className="flex items-center gap-3.5">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-700 to-indigo-800 text-white shadow-md group-hover:scale-105 transition-transform">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-black text-slate-900 group-hover:text-blue-700 transition">
                  Shop QR Code & Standee
                </h4>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Verified
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Scan, WhatsApp API, Insta & Print Standee
              </p>
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-xs font-bold text-blue-700 hover:bg-blue-100/50 rounded-xl"
            onClick={handleOpenClick}
          >
            Open Standee
          </Button>
        </div>
      ) : variant === 'badge' ? (
        <button
          type="button"
          onClick={handleOpenClick}
          className={`inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 border border-blue-200 hover:bg-blue-100 transition ${className}`}
        >
          <QrCode className="h-3.5 w-3.5" />
          <span>QR Standee</span>
        </button>
      ) : variant === 'icon' ? (
        <button
          type="button"
          onClick={handleOpenClick}
          className={`p-1.5 text-slate-500 hover:text-blue-700 rounded-md hover:bg-blue-50 transition ${className}`}
          title="View & Download Shop QR Code"
        >
          <QrCode className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          onClick={handleOpenClick}
          className={`inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline ${className}`}
        >
          <QrCode className="h-3.5 w-3.5" />
          QR Code
        </button>
      )}

      {/* Main Dialog Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl rounded-3xl p-0 overflow-hidden border-slate-200 bg-white shadow-2xl max-h-[94vh] flex flex-col">
          {/* Header Banner with Choutuppal App Branding */}
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 p-5 text-white relative shrink-0">
            {/* Top Bar with Logo & Verification */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="relative h-9 w-28 bg-white/10 rounded-xl p-1 backdrop-blur-xs border border-white/20 flex items-center justify-center overflow-hidden">
                  <Image
                    src={CHOUTUPPAL_APP_LOGO}
                    alt="Choutuppal App Logo"
                    width={100}
                    height={28}
                    className="h-7 w-auto object-contain"
                    priority
                  />
                </div>
                <div className="text-left">
                  <p className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                    Official App Platform
                  </p>
                  <p className="text-xs font-black text-white">
                    చౌటుప్పల్ యాప్
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] font-bold text-emerald-300 border border-emerald-400/30">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Verified Merchant</span>
              </div>
            </div>

            {/* Shop Title & Details */}
            <div className="text-left">
              <DialogTitle className="text-lg sm:text-xl font-black text-white leading-tight">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs text-blue-100/90 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                {categoryName && <span>🏢 {categoryName}</span>}
                {villageName && <span>📍 {villageName}</span>}
                {phone && <span>📞 {phone}</span>}
              </DialogDescription>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="px-5 pt-3 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <div className="grid grid-cols-4 gap-1 rounded-2xl bg-slate-200/70 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('standee')}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl transition text-[11px] sm:text-xs ${
                  activeTab === 'standee'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">Standee Poster</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('qr-only')}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl transition text-[11px] sm:text-xs ${
                  activeTab === 'qr-only'
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <QrCode className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">QR Code PNG</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('whatsapp')}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl transition text-[11px] sm:text-xs ${
                  activeTab === 'whatsapp'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageCircle className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                <span className="truncate">WhatsApp API</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('socials')}
                className={`flex items-center justify-center gap-1 py-2 px-1 rounded-xl transition text-[11px] sm:text-xs ${
                  activeTab === 'socials'
                    ? 'bg-white text-pink-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Share2 className="h-3.5 w-3.5 shrink-0 text-pink-600" />
                <span className="truncate">Social Media</span>
              </button>
            </div>
          </div>

          {/* Scrollable Tab Content Body */}
          <div className="p-5 overflow-y-auto flex-1 space-y-4">
            {/* Visual QR Code Image Container — Strictly Renders as an Image */}
            <div className="flex flex-col items-center justify-center">
              <div className="relative p-3 rounded-3xl border-2 border-slate-200/80 bg-white shadow-md flex flex-col items-center justify-center group max-w-[280px]">
                {renderedQrImage ? (
                  <div className="relative flex flex-col items-center">
                    {/* Genuine <img> Element */}
                    <img
                      src={renderedQrImage}
                      alt={`${title} QR Code`}
                      className={`w-full object-contain rounded-2xl transition-transform duration-200 group-hover:scale-[1.02] ${
                        activeTab === 'standee' ? 'max-h-[260px]' : 'max-h-[220px]'
                      }`}
                    />
                    <p className="mt-2 text-[10px] text-slate-400 font-medium select-none">
                      (Tap and hold to save image)
                    </p>
                  </div>
                ) : (
                  <div className="h-48 w-48 flex items-center justify-center">
                    <div className="h-8 w-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                  </div>
                )}

                <div className="mt-2 flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold text-slate-600 bg-blue-50/70 px-3 py-1 rounded-full border border-blue-100">
                  <Smartphone className="h-3 w-3 text-blue-700 shrink-0" />
                  <span className="truncate">Scan with PhonePe, GPay, Camera & Lens</span>
                </div>
              </div>

              {/* Instant Action Bar: 'Download' PNG Button & 'Share' Web Share Button */}
              <div className="w-full grid grid-cols-2 gap-2.5 mt-3.5">
                <Button
                  onClick={handleDownloadPng}
                  disabled={downloading}
                  className="h-11 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>{downloading ? 'Downloading...' : 'Download PNG'}</span>
                </Button>

                <Button
                  onClick={handleWebShare}
                  disabled={sharing}
                  className="h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
                >
                  <Share2 className="h-4 w-4" />
                  <span>{sharing ? 'Opening Share...' : 'Share QR & Link'}</span>
                </Button>
              </div>
            </div>

            {/* TAB 1: BRANDED STANDEE POSTER */}
            {activeTab === 'standee' && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-blue-100 bg-blue-50/40 p-3.5 text-xs text-slate-700 flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">
                      Official Merchant Standee Poster with Choutuppal Branding
                    </p>
                    <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                      Download or print this verified merchant standee poster for your shop counter. Customers can scan it with any camera or payment app to view products, services & direct WhatsApp!
                    </p>
                  </div>
                </div>

                {/* Standee Action Grid */}
                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    onClick={handlePrint}
                    variant="outline"
                    className="h-10 rounded-2xl border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition cursor-pointer"
                  >
                    <Printer className="h-4 w-4 text-blue-700" />
                    <span>Print A4 Poster</span>
                  </Button>

                  <Button
                    onClick={handleCopyImage}
                    variant="outline"
                    className="h-10 rounded-2xl border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 transition cursor-pointer"
                  >
                    {copiedImage ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span>Copied Image!</span>
                      </>
                    ) : (
                      <>
                        <FileImage className="h-4 w-4 text-slate-600" />
                        <span>Copy Image</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 2: CLEAN QR CODE ONLY (PNG & IMAGE RENDER) */}
            {activeTab === 'qr-only' && (
              <div className="space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                  <p className="font-bold text-slate-900">
                    High-Resolution Clean QR Code Image (PNG)
                  </p>
                  <p className="text-[11px] mt-0.5">
                    Crisp transparent/white background QR code perfect for custom visiting cards, flex banners, pamphlets, packaging, and stickers.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    onClick={handleDownloadPng}
                    disabled={downloading}
                    variant="outline"
                    className="h-10 rounded-2xl border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer"
                  >
                    <Download className="h-4 w-4 text-blue-700" />
                    <span>Save Clean PNG</span>
                  </Button>

                  <Button
                    onClick={handleCopyImage}
                    variant="outline"
                    className="h-10 rounded-2xl border-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer"
                  >
                    {copiedImage ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-600" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-slate-600" />
                        <span>Copy Image</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 3: WHATSAPP API WITH PREFILLED TEXT */}
            {activeTab === 'whatsapp' && (
              <div className="space-y-3.5">
                {/* 1. Direct Customer -> Merchant Chat */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                        <MessageCircle className="h-4 w-4 fill-white" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-emerald-950">
                          1-Click Direct WhatsApp API Chat
                        </h4>
                        <p className="text-[11px] text-emerald-700">
                          Directly message shop owner on {phone || formattedWaPhone || 'WhatsApp'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white p-2.5 border border-emerald-100 text-xs font-mono text-slate-700 select-all">
                    &ldquo;{merchantPrefilledText}&rdquo;
                  </div>

                  <Button
                    onClick={handleDirectWhatsAppChat}
                    className="w-full h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <MessageCircle className="h-4 w-4 fill-white" />
                    <span>Open Pre-filled WhatsApp Chat</span>
                  </Button>
                </div>

                {/* 2. Share Shop Promotional Message */}
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-slate-800 text-white flex items-center justify-center">
                        <Share2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">
                          Share Shop Card to WhatsApp Groups & Status
                        </h4>
                        <p className="text-[11px] text-slate-500">
                          Pre-formatted card with address, link & Choutuppal verified badge
                        </p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCopyMessage}
                      className="h-7 text-[11px] font-bold gap-1 rounded-lg cursor-pointer"
                    >
                      {copiedMessage ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-600" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" /> Copy Text
                        </>
                      )}
                    </Button>
                  </div>

                  <pre className="rounded-xl bg-white p-2.5 border border-slate-200 text-[11px] text-slate-700 whitespace-pre-wrap font-sans max-h-24 overflow-y-auto">
                    {promotionalShareText}
                  </pre>

                  <Button
                    onClick={handleShareWhatsAppStatus}
                    className="w-full h-10 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Share2 className="h-4 w-4" />
                    <span>Share to WhatsApp Status & Chats</span>
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 4: SOCIAL ECOSYSTEM (INSTAGRAM, FACEBOOK, YOUTUBE) */}
            {activeTab === 'socials' && (
              <div className="space-y-3.5">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3.5 text-xs text-slate-600">
                  <p className="font-bold text-slate-900 mb-1">
                    Promote across Choutuppal Social Ecosystem
                  </p>
                  <p className="text-[11px]">
                    Connect with thousands of daily active Choutuppal residents across our official channels.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Instagram */}
                  <div className="rounded-2xl border border-pink-200 bg-gradient-to-br from-pink-50/60 to-rose-50/30 p-3 flex flex-col justify-between space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
                        <Instagram className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">Instagram</h4>
                        <p className="text-[10px] text-pink-700 font-bold">@choutuppalapp</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleShareInstagram}
                      className="w-full h-8 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-[11px] cursor-pointer"
                    >
                      Copy & Open Insta
                    </Button>
                  </div>

                  {/* Facebook */}
                  <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/60 to-sky-50/30 p-3 flex flex-col justify-between space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                        <Facebook className="h-4 w-4 fill-white" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">Facebook</h4>
                        <p className="text-[10px] text-blue-700 font-bold">/Choutuppalapp</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleShareFacebook}
                      className="w-full h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] cursor-pointer"
                    >
                      Share on Facebook
                    </Button>
                  </div>

                  {/* YouTube */}
                  <div className="rounded-2xl border border-red-200 bg-gradient-to-br from-red-50/60 to-orange-50/30 p-3 flex flex-col justify-between space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                        <Youtube className="h-4 w-4 fill-white" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900">YouTube</h4>
                        <p className="text-[10px] text-red-700 font-bold">@choutuppalapp</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={handleOpenYouTube}
                      className="w-full h-8 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] cursor-pointer"
                    >
                      Watch Channel
                    </Button>
                  </div>
                </div>

                {/* WhatsApp Community & Channel Links */}
                <div className="rounded-2xl border border-emerald-100 bg-emerald-50/30 p-3 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-emerald-700 shrink-0" />
                    <p className="text-xs font-bold text-slate-800">
                      Join Official Choutuppal WhatsApp Channel
                    </p>
                  </div>
                  <a
                    href={OFFICIAL_WA_CHANNEL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                  >
                    Join Channel
                  </a>
                </div>
              </div>
            )}

            {/* Quick URL Bar & Copy Link */}
            <div className="w-full flex items-center gap-2 rounded-2xl bg-slate-100/80 p-2 border border-slate-200/80">
              <span className="truncate font-mono text-xs text-slate-600 pl-2 flex-1 select-all">
                {targetUrl}
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleCopyLink}
                className="h-8 rounded-xl text-xs font-bold gap-1 shrink-0 bg-white hover:bg-slate-50 border-slate-200 shadow-xs cursor-pointer"
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
          </div>

          {/* Footer Bottom Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Choutuppal Verified Merchant</span>
            </div>

            <a
              href={targetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-800 hover:underline"
            >
              <span>Visit Shop Page</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
