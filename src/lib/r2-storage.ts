import type { S3Client as S3ClientType } from '@aws-sdk/client-s3'
import { promises as fs } from 'fs'
import path from 'path'

/**
 * NOTE: `@aws-sdk/client-s3` and `sharp` are heavy (and sharp is a native
 * module). They are lazy-loaded inside the functions that actually need them so
 * that simply importing this module (e.g. from the cron route) does NOT pull
 * them into memory. This keeps the dev server's memory footprint low and lets
 * media routes coexist with page routes on memory-constrained hosts.
 */

/**
 * Cloudflare R2 media storage (zero-egress) via @aws-sdk/client-s3.
 *
 * Required env vars (all optional in dev — falls back to local disk storage):
 *   R2_ACCOUNT_ID          e.g. "abc123"
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   R2_BUCKET_NAME
 *   R2_PUBLIC_URL          public base URL mapped to the bucket, e.g.
 *                          https://media.choutuppal.com
 *
 * All photos are compressed to ~500KB (per the master blueprint) using sharp
 * before upload. Videos are size-checked (ffmpeg-based re-encoding is left as a
 * future enhancement — sharp is image-only).
 */

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL || process.env.R2_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_R2_URL

export const isR2Configured = Boolean(
  R2_ACCOUNT_ID &&
    R2_ACCESS_KEY_ID &&
    R2_SECRET_ACCESS_KEY &&
    R2_BUCKET_NAME,
)

/** Target payload size for image compression. */
const MAX_IMAGE_BYTES = 500 * 1024 // ~500KB

let _client: S3ClientType | null = null

/** Lazily-instantiated R2 S3 client (aws-sdk loaded on first call). */
export async function getR2Client(): Promise<S3ClientType> {
  if (!isR2Configured) {
    throw new Error(
      'R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME.',
    )
  }
  if (!_client) {
    const { S3Client } = await import('@aws-sdk/client-s3')
    _client = new S3Client({
      region: 'auto',
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
    })
  }
  return _client
}

// ---------------------------------------------------------------------------
// Compression helpers
// ---------------------------------------------------------------------------

const IMAGE_MIMETYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
])

export function isImage(mimetype: string): boolean {
  return IMAGE_MIMETYPES.has(mimetype.toLowerCase())
}

export function isVideo(mimetype: string): boolean {
  return mimetype.toLowerCase().startsWith('video/')
}

/**
 * Compress an image buffer to <= ~500KB by progressively lowering JPEG quality
 * and capping the longest edge at 1280px. Returns the compressed buffer and the
 * resulting content-type (always image/jpeg for size efficiency).
 */
export async function compressImage(
  buffer: Buffer,
): Promise<{ buffer: Buffer; contentType: string }> {
  const sharp = (await import('sharp')).default
  let image = sharp(buffer, { failOn: 'none' })
  const meta = await image.metadata()
  const longestEdge = Math.max(meta.width ?? 0, meta.height ?? 0)
  if (longestEdge > 1280) {
    image = image.resize(1280, 1280, { fit: 'inside', withoutEnlargement: true })
  }

  // Start at quality 80 and step down until under the budget.
  let quality = 80
  let out = await image.clone().jpeg({ quality, mozjpeg: true }).toBuffer()
  while (out.byteLength > MAX_IMAGE_BYTES && quality > 30) {
    quality -= 10
    out = await image.clone().jpeg({ quality, mozjpeg: true }).toBuffer()
  }
  return { buffer: out, contentType: 'image/jpeg' }
}

// ---------------------------------------------------------------------------
// Key generation
// ---------------------------------------------------------------------------

function extFromMimetype(mimetype: string): string {
  if (mimetype === 'image/jpeg' || mimetype === 'image/jpg') return 'jpg'
  if (mimetype === 'image/png') return 'png'
  if (mimetype === 'image/webp') return 'webp'
  if (mimetype === 'image/avif') return 'avif'
  if (mimetype === 'image/gif') return 'gif'
  if (mimetype === 'video/mp4') return 'mp4'
  if (mimetype === 'video/webm') return 'webm'
  if (mimetype === 'video/quicktime') return 'mov'
  return 'bin'
}

