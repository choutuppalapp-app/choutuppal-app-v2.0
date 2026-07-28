/**
 * Choutuppal App v2.0 — idempotent seed script.
 *
 * Creates real taxonomy (categories + villages), a demo business-owner user,
 * and representative listings / real estate / stories / banners / shorts so the
 * Home page renders with genuine content. Safe to re-run (upserts by slug /
 * unique key).
 *
 *   bun prisma/seed.ts
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()
const DEMO_PASSWORD = 'demo1234'

function hoursFromNow(h: number): Date {
  return new Date(Date.now() + h * 60 * 60 * 1000)
}
function daysFromNow(d: number): Date {
  return new Date(Date.now() + d * 24 * 60 * 60 * 1000)
}

async function main() {
  // -------------------------------------------------------------------
  // Villages — the 18 villages of Choutuppal mandal, Yadadri Bhuvanagiri,
  // Telangana. Old dummy entries (Bhongir, Alair, etc.) are deleted first.
  // -------------------------------------------------------------------
  const villages = [
    { name: 'Allapur', slug: 'allapur', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
    { name: 'Chinna Kondur', slug: 'chinna-kondur', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
    { name: 'Devalamma Nagaram', slug: 'devalamma-nagaram', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
    { name: 'Jai Kesaram', slug: 'jai-kesaram', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
    { name: 'Khairathpur', slug: 'khairathpur', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
    { name: 'Koyalagudem', slug: 'koyalagudem', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
    { name: 'Lakkaram', slug: 'lakkaram', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
    { name: 'Lingoji Guda', slug: 'lingoji-guda', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
    { name: 'Malkapur', slug: 'malkapur', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
    { name: 'Nelapatla', slug: 'nelapatla', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
    { name: 'Panthangi', slug: 'panthangi', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
    { name: 'Peddakondur', slug: 'peddakondur', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
    { name: 'Peepal Pahad', slug: 'peepal-pahad', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
    { name: 'Swamulavari Lingotam', slug: 'swamulavari-lingotam', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
    { name: 'Tallasingaram', slug: 'tallasingaram', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
    { name: 'Tangad Palle', slug: 'tangad-palle', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
    { name: 'Tupranpet', slug: 'tupranpet', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
    { name: 'Yellagiri', slug: 'yellagiri', district: 'Yadadri Bhuvanagiri', state: 'Telangana', pincode: '508252' },
  ]
  // Wipe old villages first (cascades to any FK references that allow it;
  // listings/realestate villageId are nullable, so they become null).
  await prisma.village.deleteMany({})
  for (const v of villages) {
    await prisma.village.create({ data: v })
  }

  // -------------------------------------------------------------------
  // Categories (listing taxonomy)
  // -------------------------------------------------------------------
  const categories = [
    { name: 'Restaurants & Tiffin', slug: 'restaurants', icon: 'UtensilsCrossed' },
    { name: 'Medical & Pharmacy', slug: 'medical', icon: 'Pill' },
    { name: 'Electronics & Mobiles', slug: 'electronics', icon: 'Smartphone' },
    { name: 'Groceries & Supermarket', slug: 'groceries', icon: 'ShoppingCart' },
    { name: 'Education', slug: 'education', icon: 'GraduationCap' },
    { name: 'Automobile', slug: 'automobile', icon: 'Car' },
    { name: 'Fashion & Textiles', slug: 'fashion', icon: 'Shirt' },
    { name: 'Health & Fitness', slug: 'health', icon: 'HeartPulse' },
  ]
  for (const c of categories) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    })
  }

  // -------------------------------------------------------------------
  // Demo owner user (with a known password so the login flow is testable).
  //   email:    demo@choutuppal.app
  //   password: demo1234
  // -------------------------------------------------------------------
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)
  const owner = await prisma.user.upsert({
    where: { email: 'demo@choutuppal.app' },
    update: { passwordHash, role: 'ADMIN', isPublic: true },
    create: {
      email: 'demo@choutuppal.app',
      phone: '+919441348175',
      username: 'choutuppal_demo',
      name: 'Choutuppal Demo',
      role: 'ADMIN',
      isPublic: true,
      passwordHash,
      bio: 'Official demo account for Choutuppal App.',
      villageId: (await prisma.village.findUnique({ where: { slug: 'panthangi' } }))!.id,
    },
  })

  // -------------------------------------------------------------------
  // Test user (normal USER role, non-premium, public profile).
  //   email:    user@choutuppal.app
  //   password: user1234
  // Used to test the non-premium story flow and community interactions.
  // -------------------------------------------------------------------
  const userPasswordHash = await bcrypt.hash('user1234', 12)
  await prisma.user.upsert({
    where: { email: 'user@choutuppal.app' },
    update: { passwordHash: userPasswordHash, role: 'USER', isPublic: true, planTier: 'FREE' },
    create: {
      email: 'user@choutuppal.app',
      phone: '+919912353706',
      username: 'test_user',
      name: 'Test User',
      role: 'USER',
      isPublic: true,
      planTier: 'FREE',
      passwordHash: userPasswordHash,
      bio: 'Test user for trying out the community and stories.',
      villageId: (await prisma.village.findUnique({ where: { slug: 'panthangi' } }))!.id,
    },
  })

  // -------------------------------------------------------------------
  // Agent user (AGENT role, can access /agent panel).
  //   email:    agenttest@choutuppal.app
  //   password: agent123
  // -------------------------------------------------------------------
  const agentPasswordHash = await bcrypt.hash('agent123', 12)
  await prisma.user.upsert({
    where: { email: 'agenttest@choutuppal.app' },
    update: { passwordHash: agentPasswordHash, role: 'AGENT', isPublic: true, planTier: 'PRO' },
    create: {
      email: 'agenttest@choutuppal.app',
      phone: '+919912353707',
      username: 'test_agent',
      name: 'Test Agent',
      role: 'AGENT',
      isPublic: true,
      planTier: 'PRO',
      passwordHash: agentPasswordHash,
      bio: 'Test agent for CSV uploads and lead tracking.',
      villageId: (await prisma.village.findUnique({ where: { slug: 'panthangi' } }))!.id,
    },
  })

  const panthangi = (await prisma.village.findUnique({ where: { slug: 'panthangi' } }))!
  const malkapur = (await prisma.village.findUnique({ where: { slug: 'malkapur' } }))!
  const peddakondur = (await prisma.village.findUnique({ where: { slug: 'peddakondur' } }))!

  const cat = (slug: string) =>
    prisma.category.findUnique({ where: { slug } })

  // -------------------------------------------------------------------
  // Listings (real-sounding local businesses)
  // -------------------------------------------------------------------
  const listings = [
    {
      slug: 'sri-lakshmi-tiffin-center',
      title: 'Sri Lakshmi Tiffin Center',
      description: 'Famous for hot idli, dosa, upma & filter coffee. Morning tiffin & evening snacks served fresh daily since 2008.',
      phone: '9441348175',
      whatsapp: '919441348175',
      address: 'Main Road, Panthangi, Yadadri Bhuvanagiri',
      categoryId: (await cat('restaurants'))!.id,
      villageId: panthangi.id,
      isFeatured: true,
    },
    {
      slug: 'choutuppal-medical-hall',
      title: 'Choutuppal Medical Hall',
      description: '24x7 pharmacy with allopathic & ayurvedic medicines, surgical supplies and free home delivery within Choutuppal.',
      phone: '9912353706',
      whatsapp: '919912353706',
      address: 'Bus Stand Road, Panthangi',
      categoryId: (await cat('medical'))!.id,
      villageId: panthangi.id,
      isFeatured: true,
    },
    {
      slug: 'sri-venkateswara-mobiles',
      title: 'Sri Venkateswara Mobiles',
      description: 'Authorized mobile retailer — latest smartphones, accessories, recharges & quick repairs. EMI available.',
      phone: '9912353707',
      whatsapp: '919912353707',
      address: 'SRT Road, Panthangi',
      categoryId: (await cat('electronics'))!.id,
      villageId: panthangi.id,
      isFeatured: true,
    },
    {
      slug: 'anand-super-bazaar',
      title: 'Anand Super Bazaar',
      description: 'Groceries, household items & fresh vegetables at wholesale prices. Monthly ration kits for families.',
      phone: '9912353708',
      whatsapp: '919912353708',
      address: 'Market Yard, Panthangi',
      categoryId: (await cat('groceries'))!.id,
      villageId: panthangi.id,
      isFeatured: true,
    },
    {
      slug: 'sri-sai-vidya-niketan',
      title: 'Sri Sai Vidya Niketan School',
      description: 'CBSE-affiliated school from LKG to 10th. Smart classrooms, experienced faculty & bus transport across villages.',
      phone: '9912353709',
      whatsapp: '919912353709',
      address: 'Yadadri Road, Panthangi',
      categoryId: (await cat('education'))!.id,
      villageId: panthangi.id,
      isFeatured: false,
    },
    {
      slug: 'reddy-automobiles',
      title: 'Reddy Automobiles',
      description: 'Two-wheeler & four-wheeler service center. Genuine spare parts, cashless insurance claims & bike sales.',
      phone: '9912353710',
      whatsapp: '919912353710',
      address: 'Hyderabad Highway, Panthangi',
      categoryId: (await cat('automobile'))!.id,
      villageId: panthangi.id,
      isFeatured: true,
    },
    {
      slug: 'lakshmi-ganapathi-textiles',
      title: 'Lakshmi Ganapathi Textiles',
      description: 'Sarees, mens wear, kids fashion & festival collections. Bulk orders for weddings and functions.',
      phone: '9912353711',
      whatsapp: '919912353711',
      address: 'Clock Tower, Panthangi',
      categoryId: (await cat('fashion'))!.id,
      villageId: panthangi.id,
      isFeatured: false,
    },
    {
      slug: 'sri-venkateswara-clinic',
      title: 'Sri Venkateswara Clinic',
      description: 'General physician & pediatric care. Daily 5-6 new patients via the app. OPD 9am-9pm.',
      phone: '9912353712',
      whatsapp: '919912353712',
      address: 'Hospital Road, Panthangi',
      categoryId: (await cat('health'))!.id,
      villageId: panthangi.id,
      isFeatured: true,
    },
  ]

  for (const l of listings) {
    await prisma.listing.upsert({
      where: { slug: l.slug },
      update: {},
      create: {
        ...l,
        status: 'APPROVED',
        servicesCatalog: [
          { name: 'Primary Service', price: '₹100', description: l.description.slice(0, 60) },
        ],
        businessHours: { mon: { open: '09:00', close: '21:00' } },
        views: Math.floor(Math.random() * 500) + 50,
        ownerId: owner.id,
      },
    })
  }

  // -------------------------------------------------------------------
  // Real Estate
  // -------------------------------------------------------------------
  const realEstates = [
    {
      slug: '3bhk-house-sale-choutuppal',
      title: '3BHK Independent House for Sale',
      description: 'Spacious 3BHK house with car parking, 2 balconies and borewell water. Prime residential area near bus stand.',
      type: 'HOUSE',
      listingType: 'SALE',
      price: 4500000,
      areaSqft: 1450,
      bedrooms: 3,
      bathrooms: 2,
      address: 'Near Bus Stand, Panthangi',
      villageId: panthangi.id,
    },
    {
      slug: 'open-plot-200sqyd-malkapur',
      title: 'Open Plot 200 sq.yd — Malkapur',
      description: 'Corner plot facing east, DTCP approved, ready for construction. Walkable to main road.',
      type: 'PLOT',
      listingType: 'SALE',
      price: 1800000,
      areaSqft: 1800,
      address: 'Main Road, Malkapur',
      villageId: malkapur.id,
    },
    {
      slug: '2bhk-rent-peddakondur',
      title: '2BHK Flat for Rent',
      description: 'Semi-furnished 2BHK on 2nd floor, lift facility, 24h water. Family/bachelors preferred.',
      type: 'APARTMENT',
      listingType: 'RENT',
      price: 12000,
      areaSqft: 950,
      bedrooms: 2,
      bathrooms: 2,
      furnished: true,
      address: 'Balaji Nagar, Peddakondur',
      villageId: peddakondur.id,
    },
    {
      slug: 'commercial-shop-rent-panthangi',
      title: 'Commercial Shop for Rent',
      description: 'Road-facing 400 sqft shop on Main Road — ideal for retail, clinic or showroom. High footfall.',
      type: 'COMMERCIAL',
      listingType: 'RENT',
      price: 25000,
      areaSqft: 400,
      address: 'Main Road, Panthangi',
      villageId: panthangi.id,
    },
  ]
  for (const r of realEstates) {
    await prisma.realEstate.upsert({
      where: { slug: r.slug },
      update: {},
      create: {
        ...r,
        status: 'APPROVED',
        contactPhone: '9441348175',
        contactWhatsapp: '919441348175',
        views: Math.floor(Math.random() * 300) + 20,
        ownerId: owner.id,
      },
    })
  }

  // -------------------------------------------------------------------
  // Stories (active, expire in 12-20h) — mediaUrl empty => UI shows gradient
  // -------------------------------------------------------------------
  const storySeeds = [
    { caption: 'New dosa variant launch today!', mediaType: 'IMAGE' },
    { caption: 'Monsoon offer — 20% off', mediaType: 'IMAGE' },
    { caption: 'Free home delivery now live', mediaType: 'VIDEO' },
    { caption: 'Grand opening: new branch', mediaType: 'IMAGE' },
    { caption: 'Festive saree collection', mediaType: 'IMAGE' },
    { caption: 'Free health checkup camp', mediaType: 'VIDEO' },
  ]
  // Wipe & reseed stories so expiry stays fresh across re-runs.
  await prisma.story.deleteMany({})
  for (const s of storySeeds) {
    await prisma.story.create({
      data: {
        mediaUrl: '',
        mediaType: s.mediaType,
        caption: s.caption,
        link: '/',
        expiresAt: hoursFromNow(12 + Math.floor(Math.random() * 8)),
        ownerId: owner.id,
      },
    })
  }

  // -------------------------------------------------------------------
  // Banners (active, expire in ~24h)
  // -------------------------------------------------------------------
  const bannerSeeds = [
    { title: 'Promote Your Business — ₹99/day', position: 'HOME_TOP', link: '/dashboard' },
    { title: 'Spin & Win Exciting Rewards', position: 'HOME_MIDDLE', link: '/#spin' },
    { title: 'List Your Property Free', position: 'SIDEBAR', link: '/dashboard' },
  ]
  await prisma.banner.deleteMany({})
  for (const b of bannerSeeds) {
    await prisma.banner.create({
      data: {
        imageUrl: '',
        title: b.title,
        link: b.link,
        position: b.position,
        status: 'APPROVED',
        expiresAt: hoursFromNow(24 + Math.floor(Math.random() * 4)),
        ownerId: owner.id,
      },
    })
  }

  // -------------------------------------------------------------------
  // Shorts (YouTube)
  // -------------------------------------------------------------------
  const shortSeeds = [
    { title: 'Choutuppal market walkthrough', youtubeId: 'dQw4w9WgXcQ' },
    { title: 'Yadadri temple darshan', youtubeId: 'dQw4w9WgXcQ' },
    { title: 'Local food trail', youtubeId: 'dQw4w9WgXcQ' },
    { title: 'Real estate tour', youtubeId: 'dQw4w9WgXcQ' },
  ]
  await prisma.short.deleteMany({})
  for (const s of shortSeeds) {
    await prisma.short.create({
      data: {
        videoUrl: `https://www.youtube.com/watch?v=${s.youtubeId}`,
        youtubeId: s.youtubeId,
        title: s.title,
        thumbnail: `https://i.ytimg.com/vi/${s.youtubeId}/hqdefault.jpg`,
        views: Math.floor(Math.random() * 2000) + 100,
        likes: Math.floor(Math.random() * 200) + 10,
        ownerId: owner.id,
      },
    })
  }

  // -------------------------------------------------------------------
  // Spin prizes + Settings
  // -------------------------------------------------------------------
  await prisma.spinPrize.deleteMany({})
  const prizes = [
    { label: '₹50 Cashback', type: 'CASHBACK', value: '50', probability: 25 },
    { label: '10% Discount', type: 'DISCOUNT', value: '10', probability: 30 },
    { label: 'Free Banner Ad', type: 'MERCH', value: 'banner', probability: 5 },
    { label: 'Try Again', type: 'NONE', value: null, probability: 30 },
    { label: '₹100 Cashback', type: 'CASHBACK', value: '100', probability: 10 },
  ]
  for (const p of prizes) {
    await prisma.spinPrize.create({ data: { ...p, isActive: true } })
  }

  await prisma.setting.upsert({
    where: { key: 'spin_enabled' },
    update: {},
    create: { key: 'spin_enabled', value: 'true' },
  })
  await prisma.setting.upsert({
    where: { key: 'banner_price' },
    update: {},
    create: { key: 'banner_price', value: '99' },
  })

  console.log('✅ Seed complete.')
  console.log(`   Villages: ${villages.length}, Categories: ${categories.length}`)
  console.log(`   Listings: ${listings.length}, RealEstate: ${realEstates.length}`)
  console.log(`   Stories: ${storySeeds.length}, Banners: ${bannerSeeds.length}, Shorts: ${shortSeeds.length}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
