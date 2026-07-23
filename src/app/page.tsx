import { getHomePageData } from '@/lib/home-data'
import { getCurrentUser } from '@/lib/session'
import { Ticker } from '@/components/home/ticker'
import { DiscoverSearch } from '@/components/home/discover-search'
import dynamic from 'next/dynamic'

// Heavy client components — lazy-loaded to reduce initial JS bundle
const StoriesRail = dynamic(() => import('@/components/home/stories-rail').then(m => ({ default: m.StoriesRail })), { ssr: true })
const BannerCarousel = dynamic(() => import('@/components/home/banner-carousel').then(m => ({ default: m.BannerCarousel })), { ssr: true })
const CategoriesGrid = dynamic(() => import('@/components/home/categories-grid').then(m => ({ default: m.CategoriesGrid })), { ssr: true })
const FeaturedRail = dynamic(() => import('@/components/home/featured-rail').then(m => ({ default: m.FeaturedRail })), { ssr: true })
const RealEstateRail = dynamic(() => import('@/components/home/real-estate-rail').then(m => ({ default: m.RealEstateRail })), { ssr: true })
const SpinWin = dynamic(() => import('@/components/home/spin-win').then(m => ({ default: m.SpinWin })), { ssr: false })
const ShortsRail = dynamic(() => import('@/components/home/shorts-rail').then(m => ({ default: m.ShortsRail })), { ssr: false })
const Testimonials = dynamic(() => import('@/components/home/testimonials').then(m => ({ default: m.Testimonials })), { ssr: true })
const PricingPlans = dynamic(() => import('@/components/home/pricing-plans').then(m => ({ default: m.PricingPlans })), { ssr: true })
const AgentCityCTA = dynamic(() => import('@/components/home/agent-city-cta').then(m => ({ default: m.AgentCityCTA })), { ssr: false })
const SiteFooter = dynamic(() => import('@/components/home/site-footer').then(m => ({ default: m.SiteFooter })), { ssr: true })

// Home page is fully dynamic (DB-driven, no caching) so fresh content shows.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const data = await getHomePageData()
  const viewer = await getCurrentUser()
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
      {/* Ticker */}
      <Ticker />

      <main className="flex-1">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-3 py-6 sm:px-4 sm:py-8 lg:px-6 lg:py-10">
          {/* 1. Discover — Search + Filters */}
          <DiscoverSearch villages={data.villages} categories={data.categories} />

          {/* 2. Stories (Premium) — wrapped in overflow-hidden to isolate horizontal scroll */}
          <div className="relative w-full overflow-hidden">
            <StoriesRail stories={data.stories} viewer={viewerInfo} />
          </div>

          {/* 3. Banner Ads ₹99/day */}
          <BannerCarousel banners={data.banners} />

          {/* 4. Browse Categories */}
          <CategoriesGrid categories={data.categories} />

          {/* 5. Featured Business & Services */}
          <FeaturedRail listings={data.featured} />

          {/* 6. Premium Real Estate */}
          <RealEstateRail properties={data.realEstate} />

          {/* 7. Spin & Win */}
          <SpinWin />

          {/* 8. Shorts/Reels */}
          <div id="shorts">
            <ShortsRail shorts={data.shorts} />
          </div>

          {/* 9. Testimonials */}
          <Testimonials />

          {/* 10. Pricing Plans */}
          <div id="pricing">
            <PricingPlans />
          </div>

          {/* 11. Agent & City Expansion CTAs */}
          <AgentCityCTA />

          {/* Explore anchor target (mobile bottom nav) */}
          <div id="explore" className="scroll-mt-20" />
        </div>
      </main>

      {/* Footer (sticky to bottom via mt-auto on flex-col wrapper) */}
      <SiteFooter />

      {/* Bottom padding so content isn't hidden behind the mobile bottom nav */}
      <div className="h-20 md:hidden" aria-hidden />
    </div>
  )
}
