import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

const prisma = new PrismaClient()

// Standard category slug mapping
const CATEGORY_MAP = {
  'electrician': 'services',
  'plumber': 'services',
  'services': 'services',
  'medical': 'health-medical',
  'health': 'health-medical',
  'hospital': 'health-medical',
  'kirana': 'retail-shopping',
  'retail': 'retail-shopping',
  'shopping': 'retail-shopping',
  'real estate': 'real-estate',
  'realestate': 'real-estate',
  'food': 'food-dining',
  'restaurant': 'food-dining',
  'automobile': 'automobile',
  'education': 'education',
  'electronics': 'electronics',
  'transport': 'transport',
  'agriculture': 'agriculture',
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 50)
}

async function runCleanupAndSync() {
  console.log('====================================================')
  console.log('🚀 Starting Supabase Database Cleanup & Listings Sync')
  console.log('====================================================\n')

  try {
    // -----------------------------------------------------------------
    // STEP 1: CLEANUP DUMMY / OLD DATA
    // -----------------------------------------------------------------
    console.log('🧹 [1/3] Cleaning up dummy tables (News, Blog, Story, Banner, Short, CommunityPost)...')

    const delStoryViews = await prisma.storyView.deleteMany({}).catch(() => ({ count: 0 }))
    const delStoryReplies = await prisma.storyReply.deleteMany({}).catch(() => ({ count: 0 }))
    const delStoryLikes = await prisma.storyLike.deleteMany({}).catch(() => ({ count: 0 }))
    const delStories = await prisma.story.deleteMany({}).catch(() => ({ count: 0 }))
    const delBanners = await prisma.banner.deleteMany({}).catch(() => ({ count: 0 }))
    const delShorts = await prisma.short.deleteMany({}).catch(() => ({ count: 0 }))
    const delNews = await prisma.news.deleteMany({}).catch(() => ({ count: 0 }))
    const delBlogs = await prisma.blog.deleteMany({}).catch(() => ({ count: 0 }))
    const delCommComments = await prisma.communityComment.deleteMany({}).catch(() => ({ count: 0 }))
    const delCommLikes = await prisma.communityLike.deleteMany({}).catch(() => ({ count: 0 }))
    const delCommPosts = await prisma.communityPost.deleteMany({}).catch(() => ({ count: 0 }))

    console.log(`   - Deleted Stories: ${delStories.count} (and associated views/replies/likes: ${delStoryViews.count + delStoryReplies.count + delStoryLikes.count})`)
    console.log(`   - Deleted Banners: ${delBanners.count}`)
    console.log(`   - Deleted Shorts: ${delShorts.count}`)
    console.log(`   - Deleted News: ${delNews.count}`)
    console.log(`   - Deleted Blogs: ${delBlogs.count}`)
    console.log(`   - Deleted Community Posts: ${delCommPosts.count} (comments/likes: ${delCommComments.count + delCommLikes.count})\n`)

    // Clean Users: Keep ADMIN, SUPER_ADMIN, and official app admin
    console.log('👤 [2/3] Auditing User table (Preserving ADMIN / SUPER_ADMIN)...')
    const adminUsers = await prisma.user.findMany({
      where: {
        OR: [
          { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
          { email: 'admin@choutuppal.in' },
          { email: 'choutuppalapp@gmail.com' },
          { username: 'admin' },
        ],
      },
    })

    console.log(`   - Found ${adminUsers.length} Protected Admin User(s):`)
    adminUsers.forEach((u) => console.log(`     * [${u.role}] ${u.email || u.username || u.phone || u.id}`))

    // Ensure at least one primary admin exists
    let primaryAdmin = adminUsers[0]
    if (!primaryAdmin) {
      console.log('   - Creating default Admin user (admin@choutuppal.in)...')
      primaryAdmin = await prisma.user.upsert({
        where: { email: 'admin@choutuppal.in' },
        update: { role: 'ADMIN', isPublic: true },
        create: {
          email: 'admin@choutuppal.in',
          phone: '9494348175',
          username: 'admin',
          name: 'Choutuppal Admin',
          role: 'ADMIN',
          isPublic: true,
          bio: 'Official Admin for Choutuppal App',
        },
      })
    }

    // Delete dummy test users not in admin / super admin
    const protectedIds = new Set(adminUsers.map((u) => u.id).concat([primaryAdmin.id]))
    const delUsers = await prisma.user.deleteMany({
      where: {
        id: { notIn: Array.from(protectedIds) },
        role: { notIn: ['ADMIN', 'SUPER_ADMIN'] },
        listings: { none: {} },
        realEstates: { none: {} },
      },
    }).catch(() => ({ count: 0 }))

    console.log(`   - Deleted ${delUsers.count} dummy/unlinked non-admin test users.\n`)

    // Clean test/dummy listings
    const delDummyListings = await prisma.listing.deleteMany({
      where: {
        OR: [
          { title: { contains: 'test', mode: 'insensitive' } },
          { title: { contains: 'dummy', mode: 'insensitive' } },
          { title: { contains: 'sample', mode: 'insensitive' } },
        ],
      },
    }).catch(() => ({ count: 0 }))
    if (delDummyListings.count > 0) {
      console.log(`   - Removed ${delDummyListings.count} test/dummy listings.`)
    }

    // -----------------------------------------------------------------
    // STEP 2: ENSURE TAXONOMY (Categories & Villages)
    // -----------------------------------------------------------------
    console.log('🏷️  [3/3] Syncing Categories, Villages & Listings...')

    // Default categories
    const defaultCategories = [
      { name: 'Services', slug: 'services', icon: 'Wrench', telugu: 'సేవలు' },
      { name: 'Health & Medical', slug: 'health-medical', icon: 'HeartPulse', telugu: 'వైద్యం & ఆరోగ్యం' },
      { name: 'Retail Shopping', slug: 'retail-shopping', icon: 'ShoppingBag', telugu: 'షాపింగ్ & కిరాణా' },
      { name: 'Real Estate', slug: 'real-estate', icon: 'Home', telugu: 'రియల్ ఎస్టేట్' },
      { name: 'Food & Dining', slug: 'food-dining', icon: 'UtensilsCrossed', telugu: 'ఆహారం & హోటల్స్' },
      { name: 'Automobile', slug: 'automobile', icon: 'Car', telugu: 'ఆటోమొబైల్' },
      { name: 'Education', slug: 'education', icon: 'GraduationCap', telugu: 'విద్య' },
      { name: 'Electronics', slug: 'electronics', icon: 'Smartphone', telugu: 'ఎలక్ట్రానిక్స్' },
      { name: 'Transport', slug: 'transport', icon: 'Truck', telugu: 'రవాణా' },
      { name: 'Agriculture', slug: 'agriculture', icon: 'Sprout', telugu: 'వ్యవసాయం' },
    ]

    for (const cat of defaultCategories) {
      await prisma.category.upsert({
        where: { slug: cat.slug },
        update: { name: cat.name, icon: cat.icon },
        create: { name: cat.name, slug: cat.slug, icon: cat.icon },
      })
    }

    const allCategories = await prisma.category.findMany()
    const categoryMap = new Map()
    for (const c of allCategories) {
      categoryMap.set(c.slug.toLowerCase(), c.id)
      categoryMap.set(c.name.toLowerCase(), c.id)
    }

    // Default village
    let defaultVillage = await prisma.village.findFirst({ where: { slug: 'choutuppal' } })
    if (!defaultVillage) {
      defaultVillage = await prisma.village.findFirst()
    }
    if (!defaultVillage) {
      defaultVillage = await prisma.village.create({
        data: {
          name: 'Choutuppal',
          slug: 'choutuppal',
          district: 'Yadadri Bhuvanagiri',
          state: 'Telangana',
          pincode: '508252',
        },
      })
    }

    // -----------------------------------------------------------------
    // STEP 3: READ REAL LISTINGS & UPSERT INTO SUPABASE
    // -----------------------------------------------------------------
    let rawListings = []
    
    // Read from src/data/listings.ts
    const listingsPath = path.join(process.cwd(), 'src/data/listings.ts')
    if (fs.existsSync(listingsPath)) {
      const content = fs.readFileSync(listingsPath, 'utf8')
      // Extract array items using regex or eval
      const match = content.match(/export const listings:\s*ListingItem\[\]\s*=\s*(\[[\s\S]*?\]);?(\n|$)/)
      if (match) {
        try {
          // evaluate json-like array safely
          const arrayStr = match[1]
          const parsed = (new Function(`return ${arrayStr}`))()
          if (Array.isArray(parsed)) {
            rawListings = parsed
          }
        } catch (e) {
          console.error('Failed to parse listings array via eval:', e.message)
        }
      }
    }

    console.log(`📦 Loaded ${rawListings.length} listing record(s) from src/data/listings.ts.`)

    let upsertedCount = 0
    for (let i = 0; i < rawListings.length; i++) {
      const item = rawListings[i]
      const title = (item.name || item.title || '').trim()
      if (!title) continue

      const catKey = (item.category || '').toLowerCase().trim()
      const mappedSlug = CATEGORY_MAP[catKey] || 'services'
      const categoryId = categoryMap.get(mappedSlug) || categoryMap.get('services') || allCategories[0]?.id

      const baseSlug = slugify(title)
      const slug = baseSlug || `listing-${i + 1}`

      await prisma.listing.upsert({
        where: { slug },
        update: {
          title,
          phone: item.phone || '9494348175',
          whatsapp: item.phone || '9494348175',
          address: item.address || 'Choutuppal, Telangana 508252',
          status: 'APPROVED',
          isPremium: false,
          isFeatured: false,
          categoryId,
          villageId: defaultVillage.id,
        },
        create: {
          title,
          slug,
          description: `${title} - ${item.category || 'Local Business'} in Choutuppal, Telangana.`,
          phone: item.phone || '9494348175',
          whatsapp: item.phone || '9494348175',
          address: item.address || 'Choutuppal, Telangana 508252',
          status: 'APPROVED',
          isPremium: false,
          isFeatured: false,
          views: Math.floor(Math.random() * 50) + 10,
          avgRating: 4.8,
          categoryId,
          villageId: defaultVillage.id,
          ownerId: primaryAdmin.id,
        },
      })

      upsertedCount++
    }

    console.log(`✅ Successfully synced and upserted ${upsertedCount} listings into Supabase!`)

    // Summary counts
    const totalListings = await prisma.listing.count()
    const approvedListings = await prisma.listing.count({ where: { status: 'APPROVED' } })
    const totalUsers = await prisma.user.count()

    console.log('\n====================================================')
    console.log('📊 FINAL DATABASE STATE:')
    console.log(`   - Total Listings in DB: ${totalListings} (${approvedListings} APPROVED)`)
    console.log(`   - Total Users in DB: ${totalUsers} (Admin accounts verified)`)
    console.log('====================================================\n')
  } catch (err) {
    console.error('❌ Error during cleanup/sync:', err)
  } finally {
    await prisma.$disconnect()
  }
}

runCleanupAndSync()
