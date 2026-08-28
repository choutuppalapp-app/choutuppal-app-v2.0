import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export const runtime = 'nodejs'
export const revalidate = 3600

function cleanInstagramUrl(input: string): string | null {
  const s = input.trim()
  const m = s.match(/(?:instagram\.com\/p|instagram\.com\/reel)\/([A-Za-z0-9_-]+)/i)
  if (m) {
    return `https://www.instagram.com/reel/${m[1]}/`
  }
  return null
}

function extractYouTubeId(input: string): string | null {
  const s = input.trim()
  let m = s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/)
  if (m) return m[1]
  m = s.match(/[?&]v=([A-Za-z0-9_-]{11})/)
  if (m) return m[1]
  m = s.match(/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/)
  if (m) return m[1]
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  return null
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, title, phone } = body

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'Reel or Shorts URL is required' }, { status: 400 })
    }

    const user = await getCurrentUser()
    const isInsta = url.includes('instagram.com')
    const cleanUrl = isInsta ? cleanInstagramUrl(url) : url
    const ytId = !isInsta ? extractYouTubeId(url) : null

    if (!cleanUrl && !ytId) {
      return NextResponse.json({ error: 'Please enter a valid Instagram Reel or YouTube Shorts URL' }, { status: 400 })
    }

    // Get system user or current user
    let ownerId = user?.id
    if (!ownerId) {
      const adminUser = await prisma.user.findFirst({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
      })
      ownerId = adminUser?.id
    }

    if (!ownerId) {
      return NextResponse.json({ error: 'Owner user not found' }, { status: 500 })
    }

    const short = await prisma.short.create({
      data: {
        videoUrl: cleanUrl || url,
        platform: isInsta ? 'INSTAGRAM' : 'YOUTUBE',
        youtubeId: ytId,
        title: title || (isInsta ? 'Instagram Reel Promotion' : 'YouTube Short'),
        thumbnail: ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : null,
        ownerId,
      },
    })

    // Log notification in WhatsApp CRM
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '')
      if (cleanPhone) {
        await prisma.whatsAppLog.create({
          data: {
            phone: cleanPhone,
            direction: 'inbound',
            message: `🎬 [New Reel Upload] Submitted Reel for promotion: ${cleanUrl || url}`,
          },
        })
      }
    }

    return NextResponse.json({ ok: true, short, message: 'Reel submitted for promotion!' })
  } catch (err) {
    console.error('[Shorts Submit API] Error:', err)
    return NextResponse.json({ error: 'Failed to submit Reel' }, { status: 500 })
  }
}
