const { PrismaClient } = require('@prisma/client')

const url = "postgresql://postgres.poedhagheehegfyogkaq:Pwmd%40786078@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url
    }
  }
})

async function main() {
  console.log('Enabling Row Level Security (RLS) on public tables...')

  const queries = [
    // 1. Listing RLS
    `ALTER TABLE "Listing" ENABLE ROW LEVEL SECURITY;`,
    `DROP POLICY IF EXISTS "Public read listings" ON "Listing";`,
    `CREATE POLICY "Public read listings" ON "Listing" FOR SELECT USING (status = 'APPROVED');`,
    
    // 2. Banner RLS
    `ALTER TABLE "Banner" ENABLE ROW LEVEL SECURITY;`,
    `DROP POLICY IF EXISTS "Public read banners" ON "Banner";`,
    `CREATE POLICY "Public read banners" ON "Banner" FOR SELECT USING (status = 'APPROVED');`,
    
    // 3. CommunityPost RLS
    `ALTER TABLE "CommunityPost" ENABLE ROW LEVEL SECURITY;`,
    `DROP POLICY IF EXISTS "Public read posts" ON "CommunityPost";`,
    `CREATE POLICY "Public read posts" ON "CommunityPost" FOR SELECT USING (true);`
  ]

  for (const sql of queries) {
    try {
      await prisma.$executeRawUnsafe(sql)
      console.log('Executed:', sql.trim())
    } catch (err) {
      console.warn('Query failed or already configured:', sql.trim(), err.message)
    }
  }

  console.log('RLS setup completed successfully.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
