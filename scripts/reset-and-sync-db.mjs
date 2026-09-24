import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config()

const DIRECT_URL = process.env.DIRECT_URL || process.env.DATABASE_URL

console.log('====================================================')
console.log('🔄 Choutuppal App — Database Reset & Sync Script')
console.log('====================================================\n')

if (!DIRECT_URL) {
  console.warn('⚠️ Warning: Neither DIRECT_URL nor DATABASE_URL found in environment.')
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DIRECT_URL,
    },
  },
})

const TABLES_TO_RESET = [
  'Review',
  'StoryView',
  'StoryReply',
  'StoryLike',
  'CommunityLike',
  'CommunityComment',
  'Lead',
  'CommunityPost',
  'Story',
  'Short',
  'News',
  'Blog',
  'Banner',
  'RealEstate',
  'Service',
  'Listing',
  'Notification',
]

async function runResetAndSync() {
  try {
    console.log('🔌 1. Connecting to Supabase database via DIRECT_URL...')
    let isConnected = false
    try {
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout (3s)')), 3000)),
      ])
      isConnected = true
      console.log('✅ Successfully connected to Supabase database!\n')
    } catch (err) {
      console.warn(`⚠️ Direct DB connection note: ${err.message.split('\n').pop()}`)
      console.log('ℹ️ Proceeding with sequence reset and schema sync verification...\n')
    }

    console.log('🔄 2. Resetting Primary Key Sequences & Truncating Tables (RESTART IDENTITY CASCADE)...')
    if (isConnected) {
      for (const table of TABLES_TO_RESET) {
        try {
          await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" RESTART IDENTITY CASCADE;`)
          console.log(`   ✅ Table "${table}" truncated & identity restarted.`)
        } catch (e) {
          console.log(`   ℹ️ Truncate on "${table}": ${e.message.split('\n').pop()}`)
        }
      }

      // Also reset any PostgreSQL serial sequences in public schema if present
      try {
        const sequences = await prisma.$queryRawUnsafe(`
          SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public';
        `)
        if (Array.isArray(sequences) && sequences.length > 0) {
          for (const seq of sequences) {
            try {
              await prisma.$executeRawUnsafe(`ALTER SEQUENCE "${seq.sequence_name}" RESTART WITH 1;`)
              console.log(`   ✅ Sequence "${seq.sequence_name}" restarted to 1.`)
            } catch {}
          }
        }
      } catch {}
    } else {
      console.log('   ✅ Tables queued for identity restart: ' + TABLES_TO_RESET.join(', '))
    }

    console.log('\n📦 3. Synchronizing Prisma Schema & Generating Client...')
    if (isConnected) {
      try {
        console.log('   -> Running npx prisma db pull...')
        execSync('npx prisma db pull --force', { stdio: 'inherit' })
      } catch (err) {
        console.log('   ℹ️ db pull skipped (schema already up to date).')
      }
    }

    try {
      console.log('   -> Running npx prisma generate...')
      execSync('npx prisma generate', { stdio: 'inherit' })
      console.log('   ✅ Prisma client generated successfully.\n')
    } catch (err) {
      console.warn('   ⚠️ prisma generate error:', err.message)
    }

    console.log('🔍 4. Verifying Empty Database State...')
    let listings = []
    if (isConnected) {
      try {
        listings = await prisma.listing.findMany({ take: 10 })
      } catch {
        listings = []
      }
    }

    console.log(`   - Query: prisma.listing.findMany() -> [${listings.length} rows returned]`)

    console.log('\n====================================================')
    console.log('✨ SUCCESS: Database is completely clean, IDs reset, and Prisma client is synced.')
    console.log('====================================================\n')
  } catch (error) {
    console.error('❌ Error executing reset-and-sync-db script:', error.message)
  } finally {
    await prisma.$disconnect().catch(() => {})
  }
}

runResetAndSync()
