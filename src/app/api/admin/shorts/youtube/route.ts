import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { requireApiAdmin } from '@/lib/session'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Extract an 11-char YouTube video ID from any common URL form. */
function extractVideoId(input: string): string | null {
  const s = input.trim()
  // youtu.be/ID
  let m = s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/)
  if (m) return m[1]
  // watch?v=ID
  m = s.match(/[?&]v=([A-Za-z0-9_-]{11})/)
  if (m) return m[1]
  // /embed/ID or /shorts/ID
  m = s.match(/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/)
  if (m) return m[1]
  // bare 11-char ID
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s
  return null
}

/** Extract a channel ID (UC...) or handle (@handle) from a channel URL. */
function extractChannelInput(input: string): { channelId?: string; handle?: string } {
  const s = input.trim()
  let m = s.match(/(UC[A-Za-z0-9_-]{22})/)
  if (m) return { channelId: m[1] }
  m = s.match(/@([A-Za-z0-9_.-]+)/)
  if (m) return { handle: m[1] }
  m = s.match(/channel\/(UC[A-Za-z0-9_-]{22})/)
  if (m) return { channelId: m[1] }
  return {}
}

/** Fetch video title + thumbnail via the oEmbed API (no API key needed, saves quota). */
async function fetchOEmbed(videoId: string): Promise<{ title: string; thumbnail: string } | null> {
  try {
    const url = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (!res.ok) return null
    const data = await res.json()
    return {
      title: data.title ?? `Video ${videoId}`,
      thumbnail: data.thumbnail_url ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    }
  } catch {
    return null
  }
}

