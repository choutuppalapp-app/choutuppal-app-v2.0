import { NextRequest, NextResponse } from 'next/server'
import { requireApiUser } from '@/lib/session'
import { uploadToR2 } from '@/lib/r2-storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILES = 5
const MAX_FILE_BYTES = 25 * 1024 * 1024 // 25MB raw (compressed to ~500KB)

/**
 * POST /api/upload
 * multipart/form-data with field `files` (one or more). Images are compressed
 * to ~500KB and uploaded to R2 (local fallback in dev). Returns an array of
 * { url, key, contentType }.
 *
 * Requires an authenticated session.
 */
export async function POST(request: NextRequest) {
  const auth = await requireApiUser()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
  }

  const entries = form.getAll('files').filter((f): f is File => f instanceof File)
  if (entries.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 })
  }
  if (entries.length > MAX_FILES) {
    return NextResponse.json(
      { error: `Max ${MAX_FILES} files per upload` },
      { status: 400 },
    )
  }

  const results = []
  for (const file of entries) {
    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { error: `${file.name} exceeds 25MB` },
        { status: 413 },
      )
    }
    // folder hints come from the optional "folder" field (default: "uploads")
    const folder = (form.get('folder') as string | null) || 'uploads'
    try {
      const res = await uploadToR2(file, folder, file.type || 'image/jpeg')
      results.push({
        url: res.url,
        key: res.key,
        contentType: res.contentType,
        size: res.size,
      })
    } catch (err) {
      console.error('[upload] failed', file.name, err)
      return NextResponse.json(
        { error: `Upload failed for ${file.name}` },
        { status: 500 },
      )
    }
  }

  return NextResponse.json({ ok: true, files: results })
}
