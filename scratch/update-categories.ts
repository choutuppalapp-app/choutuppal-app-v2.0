import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const NEW_CATEGORIES = [
  { name: 'Food & Dining', slug: 'food-dining', icon: 'UtensilsCrossed', description: 'Restaurants, tiffin centers, cafes, food courts & bakeries' },
  { name: 'Health & Medical', slug: 'health-medical', icon: 'HeartPulse', description: 'Hospitals, clinics, pharmacies & diagnostic centers' },
  { name: 'Automobile', slug: 'automobile', icon: 'Car', description: 'Auto sales, service centers, spare parts & bike repair' },
  { name: 'Education', slug: 'education', icon: 'GraduationCap', description: 'Schools, colleges, coaching centers & tuition classes' },
  { name: 'Retail Shopping', slug: 'retail-shopping', icon: 'ShoppingBag', description: 'Supermarkets, clothing, footwear & general stores' },
  { name: 'Services', slug: 'services', icon: 'Wrench', description: 'Home repair, electrician, plumber, salon & local services' },
  { name: 'Real Estate', slug: 'real-estate', icon: 'Home', description: 'Plots, houses, commercial space & land for sale/rent' },
  { name: 'Agriculture', slug: 'agriculture', icon: 'Sprout', description: 'Farming tools, seeds, fertilizers & agri equipment' },
  { name: 'Transport', slug: 'transport', icon: 'Truck', description: 'Logistics, goods transport, cab services & travel agencies' },
  { name: 'Electronics', slug: 'electronics', icon: 'Smartphone', description: 'Mobiles, computers, home appliances & electronics repair' },
]

async function main() {
  console.log('--- Updating Database Categories ---')

  // Unlink categoryId from listings first to avoid FK constraints
  console.log('Unlinking old category IDs from existing listings...')
  await prisma.listing.updateMany({
    data: { categoryId: null },
  })

  // Delete all existing categories
  console.log('Deleting existing categories...')
  await prisma.category.deleteMany({})

  // Insert the 10 main categories
  console.log('Inserting 10 new main categories...')
  for (const cat of NEW_CATEGORIES) {
    const created = await prisma.category.create({
      data: cat,
    })
    console.log(`Created category: ${created.name} (${created.slug})`)
  }

  // Re-link existing listings by matching old/new category concepts
  const foodCat = await prisma.category.findUnique({ where: { slug: 'food-dining' } })
  const healthCat = await prisma.category.findUnique({ where: { slug: 'health-medical' } })
  const autoCat = await prisma.category.findUnique({ where: { slug: 'automobile' } })
  const eduCat = await prisma.category.findUnique({ where: { slug: 'education' } })
  const retailCat = await prisma.category.findUnique({ where: { slug: 'retail-shopping' } })
  const elecCat = await prisma.category.findUnique({ where: { slug: 'electronics' } })

  if (foodCat) {
    await prisma.listing.updateMany({
      where: { slug: { in: ['sri-lakshmi-tiffin-center'] } },
      data: { categoryId: foodCat.id },
    })
  }
  if (healthCat) {
    await prisma.listing.updateMany({
      where: { slug: { in: ['choutuppal-medical-hall', 'sri-venkateswara-clinic'] } },
      data: { categoryId: healthCat.id },
    })
  }
  if (elecCat) {
    await prisma.listing.updateMany({
      where: { slug: { in: ['sri-venkateswara-mobiles'] } },
      data: { categoryId: elecCat.id },
    })
  }
  if (retailCat) {
    await prisma.listing.updateMany({
      where: { slug: { in: ['anand-super-bazaar', 'lakshmi-ganapathi-textiles'] } },
      data: { categoryId: retailCat.id },
    })
  }
  if (eduCat) {
    await prisma.listing.updateMany({
      where: { slug: { in: ['sri-sai-vidya-niketan'] } },
      data: { categoryId: eduCat.id },
    })
  }
  if (autoCat) {
    await prisma.listing.updateMany({
      where: { slug: { in: ['reddy-automobiles'] } },
      data: { categoryId: autoCat.id },
    })
  }

  console.log('Categories updated successfully!')
}

main()
  .catch((e) => {
    console.error('Error updating categories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