/** Build a collision-resistant object key: <folder>/<yyyymm>/<uuid>.<ext> */
export function buildKey(folder: string, mimetype: string): string {
  const now = new Date()
  const yyyy = now.getUTCFullYear()
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0')
  const rand =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  return `${folder}/${yyyy}${mm}/${rand}.${extFromMimetype(mimetype)}`
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface UploadResult {
  /** Absolute public URL (R2 public URL or local /uploads path). */
  url: string
  /** Object key in the bucket, or local relative path. */
  key: string
  /** Final byte size after compression. */
  size: number
  contentType: string
}

/**
 * Compress (images only) and upload a file to R2. Falls back to writing the
 * file to `public/uploads/` when R2 env vars are missing, so the app stays
 * fully runnable in any environment.
 *
 * @param input   Buffer or File/Blob to upload.
 * @param folder  Logical folder prefix (e.g. "stories", "banners", "listings").
 * @param mimetype  Original mimetype of the file.
 */
export async function uploadToR2(
  input: Buffer | File | Blob,
  folder: string,
  mimetype: string,
): Promise<UploadResult> {
  const raw = Buffer.isBuffer(input)
    ? input
    : Buffer.from(await (input as Blob).arrayBuffer())

  let buffer = raw
  let contentType = mimetype

  if (isImage(mimetype)) {
    const compressed = await compressImage(raw)
    buffer = compressed.buffer
    contentType = compressed.contentType
  } else if (isVideo(mimetype)) {
    // Videos are passed through (ffmpeg re-encode deferred). Enforce a soft
    // warning if a video is far above budget.
    if (buffer.byteLength > MAX_IMAGE_BYTES * 4) {
      console.warn(
        `[r2] video uploaded at ${(buffer.byteLength / 1024).toFixed(0)}KB — ` +
          `exceeds ~500KB target; ffmpeg re-encode recommended.`,
      )
    }
  }

  const key = buildKey(folder, contentType)

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
      }),
    )
    const base = (R2_PUBLIC_URL ?? '').replace(/\/$/, '')
    const url = base ? `${base}/${key}` : key
    return { url, key, size: buffer.byteLength, contentType }
  }

  // ---- Local fallback -----------------------------------------------------
  const localDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(path.join(localDir, ...key.split('/').slice(0, -1)), {
    recursive: true,
  })
  await fs.writeFile(path.join(localDir, key), buffer)
  return {
    url: `/uploads/${key}`,
    key,
    size: buffer.byteLength,
    contentType,
  }
}

/**
 * Delete an object from R2 (or the local fallback dir). Used by the 24-hour
 * cron job which deletes the R2 file FIRST, then the DB record.
 */
export async function deleteFromR2(key: string): Promise<void> {
  if (!key) return

  if (isR2Configured) {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
    const client = await getR2Client()
    try {
      await client.send(
        new DeleteObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key }),
      )
    } catch (err) {
      console.error(`[r2] failed to delete ${key}:`, err)
      throw err
    }
    return
  }

  // Local fallback — never delete anything that escapes the uploads dir.
  const uploadsRoot = path.join(process.cwd(), 'public', 'uploads')
  const target = path.resolve(uploadsRoot, key)
  if (!target.startsWith(uploadsRoot)) return
  try {
    await fs.unlink(target)
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.error(`[r2] local delete failed for ${key}:`, err)
    }
  }
}

/**
 * Extract the object key from a stored URL (R2 public URL or local /uploads/...).
 */
export function keyFromUrl(url: string): string | null {
  if (!url) return null
  if (url.startsWith('/uploads/')) return url.replace('/uploads/', '')
  if (R2_PUBLIC_URL && url.startsWith(R2_PUBLIC_URL)) {
    return url.slice(R2_PUBLIC_URL.length).replace(/^\//, '')
  }
  return null
}