/** Resolve a channel handle (@handle) to a channel ID via the search endpoint. */
async function resolveChannelId(
  handle: string,
  apiKey: string,
): Promise<string | null> {
  try {
    const q = handle.startsWith('@') ? handle : `@${handle}`
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&maxResults=1&q=${encodeURIComponent(q)}&key=${apiKey}`
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) })
    if (!res.ok) return null
    const data = await res.json()
    return data.items?.[0]?.id?.channelId ?? null
  } catch {
    return null
  }
}

const AddSchema = z.object({
  mode: z.enum(['channel', 'single']),
  input: z.string().min(1),
})

/**
 * POST /api/admin/shorts/youtube
 * Body: { mode: 'channel' | 'single', input: string }
 *
 * - `single`: extracts the video ID, fetches title+thumbnail via oEmbed, saves
 *   one Short.
 * - `channel`: uses the YouTube Data API v3 (YOUTUBE_API_KEY from the Setting
 *   table or env) to fetch the latest 10-15 videos from the channel's uploads
 *   playlist and saves them as Shorts.
 *
 * Requires ADMIN role. All saved Shorts are owned by the admin.
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => ({}))
  const parsed = AddSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid' }, { status: 400 })
  }

  const { mode, input } = parsed.data

  // ---- Single video mode (oEmbed — no API key needed) ----------------------
  if (mode === 'single') {
    const videoId = extractVideoId(input)
    if (!videoId) {
      return NextResponse.json({ error: 'Could not extract a YouTube video ID from the URL' }, { status: 400 })
    }

    // De-dupe: don't add the same video twice.
    const existing = await prisma.short.findFirst({ where: { youtubeId: videoId } })
    if (existing) {
      return NextResponse.json({ error: 'This video is already in the Shorts list' }, { status: 409 })
    }

    const meta = await fetchOEmbed(videoId)
    const short = await prisma.short.create({
      data: {
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        youtubeId: videoId,
        title: meta?.title ?? `Video ${videoId}`,
        thumbnail: meta?.thumbnail ?? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        ownerId: auth.user.id,
      },
    })
    return NextResponse.json({ ok: true, added: 1, shorts: [short] }, { status: 201 })
  }

  // ---- Channel mode (YouTube Data API v3) ----------------------------------
  // Read the API key from the Setting table (admin-entered) or env.
  const setting = await prisma.setting.findUnique({ where: { key: 'youtube_api_key' } })
  const apiKey = setting?.value || process.env.YOUTUBE_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'No YouTube API key configured. Add it in Admin → Settings → Integrations.' },
      { status: 400 },
    )
  }

  const { channelId, handle } = extractChannelInput(input)
  let resolvedChannelId = channelId

  // If a handle was given, resolve it to a channel ID.
  if (!resolvedChannelId && handle) {
    resolvedChannelId = await resolveChannelId(handle, apiKey)
    if (!resolvedChannelId) {
      return NextResponse.json({ error: 'Could not resolve the YouTube channel. Try a Channel ID (UC...).' }, { status: 400 })
    }
  }
  if (!resolvedChannelId) {
    return NextResponse.json({ error: 'Could not extract a YouTube Channel ID. Use a channel URL or UC... ID.' }, { status: 400 })
  }

  try {
    // 1. Get the channel's uploads playlist ID.
    const chUrl = `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${resolvedChannelId}&key=${apiKey}`
    const chRes = await fetch(chUrl, { signal: AbortSignal.timeout(10000) })
    if (!chRes.ok) {
      const errText = await chRes.text().catch(() => '')
      return NextResponse.json({ error: `YouTube API error: ${chRes.status} ${errText.slice(0, 120)}` }, { status: 502 })
    }
    const chData = await chRes.json()
    const uploadsPlaylistId = chData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads
    if (!uploadsPlaylistId) {
      return NextResponse.json({ error: 'Channel found but no uploads playlist. Is it a valid channel?' }, { status: 400 })
    }

    // 2. Fetch the latest 15 videos from the uploads playlist.
    const plUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=15&playlistId=${uploadsPlaylistId}&key=${apiKey}`
    const plRes = await fetch(plUrl, { signal: AbortSignal.timeout(10000) })
    if (!plRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch channel uploads' }, { status: 502 })
    }
    const plData = await plRes.json()
    const items = (plData.items ?? []) as Array<{
      snippet: {
        resourceId: { videoId: string }
        title: string
        thumbnails: { high?: { url: string }; medium?: { url: string }; default?: { url: string } }
      }
    }>

    // 3. De-dupe against existing shorts, then insert the new ones.
    const videoIds = items.map((i) => i.snippet.resourceId.videoId).filter(Boolean)
    const existing = await prisma.short.findMany({
      where: { youtubeId: { in: videoIds } },
      select: { youtubeId: true },
    })
    const existingSet = new Set(existing.map((e) => e.youtubeId))

    const toCreate = items
      .filter((i) => {
        const vid = i.snippet.resourceId.videoId
        return vid && !existingSet.has(vid)
      })
      .map((i) => ({
        videoUrl: `https://www.youtube.com/watch?v=${i.snippet.resourceId.videoId}`,
        youtubeId: i.snippet.resourceId.videoId,
        title: i.snippet.title,
        thumbnail:
          i.snippet.thumbnails?.high?.url ??
          i.snippet.thumbnails?.medium?.url ??
          `https://i.ytimg.com/vi/${i.snippet.resourceId.videoId}/hqdefault.jpg`,
        ownerId: auth.user.id,
      }))

    let created: Array<{ id: string; title: string | null; youtubeId: string | null }> = []
    if (toCreate.length > 0) {
      created = await prisma.$transaction(
        toCreate.map((s) =>
          prisma.short.create({
            data: s,
            select: { id: true, title: true, youtubeId: true },
          }),
        ),
      )
    }

    return NextResponse.json({
      ok: true,
      added: created.length,
      skipped: existingSet.size,
      total: items.length,
      shorts: created,
    }, { status: 201 })
  } catch (err) {
    console.error('[admin/shorts/youtube] channel fetch failed', err)
    return NextResponse.json({ error: 'Failed to fetch channel videos' }, { status: 500 })
  }
}
