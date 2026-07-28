const { PrismaClient } = require('@prisma/client')

const regions = [
  'ap-south-1',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-northeast-1',
  'ap-northeast-2',
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'sa-east-1',
  'ca-central-1'
]

async function main() {
  console.log('Testing connection to all pooler regions...')
  for (const r of regions) {
    for (const prefix of ['aws-0', 'aws-1']) {
      const host = `${prefix}-${r}.pooler.supabase.com`
      const url = `postgresql://postgres.poedhagheehegfyogkaq:Pwmd%40786078@${host}:6543/postgres?pgbouncer=true&sslmode=require`
      const prisma = new PrismaClient({
        datasources: { db: { url } }
      })
      try {
        const res = await prisma.$queryRaw`SELECT 1 as val`
        console.log(`SUCCESS! CONNECTED VIA POOLER: ${host}`)
        console.log('Result:', res)
        await prisma.$disconnect()
        return
      } catch (err) {
        const msg = err.message || ''
        if (msg.includes('tenant/user') && msg.includes('not found')) {
          // tenant not in this region, expected
        } else {
          console.log(`Response from ${host}:`, msg.split('\n')[0])
        }
      } finally {
        await prisma.$disconnect()
      }
    }
  }
  console.log('Finished testing all pooler regions.')
}

main()
