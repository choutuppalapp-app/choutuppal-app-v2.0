import fs from 'fs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function importAllEmergencyToDb() {
  const csvPath = 'C:\\Users\\Citizen2\\Desktop\\Choutuppal_Emergency_Leaders_All.csv'
  console.log(`Reading CSV from ${csvPath}...`)

  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found: ${csvPath}`)
    return
  }

  const fileContent = fs.readFileSync(csvPath, 'utf8')
  const lines = fileContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

  if (lines.length <= 1) {
    console.warn('CSV file is empty or missing data')
    return
  }

  console.log(`Processing ${lines.length - 1} records from CSV...`)

  let inserted = 0
  let updated = 0
  let errors = 0

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    // Parse CSV line regex for quoted fields
    const matches = line.match(/(?:^|,)(?:"([^"]*)"|([^,]*))/g)
    if (!matches) continue

    const fields = matches.map((m) => m.replace(/^,?"?|"$/g, '').trim())
    const rawPhone = fields[0] || ''
    const rawName = fields[1] || ''
    const rawDesignation = fields[2] || ''

    if (!rawPhone) continue

    let cleanPhone = rawPhone.replace(/\D/g, '')
    if (cleanPhone.length === 10) {
      cleanPhone = '91' + cleanPhone
    }

    if (cleanPhone.length < 10) continue

    const contactName = rawName || (rawDesignation ? `${rawDesignation} Official` : 'Govt Leader')

    try {
      const existing = await prisma.whatsAppContact.findUnique({
        where: { phone: cleanPhone },
      })

      if (existing) {
        await prisma.whatsAppContact.update({
          where: { id: existing.id },
          data: {
            name: contactName,
            userType: 'emergency_govt_leader',
            tag: 'Emergency & Govt Leader',
          },
        })
        updated++
      } else {
        await prisma.whatsAppContact.create({
          data: {
            phone: cleanPhone,
            name: contactName,
            userType: 'emergency_govt_leader',
            tag: 'Emergency & Govt Leader',
            source: 'gemini_ocr_emergency_import',
          },
        })
        inserted++
      }
    } catch (err) {
      errors++
    }

    if (i % 200 === 0) {
      console.log(`Processed ${i}/${lines.length - 1} contacts... (Inserted: ${inserted}, Updated: ${updated})`)
    }
  }

  console.log(`==================================================`)
  console.log(`DB IMPORT SUMMARY:`)
  console.log(`Total Processed: ${lines.length - 1}`)
  console.log(`Inserted: ${inserted}`)
  console.log(`Updated: ${updated}`)
  console.log(`Errors/Skipped: ${errors}`)
  console.log(`==================================================`)
}

importAllEmergencyToDb()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
