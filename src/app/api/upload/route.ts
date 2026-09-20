import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { uploadToR2, isR2Configured } from '@/lib/r2-storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * POST /api/upload — High-performance image upload via Vercel Blob Storage.
 * Resolves "Vercel storage full" issues by hosting media assets on Vercel's global CDN.
 * 
 * Supports:
 * - Single or multiple file uploads (fields: 'file', 'files', 'image')
 * - Custom folder routing ('folder' in formData)
 * - Automatic unique file prefix: choutuppal-uploads/${Date.now()}-${sanitizedName}
 * - Seamless fallback if BLOB_READ_WRITE_TOKEN is not yet set
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const folder = (formData.get('folder') as string) || 'choutuppal-uploads'

    // Extract files from formData (supports 'file', 'files', or 'image')
    const rawFiles: File[] = []
    const allEntries = formData.getAll('files')
    if (allEntries.length > 0) {
      for (const entry of allEntries) {
        if (entry && typeof entry === 'object' && 'arrayBuffer' in entry) {
          rawFiles.push(entry as File)
        }
      }
    } else {
      const single = (formData.get('file') || formData.get('image')) as File | null
      if (single && typeof single === 'object' && 'arrayBuffer' in single) {
        rawFiles.push(single)
      }
    }

    if (rawFiles.length === 0) {
      return NextResponse.json(
        { ok: false, error: 'No files provided for upload' },
        { status: 400 }
      )
    }

    const hasBlobToken = Boolean(process.env.BLOB_READ_WRITE_TOKEN)
    const uploadedResults: Array<{ url: string; key: string; size: number; contentType: string }> = []

    for (const file of rawFiles) {
      const originalName = file.name || 'image.jpg'
      const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
      const blobPathname = `${folder}/${Date.now()}-${sanitizedName}`
      const contentType = file.type || 'image/jpeg'

      if (hasBlobToken) {
        // Upload directly to Vercel Blob Storage
        const blob = await put(blobPathname, file, {
          access: 'public',
          token: process.env.BLOB_READ_WRITE_TOKEN,
          contentType,
          addRandomSuffix: true,
        })

        uploadedResults.push({
          url: blob.url,
          key: blob.pathname,
          size: file.size,
          contentType,
        })
      } else if (isR2Configured) {
        // Cloudflare R2 fallback
        const r2Result = await uploadToR2(file, folder, contentType)
        uploadedResults.push(r2Result)
      } else {
        // Local storage / fallback for environments without Vercel token
        const fallbackResult = await uploadToR2(file, folder, contentType)
        uploadedResults.push(fallbackResult)
      }
    }

    const primaryUrl = uploadedResults[0]?.url

    return NextResponse.json({
      ok: true,
      url: primaryUrl,
      files: uploadedResults,
    })
  } catch (err: any) {
    console.error('[UploadAPI] Error uploading image to Vercel Blob:', err)
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || 'Failed to upload image. Please verify your BLOB_READ_WRITE_TOKEN.',
      },
      { status: 500 }
    )
  }
}
