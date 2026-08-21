// Force Update
import { getHomePageData } from '@/lib/home-data'
import { getCurrentUser } from '@/lib/session'
import { Ticker } from '@/components/home/ticker'
import { prisma } from '@/lib/prisma'
import { StickySocials } from '@/components/home/sticky-socials'
import nextDynamic from 'next/dynamic'

// Heavy client components — lazy-loaded to reduce initial JS bundle
const StoriesRail = nextDynamic(() => import('@/components/home/stories-rail').then(m => ({ default: m.StoriesRail })))
const BannerCarousel = nextDynamic(() => import('@/components/home/banner-carousel').then(m => ({ default: m.BannerCarousel })))
const CategoriesGrid = nextDynamic(() => import('@/components/home/categories-grid').then(m => ({ default: m.CategoriesGrid })))
const FeaturedRail = nextDynamic(() => import('@/components/home/featured-rail').then(m => ({ default: m.FeaturedRail })))
const RealEstateRail = nextDynamic(() => import('@/components/home/real-estate-rail').then(m => ({ default: m.RealEstateRail })))
const SendNewsCTA = nextDynamic(() => import('@/components/home/send-news-cta').then(m => ({ default: m.SendNewsCTA })))
const NewsGrid = nextDynamic(() => import('@/components/home/news-grid').then(m => ({ default: m.NewsGrid })))
const BlogGrid = nextDynamic(() => import('@/components/home/blog-grid').then(m => ({ default: m.BlogGrid })))
const SpinWin = nextDynamic(() => import('@/components/home/spin-win').then(m => ({ default: m.SpinWin })))
const Testimonials = nextDynamic(() => import('@/components/home/testimonials').then(m => ({ default: m.Testimonials })))
const PricingPlans = nextDynamic(() => import('@/components/home/pricing-plans').then(m => ({ default: m.PricingPlans })))
const AgentCityCTA = nextDynamic(() => import('@/components/home/agent-city-cta').then(m => ({ default: m.AgentCityCTA })))

// Home page using ISR 1-hour revalidation & force-static for instant Edge caching
export const revalidate = 3600
export const dynamic = 'force-static'

export default async function Home() {
  const data = await getHomePageData()
  let viewer: any = null
  try {
    viewer = await getCurrentUser()
  } catch (err) {
    console.error('[Home] getCurrentUser error:', err)
  }

  let spinEnabled = true
  try {
    const settingsList = await prisma.setting.findMany()
    const settings = settingsList.reduce((acc, row) => {
      acc[row.key] = row.value
      return acc
    }, {} as Record<string, string>)
    if (settings.spin_enabled === 'false') spinEnabled = false
  } catch (err) {
    console.error('[Home] settings query error:', err)
  }

  const viewerInfo = viewer
    ? {
        isLoggedIn: true,
        isPremium:
          viewer.planTier === 'PREMIUM' ||
          viewer.planTier === 'PRO' ||
          viewer.role === 'ADMIN' ||
          viewer.role === 'SUPER_ADMIN' ||
          viewer.role === 'AGENT',
      }
    : { isLoggedIn: false, isPremium: false }

  return (
    <div className="flex min-h-screen flex-col">
      <Ticker />
      <StickySocials />

      <main className="flex-1">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 sm:gap-7 px-3 py-4 sm:px-4 sm:py-6 lg:px-6">
          
          {/* 2. Categories Grid */}
          <CategoriesGrid categories={data.categories} />

          {/* 3. Top Local Businesses Grid */}
          <FeaturedRail listings={data.featured} />

          {/* 4. Stories & Banners */}
          <div className="relative w-full overflow-hidden">
            <StoriesRail stories={data.stories} viewer={viewerInfo} />
          </div>
          <BannerCarousel banners={data.banners} />

          {/* 5. Premium Properties Grid */}
          <RealEstateRail properties={data.realEstate} />

          {/* 6. Recent Blogs & News Section */}
          <SendNewsCTA />
          <NewsGrid articles={data.latestNews} />
          <BlogGrid blogs={data.latestBlogs} />

          {/* 7. Spin & Win */}
          {spinEnabled ? <SpinWin /> : null}

          {/* 8. Advertising & Monetization Section */}
          <div id="pricing">
            <PricingPlans />
          </div>
          <AgentCityCTA />

          {/* 9. Reviews (Testimonials) */}
          <Testimonials />

          {/* Explore anchor target (mobile bottom nav) */}
          <div id="explore" className="scroll-mt-20" />
        </div>
      </main>

      {/* Bottom padding so content isn't hidden behind the mobile bottom nav */}
      <div className="h-20 md:hidden" aria-hidden />
    </div>
  )
}

