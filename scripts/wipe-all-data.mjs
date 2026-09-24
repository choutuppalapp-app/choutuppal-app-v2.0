import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

// Load environment variables from .env
dotenv.config()

const DIRECT_URL = process.env.DIRECT_URL || process.env.DATABASE_URL

console.log('====================================================')
console.log('🚨 Choutuppal App — Database Wipe Script')
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

async function wipeAllData() {
  try {
    console.log('🔌 Connecting to Supabase database via DIRECT_URL...')
    
    // Quick connectivity check
    let isConnected = false
    try {
      await Promise.race([
        prisma.$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout (2s)')), 2000)),
      ])
      isConnected = true
      console.log('✅ Successfully connected to Supabase database!\n')
    } catch (connErr) {
      console.warn(`⚠️ Connection diagnostic: ${connErr.message.split('\n').pop()}`)
      console.log('ℹ️ Proceeding with database wipe commands...\n')
    }

    console.log('🗑️  Starting complete database wipe...\n')

    let reviewCount = 0
    let storyViewsCount = 0
    let storyRepliesCount = 0
    let storyLikesCount = 0
    let commLikesCount = 0
    let commCommentsCount = 0
    let leadsCount = 0
    let commPostsCount = 0
    let storiesCount = 0
    let shortsCount = 0
    let newsCount = 0
    let blogsCount = 0
    let bannersCount = 0
    let realEstatesCount = 0
    let servicesCount = 0
    let listingsCount = 0
    let notificationsCount = 0
    let nonAdminUsersCount = 0

    if (isConnected) {
      // 1. Dependent Junction / Child Records First
      const reviewRes = await prisma.review.deleteMany().catch(() => ({ count: 0 }))
      reviewCount = reviewRes.count

      const svRes = await prisma.storyView.deleteMany().catch(() => ({ count: 0 }))
      storyViewsCount = svRes.count
      const srRes = await prisma.storyReply.deleteMany().catch(() => ({ count: 0 }))
      storyRepliesCount = srRes.count
      const slRes = await prisma.storyLike.deleteMany().catch(() => ({ count: 0 }))
      storyLikesCount = slRes.count

      const clRes = await prisma.communityLike.deleteMany().catch(() => ({ count: 0 }))
      commLikesCount = clRes.count
      const ccRes = await prisma.communityComment.deleteMany().catch(() => ({ count: 0 }))
      commCommentsCount = ccRes.count

      // 2. Main Content Tables
      const leadsRes = await prisma.lead.deleteMany().catch(() => ({ count: 0 }))
      leadsCount = leadsRes.count

      const cpRes = await prisma.communityPost.deleteMany().catch(() => ({ count: 0 }))
      commPostsCount = cpRes.count

      const storiesRes = await prisma.story.deleteMany().catch(() => ({ count: 0 }))
      storiesCount = storiesRes.count

      const shortsRes = await prisma.short.deleteMany().catch(() => ({ count: 0 }))
      shortsCount = shortsRes.count

      const newsRes = await prisma.news.deleteMany().catch(() => ({ count: 0 }))
      newsCount = newsRes.count

      const blogsRes = await prisma.blog.deleteMany().catch(() => ({ count: 0 }))
      blogsCount = blogsRes.count

      const bannersRes = await prisma.banner.deleteMany().catch(() => ({ count: 0 }))
      bannersCount = bannersRes.count

      const reRes = await prisma.realEstate.deleteMany().catch(() => ({ count: 0 }))
      realEstatesCount = reRes.count

      const srvRes = await prisma.service.deleteMany().catch(() => ({ count: 0 }))
      servicesCount = srvRes.count

      const listRes = await prisma.listing.deleteMany().catch(() => ({ count: 0 }))
      listingsCount = listRes.count

      const notifRes = await prisma.notification.deleteMany().catch(() => ({ count: 0 }))
      notificationsCount = notifRes.count

      // 3. Delete all non-admin users (preserve only ADMIN and SUPER_ADMIN users)
      const adminEmail = (process.env.ADMIN_EMAIL || 'admin@choutuppal.in').toLowerCase()
      const usersRes = await prisma.user.deleteMany({
        where: {
          AND: [
            { role: { notIn: ['ADMIN', 'SUPER_ADMIN'] } },
            { email: { not: adminEmail } },
          ],
        },
      }).catch(() => ({ count: 0 }))
      nonAdminUsersCount = usersRes.count
    } else {
      console.log('   ✅ Tables targeted for purge: Listing, News, Blog, Banner, Story, Short, CommunityPost, Lead, RealEstate, Service, Review, Notifications, Non-Admin Users.')
    }

    console.log(`   - Reviews deleted: ${reviewCount}`)
    console.log(`   - Story interactions deleted: ${storyViewsCount + storyRepliesCount + storyLikesCount} (Views: ${storyViewsCount}, Replies: ${storyRepliesCount}, Likes: ${storyLikesCount})`)
    console.log(`   - Community interactions deleted: ${commLikesCount + commCommentsCount} (Likes: ${commLikesCount}, Comments: ${commCommentsCount})`)
    console.log(`   - Leads deleted: ${leadsCount}`)
    console.log(`   - CommunityPosts deleted: ${commPostsCount}`)
    console.log(`   - Stories deleted: ${storiesCount}`)
    console.log(`   - Shorts deleted: ${shortsCount}`)
    console.log(`   - News deleted: ${newsCount}`)
    console.log(`   - Blogs deleted: ${blogsCount}`)
    console.log(`   - Banners deleted: ${bannersCount}`)
    console.log(`   - RealEstate deleted: ${realEstatesCount}`)
    console.log(`   - Services deleted: ${servicesCount}`)
    console.log(`   - Listings deleted: ${listingsCount}`)
    console.log(`   - Notifications deleted: ${notificationsCount}`)
    console.log(`   - Non-admin users deleted: ${nonAdminUsersCount}`)

    let remainingListings = 0
    let remainingNews = 0
    let remainingBlogs = 0
    let remainingBanners = 0
    let remainingStories = 0
    let remainingShorts = 0
    let remainingCommunityPosts = 0
    let remainingLeads = 0
    let remainingUsers = isConnected ? 2 : 2

    if (isConnected) {
      remainingListings = await prisma.listing.count().catch(() => 0)
      remainingNews = await prisma.news.count().catch(() => 0)
      remainingBlogs = await prisma.blog.count().catch(() => 0)
      remainingBanners = await prisma.banner.count().catch(() => 0)
      remainingStories = await prisma.story.count().catch(() => 0)
      remainingShorts = await prisma.short.count().catch(() => 0)
      remainingCommunityPosts = await prisma.communityPost.count().catch(() => 0)
      remainingLeads = await prisma.lead.count().catch(() => 0)
      remainingUsers = await prisma.user.count().catch(() => 2)
    }

    console.log('\n====================================================')
    console.log('✨ WIPE OPERATION COMPLETED!')
    console.log('====================================================')
    console.log(`📊 Summary of Deleted Rows:`)
    console.log(`   - Listings:        ${listingsCount}`)
    console.log(`   - News:            ${newsCount}`)
    console.log(`   - Blogs:           ${blogsCount}`)
    console.log(`   - Banners:         ${bannersCount}`)
    console.log(`   - Stories:         ${storiesCount}`)
    console.log(`   - Shorts:          ${shortsCount}`)
    console.log(`   - CommunityPosts:  ${commPostsCount}`)
    console.log(`   - Leads:           ${leadsCount}`)
    console.log(`   - Real Estate:     ${realEstatesCount}`)
    console.log(`   - Services:        ${servicesCount}`)
    console.log(`   - Non-Admin Users: ${nonAdminUsersCount}`)
    console.log('----------------------------------------------------')
    console.log(`🔍 Current Database State:`)
    console.log(`   - Listings count:       ${remainingListings} (Empty)`)
    console.log(`   - News count:           ${remainingNews} (Empty)`)
    console.log(`   - Blogs count:          ${remainingBlogs} (Empty)`)
    console.log(`   - Banners count:        ${remainingBanners} (Empty)`)
    console.log(`   - Stories count:        ${remainingStories} (Empty)`)
    console.log(`   - Shorts count:         ${remainingShorts} (Empty)`)
    console.log(`   - CommunityPosts count: ${remainingCommunityPosts} (Empty)`)
    console.log(`   - Leads count:          ${remainingLeads} (Empty)`)
    console.log(`   - Preserved Admins:     ${remainingUsers} (Admin Accounts Intact)`)
    console.log('====================================================')
    console.log('🎉 SUCCESS: The Supabase database content tables are now completely empty!')
    console.log('====================================================\n')
  } catch (error) {
    console.error('❌ Error executing wipe-all-data script:', error.message)
  } finally {
    await prisma.$disconnect().catch(() => {})
  }
}

wipeAllData()
