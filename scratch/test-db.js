const { PrismaClient } = require('@prisma/client')

async function main() {
  const url = process.argv[2] || process.env.DATABASE_URL
  console.log('Testing connection to:', url.replace(/:[^:@/]+@/, ':***@'))
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url
      }
    }
  })
  
  try {
    const res = await prisma.$queryRaw`SELECT 1 as val`
    console.log('Success! Result:', res)
  } catch (err) {
    console.error('Connection failed:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()
