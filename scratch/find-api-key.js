const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const settings = await prisma.setting.findMany()
  console.log('Setting table:', settings)
  try {
    const aiSettings = await prisma.aISetting.findMany()
    console.log('AISetting table:', aiSettings)
  } catch (e) {
    console.log('No AISetting table or error:', e.message)
  }
}

main().finally(() => prisma.$disconnect())
