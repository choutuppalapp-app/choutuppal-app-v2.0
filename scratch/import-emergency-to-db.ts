import fs from 'fs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function importEmergencyToDb() {
  const csvPath = 'C:\\Users\\Citizen2\\Desktop\\Choutuppal_Emergency_Leaders.csv'
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV file not found at ${csvPath}`)
    return
  }

  const fileContent = fs.readFileSync(csvPath, 'utf8')
  const lines = fileContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)

  if (lines.length <= 1) {
    console.warn('CSV file is empty or only contains header')
    return
  }

  console.log(`Processing ${lines.length - 1} rows from ${csvPath}...`)
  let inserted = 0
  let updated = 0

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    // Regex to parse quoted CSV fields
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
    if (!cleanPhone) continue

    const formattedName = rawDesignation ? `${rawDesignation} - ${rawName}` : rawName

    const existing = await prisma.whatsAppContact.findUnique({
      where: { phone: cleanPhone },
    })

    if (existing) {
      await prisma.whatsAppContact.update({
        where: { id: existing.id },
        data: {
          name: formattedName,
          userType: 'emergency_govt_leader',
          tag: 'Emergency & Govt Leader',
        },
      })
      updated++
    } else {
      await prisma.whatsAppContact.create({
        data: {
          phone: cleanPhone,
          name: formattedName,
          userType: 'emergency_govt_leader',
          tag: 'Emergency & Govt Leader',
          source: 'emergency_csv_import',
        },
      })
      inserted++
    }
  }

  console.log(`IMPORT COMPLETE! Inserted: ${inserted}, Updated: ${updated}`)
}

importEmergencyToDb()
  .catch((err) => console.error('Error importing emergency contacts:', err))
  .finally(() => prisma.$disconnect())
