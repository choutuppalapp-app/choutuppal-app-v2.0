import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

function cleanPhoneNumber(numStr: string | null | undefined): string | null {
  if (!numStr) return null
  const digits = numStr.replace(/\D/g, '')

  if (digits.length === 10) {
    return `+91${digits}`
  } else if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`
  } else if (digits.length > 10) {
    // If country code is attached without +, e.g. 919494348175
    return `+${digits}`
  }
  return null
}

function escapeCsvField(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`
  }
  return val
}

async function exportMetaAudience() {
  console.log('Fetching business listings from database...')

  const listings = await prisma.listing.findMany({
    select: {
      title: true,
      phone: true,
      whatsapp: true,
    },
  })

  console.log(`Fetched ${listings.length} total listings from database. Processing phone numbers...`)

  const seenPhones = new Set<string>()
  const rows: Array<{ phone: string; title: string }> = []

  for (const item of listings) {
    const title = item.title.trim()

    // Process primary phone
    const cleanPhone = cleanPhoneNumber(item.phone)
    if (cleanPhone && !seenPhones.has(cleanPhone)) {
      seenPhones.add(cleanPhone)
      rows.push({ phone: cleanPhone, title })
    }

    // Process WhatsApp phone
    const cleanWa = cleanPhoneNumber(item.whatsapp)
    if (cleanWa && !seenPhones.has(cleanWa)) {
      seenPhones.add(cleanWa)
      rows.push({ phone: cleanWa, title })
    }
  }

  // Build CSV content
  const csvLines = ['phone_number,first_name,last_name']
  for (const row of rows) {
    const escapedTitle = escapeCsvField(row.title)
    csvLines.push(`${row.phone},${escapedTitle},`)
  }

  const csvContent = csvLines.join('\n')

  const targetPath = 'C:\\Users\\Citizen2\\Desktop\\Choutuppal_Meta_Audience.csv'

  // Ensure target directory exists
  const dir = path.dirname(targetPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(targetPath, csvContent, 'utf-8')

  console.log('\n========================================')
  console.log('✅ META CUSTOM AUDIENCE EXPORT COMPLETED')
  console.log(`📁 File Saved To: ${targetPath}`)
  console.log(`📊 Total Unique Business Contacts Exported: ${rows.length}`)
  console.log('========================================\n')
}

exportMetaAudience()
  .catch((e) => {
    console.error('❌ Export failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
