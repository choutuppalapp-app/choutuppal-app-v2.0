#!/usr/bin/env node

/**
 * Migration Script: Upload existing public image files to Vercel Blob
 * 
 * Usage:
 *   BLOB_READ_WRITE_TOKEN="your_token" node scripts/migrate-images-to-blob.mjs
 */

import fs from 'fs'
import path from 'path'
import { put } from '@vercel/blob'

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN

if (!BLOB_TOKEN) {
  console.error('❌ Error: BLOB_READ_WRITE_TOKEN environment variable is required.')
  console.error('Please set it in your environment or run with:')
  console.error('  BLOB_READ_WRITE_TOKEN="your_token" node scripts/migrate-images-to-blob.mjs\n')
  process.exit(1)
}

const DIRS_TO_SCAN = ['public/images', 'public/uploads']
const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif', '.avif'])

async function getFiles(dir) {
  const fullPath = path.join(process.cwd(), dir)
  if (!fs.existsSync(fullPath)) return []

  const entries = fs.readdirSync(fullPath, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const res = path.resolve(fullPath, entry.name)
    if (entry.isDirectory()) {
      const subFiles = await getFiles(path.relative(process.cwd(), res))
      files.push(...subFiles)
    } else {
      const ext = path.extname(entry.name).toLowerCase()
      if (SUPPORTED_EXTENSIONS.has(ext)) {
        files.push(path.relative(process.cwd(), res))
      }
    }
  }
  return files
}

async function migrateImages() {
  console.log('🚀 Starting Vercel Blob Migration for existing public images...\n')

  const filesToUpload = []
  for (const dir of DIRS_TO_SCAN) {
    const files = await getFiles(dir)
    filesToUpload.push(...files)
  }

  if (filesToUpload.length === 0) {
    console.log('✨ No local images found in public/images or public/uploads.')
    return
  }

  console.log(`📦 Found ${filesToUpload.length} image(s) to migrate to Vercel Blob:`)
  filesToUpload.forEach((f) => console.log(`   - ${f}`))
  console.log('')

  const urlMap = {}

  for (const filePath of filesToUpload) {
    try {
      const fileName = path.basename(filePath)
      const fileBuffer = fs.readFileSync(filePath)
      const publicPath = '/' + path.relative('public', filePath).replace(/\\/g, '/')
      const blobPath = `choutuppal-uploads/migrated-${Date.now()}-${fileName}`

      console.log(`⏳ Uploading ${filePath} -> Vercel Blob...`)

      const blob = await put(blobPath, fileBuffer, {
        access: 'public',
        token: BLOB_TOKEN,
      })

      urlMap[publicPath] = blob.url
      console.log(`   ✅ Success: ${publicPath} -> ${blob.url}`)
    } catch (err) {
      console.error(`   ❌ Failed to upload ${filePath}:`, err.message)
    }
  }

  // Save the URL mapping
  const outputPath = path.join(process.cwd(), 'image-migration-map.json')
  fs.writeFileSync(outputPath, JSON.stringify(urlMap, null, 2), 'utf-8')

  console.log('\n🎉 Migration completed!')
  console.log(`📄 Saved old -> new URL mapping to: ${outputPath}`)
  console.log('\n💡 Next Steps:')
  console.log('1. Verify your database records or update default fallback URLs if needed.')
  console.log('2. Delete migrated local images from public/ (e.g., rm -rf public/images/*) to keep Vercel function bundle sizes minimal.')
}

migrateImages().catch((err) => {
  console.error('Fatal error during migration:', err)
  process.exit(1)
})
