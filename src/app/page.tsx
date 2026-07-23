import { getHomePageData } from '@/lib/home-data'
import { getCurrentUser } from '@/lib/session'
import { SiteHeader } from '@/components/home/site-header'
import { Ticker } from '@/components/home/ticker'
import { StoriesRail } from '@/components/home/stories-rail'
import { BannerCarousel } from '@/components/home/banner-carousel'
import { CategoriesGrid } from '@/components/home/categories-grid'
import { FeaturedRail } from '@/components/home/featured-rail'
import { RealEstateRail } from '@/components/home/real-estate-rail'
import { SpinWin } from '@/components/home/spin-win'
import { ShortsRail } from '@/components/home/shorts-rail'
import { Testimonials } from '@/components/home/testimonials'
import { PricingPlans } from '@/components/home/pricing-plans'
import { AgentCityCTA } from '@/components/home/agent-city-cta'
import { SiteFooter } from '@/components/home/site-footer'
import { BottomNav } from '@/components/home/bottom-nav'

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
      <SiteHeader villages={data.villages} categories={data.categories} />

      {/* Ticker */}
      <Ticker />

      <main className="flex-1">
        <div className="mx-auto flex max-w-7xl flex-col gap-10 px-3 py-6 sm:px-4 sm:py-8 lg:px-6 lg:py-10">
          {/* 3. Stories (Premium) — wrapped in overflow-hidden to isolate horizontal scroll */}
          <div className="relative w-full overflow-hidden">
            <StoriesRail stories={data.stories} viewer={viewerInfo} />
          </div>

          {/* 4. Banner Ads ₹99/day */}
          <BannerCarousel banners={data.banners} />

          {/* 5. Browse Categories */}
          <CategoriesGrid categories={data.categories} />

          {/* 6. Featured Business & Services */}
          <FeaturedRail listings={data.featured} />

          {/* 7. Premium Real Estate */}
          <RealEstateRail properties={data.realEstate} />

          {/* 8. Spin & Win */}
          <SpinWin />

          {/* 9. Shorts/Reels */}
          <div id="shorts">
            <ShortsRail shorts={data.shorts} />
          </div>

          {/* 10. Testimonials */}
          <Testimonials />

          {/* 11. Pricing Plans */}
          <div id="pricing">
            <PricingPlans />
          </div>

          {/* 12. Agent & City Expansion CTAs */}
          <AgentCityCTA />

          {/* Explore anchor target (mobile bottom nav) */}
          <div id="explore" className="scroll-mt-20" />
        </div>
      </main>

      {/* 12. Footer (sticky to bottom via mt-auto on flex-col wrapper) */}
      <SiteFooter />

      {/* 13. Bottom Nav (mobile only) */}
      <BottomNav />

      {/* Bottom padding so content isn't hidden behind the mobile bottom nav */}
      <div className="h-20 md:hidden" aria-hidden />
    </div>
  )
}
