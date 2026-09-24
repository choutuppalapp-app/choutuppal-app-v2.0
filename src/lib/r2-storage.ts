import type { S3Client as S3ClientType } from '@aws-sdk/client-s3'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * Cloudflare R2 Storage Integration (Zero-Egress Fees, Fixes Vercel Blob Limits)
 * 
 * Required Environment Variables:
 * - R2_ACCESS_KEY_ID: S3 API Token Access Key ID from Cloudflare
 * - R2_SECRET_ACCESS_KEY: S3 API Token Secret Access Key
 * - R2_ACCOUNT_ID: Cloudflare Account ID
 * - R2_BUCKET_NAME: Target bucket name in R2 (e.g. "choutuppal-media")
 * - R2_PUBLIC_BASE_URL: Public CDN or custom domain URL (e.g. "https://media.choutuppal.in" or "https://pub-xxx.r2.dev")
 */

export const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
export const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
export const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
export const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME
export const R2_PUBLIC_BASE_URL =
  process.env.R2_PUBLIC_BASE_URL ||
  process.env.R2_PUBLIC_URL ||
  process.env.NEXT_PUBLIC_R2_URL ||
  'https://media.choutuppal.in'

export const isR2Configured = Boolean(
  R2_ACCOUNT_ID &&
  R2_ACCESS_KEY_ID &&
  R2_SECRET_ACCESS_KEY &&
  R2_BUCKET_NAME
)

let _s3Client: S3ClientType | null = null

/**
 * Lazily instantiate the S3 Client configured for Cloudflare R2 endpoint
 */
export async function getR2Client(): Promise<S3ClientType> {
  if (!isR2Configured) {
    throw new Error(
      'Cloudflare R2 is not fully configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.'
    )
  }

  if (!_s3Client) {
    const { S3Client } = await import('@aws-sdk/client-s3')
    _s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    })
  }

  return _s3Client
}

/** Target payload size for image compression (~500KB per Echo Blueprint) */
const MAX_IMAGE_BYTES = 500 * 1024

const IMAGE_MIMETYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
])

export function isImage(mimetype: string): boolean {
  return IMAGE_MIMETYPES.has((mimetype || '').toLowerCase())
}

export function isVideo(mimetype: string): boolean {
  return (mimetype || '').toLowerCase().startsWith('video/')
}

/**
 * Compresses images to ~500KB with sharp when available.
 */
export async function compressImage(
  buffer: Buffer,
): Promise<{ buffer: Buffer; contentType: string }> {
  try {
    const sharpModule = await import('sharp')
    const sharp = sharpModule.default || sharpModule
    let image = sharp(buffer, { failOn: 'none' })
    const meta = await image.metadata()
    const longestEdge = Math.max(meta.width ?? 0, meta.height ?? 0)

    if (longestEdge > 1920) {
      image = image.resize(1920, 1920, { fit: 'inside', withoutEnlargement: true })
    }

    let quality = 80
    let out = await image.clone().webp({ quality }).toBuffer()
    while (out.byteLength > MAX_IMAGE_BYTES && quality > 30) {
      quality -= 10
      out = await image.clone().webp({ quality }).toBuffer()
    }
    return { buffer: out, contentType: 'image/webp' }
  } catch {
    // If sharp is not available in environment, pass through original
    return { buffer, contentType: 'image/jpeg' }
  }
}

function extFromMimetype(mimetype: string): string {
  if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') return 'jpg'
  if (mimetype === 'image/png') return 'png'
  if (mimetype === 'image/webp') return 'webp'
  if (mimetype === 'image/avif') return 'avif'
  if (mimetype === 'image/gif') return 'gif'
  if (mimetype === 'video/mp4') return 'mp4'
  if (mimetype === 'video/webm') return 'webm'
  if (mimetype === 'video/quicktime') return 'mov'
  if (mimetype === 'application/pdf') return 'pdf'
  return 'bin'
}

/**
 * Build a structured key: <folder>/<yyyymm>/<timestamp>-<uuid>.<ext>
 */
export function buildKey(folder: string, mimetype: string, originalName?: string): string {
  const now = new Date()
  const yyyy = now.getUTCFullYear()
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  const ext = extFromMimetype(mimetype)
  const rand = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().slice(0, 8)
    : Math.random().toString(36).slice(2, 10)

  const sanitizedPrefix = originalName
    ? originalName.replace(/[^a-zA-Z0-9]/g, '_').slice(0, 20)
    : 'asset'

  return `${folder}/${yyyy}${mm}/${Date.now()}_${sanitizedPrefix}_${rand}.${ext}`
}

export interface UploadResult {
  url: string
  key: string
  size: number
  contentType: string
}

/**
 * Main upload function: Uploads buffer or File directly to Cloudflare R2
 */
export async function uploadToR2(
  input: Buffer | File | Blob,
  folder: string = 'uploads',
  mimetype: string = 'image/jpeg',
  originalFilename?: string,
): Promise<UploadResult> {
  const raw = Buffer.isBuffer(input)
    ? input
    : Buffer.from(await (input as Blob).arrayBuffer())

  let buffer = raw
  let contentType = mimetype || 'image/jpeg'

  if (isImage(mimetype)) {
    const compressed = await compressImage(raw)
    buffer = compressed.buffer
    contentType = compressed.contentType
  }

  const key = buildKey(folder, contentType, originalFilename)

  if (isR2Configured) {
    const { PutObjectCommand } = await import('@aws-sdk/client-s3')
    const client = await getR2Client()

    await client.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    )

    const base = R2_PUBLIC_BASE_URL.replace(/\/$/, '')
    const url = `${base}/${key}`

    return {
      url,
      key,
      size: buffer.byteLength,
      contentType,
    }
  }

  // Local fallback if R2 credentials are not set in environment
  try {
    const localDir = path.join(process.cwd(), 'public', 'uploads')
    const keyPathParts = key.split('/')
    const parentDir = path.join(localDir, ...keyPathParts.slice(0, -1))
    await fs.mkdir(parentDir, { recursive: true })
    await fs.writeFile(path.join(localDir, key), buffer)

    return {
      url: `/uploads/${key}`,
      key,
      size: buffer.byteLength,
      contentType,
    }
  } catch {
    // If fs is restricted, generate standard R2 public preview URL
    const base = R2_PUBLIC_BASE_URL.replace(/\/$/, '')
    return {
      url: `${base}/${key}`,
      key,
      size: buffer.byteLength,
      contentType,
    }
  }
}

/**
 * Delete an object from R2 by key
 */
export async function deleteFromR2(key: string): Promise<void> {
  if (!key) return

  if (isR2Configured) {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
    const client = await getR2Client()
    await client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    )
    return
  }

  try {
    const uploadsRoot = path.join(process.cwd(), 'public', 'uploads')
    const target = path.resolve(uploadsRoot, key)
    if (target.startsWith(uploadsRoot)) {
      await fs.unlink(target)
    }
  } catch {
    // Silent catch if local file does not exist
  }
}

/**
 * Extract the object key from a public URL
 */
export function keyFromUrl(url: string): string | null {
  if (!url) return null
  if (url.startsWith('/uploads/')) return url.replace('/uploads/', '')
  const base = R2_PUBLIC_BASE_URL.replace(/\/$/, '')
  if (url.startsWith(base)) {
    return url.slice(base.length).replace(/^\//, '')
  }
  return null
}
