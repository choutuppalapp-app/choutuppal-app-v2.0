const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const url = "postgresql://postgres.poedhagheehegfyogkaq:Pwmd%40786078@aws-1-ap-south-1.pooler.supabase.com:5432/postgres?sslmode=require"

const prisma = new PrismaClient({
  datasources: {
    db: {
      url
    }
  }
})

async function main() {
  console.log('Seeding Supabase database...')

  // 1. Create or update Admin User
  const email = 'admin@choutuppal.in'
  const passwordHash = bcrypt.hashSync('Admin@123', 10)
  
  const adminUser = await prisma.user.upsert({
    where: { email },
    update: {
      passwordHash,
      role: 'ADMIN',
      planTier: 'PREMIUM'
    },
    create: {
      email,
      username: 'admin',
      name: 'System Admin',
      passwordHash,
      role: 'ADMIN',
      planTier: 'PREMIUM',
      isPublic: true
    }
  })
  console.log('Admin user verified/created:', adminUser.email)

  // 2. Seed 18 Villages
  const villages = [
    'Choutuppal',
    'Kondamadugu',
    'Athvelly',
    'Bibinagar',
    'Bhongir',
    'Chowdarpally',
    'Dandumailaram',
    'Guduru',
    'Keesara',
    'Kondapur',
    'Madaram',
    'Maheshwaram',
    'Manchala',
    'Pochampally',
    'Ragannaguda',
    'Ramannapet',
    'Thurkapally',
    'Yadadri'
  ]
  
  console.log('Seeding villages...')
  for (const name of villages) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    await prisma.village.upsert({
      where: { name },
      update: {},
      create: {
        name,
        slug,
        district: 'Yadadri Bhuvanagiri',
        state: 'Telangana'
      }
    })
  }
  console.log('Villages seeded successfully.')

  // 3. Seed Default Categories
  const categories = [
    { name: 'Education', slug: 'education', icon: 'graduation-cap', description: 'Schools, colleges, coaching centers and education services' },
    { name: 'Real Estate', slug: 'real-estate', icon: 'building', description: 'Properties, plots, houses, apartments for rent and sale' },
    { name: 'Health & Medical', slug: 'health-medical', icon: 'heart-pulse', description: 'Hospitals, clinics, pharmacies and health services' },
    { name: 'Shopping', slug: 'shopping', icon: 'shopping-bag', description: 'Retail shops, supermarkets, clothing, electronics and malls' },
    { name: 'Food & Dining', slug: 'food-dining', icon: 'utensils', description: 'Restaurants, hotels, cafes, bakeries and food delivery' },
    { name: 'Agriculture', slug: 'agriculture', icon: 'sprout', description: 'Farming services, seeds, fertilizers, machinery and nurseries' },
    { name: 'Transport', slug: 'transport', icon: 'truck', description: 'Taxis, auto-rickshaws, cargo shipping, logistics and travel agencies' },
    { name: 'Services', slug: 'services', icon: 'briefcase', description: 'Electricians, plumbers, mechanics, legal advice and local experts' }
  ]

  console.log('Seeding categories...')
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description
      }
    })
  }
  console.log('Categories seeded successfully.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
