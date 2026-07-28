/**
 * Update Villages — replace all dummy villages with the exact 18 villages under
 * the Choutuppal mandal.
 *
 *   bun scripts/update-villages.ts
 *
 * This script:
 *   1. Nulls out villageId on Listings / RealEstate / Users that reference old
 *      villages (so deleting the villages doesn't cascade-delete user content).
 *   2. Deletes ALL existing Village records.
 *   3. Inserts exactly the 18 Choutuppal-mandal villages below.
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CHOUTUPPAL_VILLAGES = [
  'Allapur',
  'Chinna Kondur',
  'Devalamma Nagaram',
  'Jai Kesaram',
  'Khairathpur',
  'Koyalagudem',
  'Lakkaram',
  'Lingoji Guda',
  'Malkapur',
  'Nelapatla',
  'Panthangi',
  'Peddakondur',
  'Peepal Pahad',
  'Swamulavari Lingotam',
  'Tallasingaram',
  'Tangad Palle',
  'Tupranpet',
  'Yellagiri',
]

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

async function main() {
  const before = await prisma.village.count()
  console.log(`Villages before: ${before}`)

  // 1. Detach existing content from old villages so deletion doesn't cascade.
  console.log('Detaching listings, real estate, and users from old villages...')
  await prisma.listing.updateMany({ where: { villageId: { not: null } }, data: { villageId: null } })
  await prisma.realEstate.updateMany({ where: { villageId: { not: null } }, data: { villageId: null } })
  await prisma.user.updateMany({ where: { villageId: { not: null } }, data: { villageId: null } })

  // 2. Delete all existing villages.
  console.log('Deleting all existing villages...')
  await prisma.village.deleteMany({})
  const afterDelete = await prisma.village.count()
  console.log(`Villages after delete: ${afterDelete}`)

  // 3. Insert the 18 Choutuppal-mandal villages.
  console.log(`Inserting ${CHOUTUPPAL_VILLAGES.length} Choutuppal-mandal villages...`)
  for (const name of CHOUTUPPAL_VILLAGES) {
    await prisma.village.create({
      data: {
        name,
        slug: slugify(name),
        district: 'Yadadri Bhuvanagiri',
        state: 'Telangana',
      },
    })
  }

  const final = await prisma.village.count()
  console.log(`\n✅ Done. Villages now: ${final}`)
  console.log('\nFinal village list:')
  const villages = await prisma.village.findMany({ orderBy: { name: 'asc' } })
  villages.forEach((v, i) => console.log(`  ${i + 1}. ${v.name} (slug: ${v.slug})`))
}

main()
  .catch((e) => {
    console.error('❌ Script failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
