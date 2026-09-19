import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2 } from '@/lib/r2-storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/upload — upload file(s) to Cloudflare R2 (or local fallback).
 * Accepts multipart/form-data with 'files' (or 'file') and 'folder'.
 * Compresses images to ~500KB and returns absolute public URLs.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const folder = (formData.get('folder') as string) || 'uploads'

    // Extract files (supports key 'files', 'file', or 'image')
    const rawFiles: File[] = []
    const allEntries = formData.getAll('files')
    if (allEntries.length > 0) {
      for (const entry of allEntries) {
        if (entry && typeof entry === 'object' && 'arrayBuffer' in entry) {
          rawFiles.push(entry as File)
        }
      }
    } else {
      const singleFile = (formData.get('file') || formData.get('image')) as File | null
      if (singleFile && typeof singleFile === 'object' && 'arrayBuffer' in singleFile) {
        rawFiles.push(singleFile)
      }
    }

    if (rawFiles.length === 0) {
      return NextResponse.json({ ok: false, error: 'No files provided for upload' }, { status: 400 })
    }

    const uploadedResults: Array<{ url: string; key: string; size: number; contentType: string }> = []
    for (const file of rawFiles) {
      const mimetype = file.type || 'image/jpeg'
      const result = await uploadToR2(file, folder, mimetype)
      uploadedResults.push(result)
    }

    return NextResponse.json({
      ok: true,
      files: uploadedResults,
      url: uploadedResults[0]?.url,
    })
  } catch (err: any) {
    console.error('[UploadAPI] Error uploading file to R2:', err)
    return NextResponse.json(
      { ok: false, error: err?.message || 'Failed to upload image' },
      { status: 500 },
    )
  }
}
