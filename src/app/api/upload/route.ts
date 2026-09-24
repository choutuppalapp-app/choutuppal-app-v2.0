import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Configure AWS S3 Client targeting Cloudflare R2 Endpoint
 */
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID || ''
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || ''
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || ''
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || 'choutuppal-media'
const R2_PUBLIC_BASE_URL = (process.env.R2_PUBLIC_BASE_URL || 'media.choutuppal.in').replace(/^https?:\/\//, '').replace(/\/$/, '')

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
})

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = (formData.get('file') || formData.get('image')) as File | null

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No file uploaded. Please send multipart/form-data with "file" or "image".' },
        { status: 400 }
      )
    }

    // Convert File into Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Sanitize filename and construct key with requested unique prefix
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const key = `choutuppal-uploads/${Date.now()}-${sanitizedFileName}`
    const contentType = file.type || 'application/octet-stream'

    // Upload to Cloudflare R2 via S3 PutObjectCommand
    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    })

    await r2Client.send(command)

    // Construct the public R2 URL
    const publicUrl = `https://${R2_PUBLIC_BASE_URL}/${key}`

    return NextResponse.json({
      url: publicUrl,
      key,
      size: file.size,
      contentType,
    })
  } catch (err: any) {
    console.error('[Cloudflare R2 Upload Error]:', err)
    return NextResponse.json(
      {
        error: err?.message || 'Failed to upload file to Cloudflare R2.',
      },
      { status: 500 }
    )
  }
}
