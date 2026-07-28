import { getHomePageData } from '@/lib/home-data'
import { getCurrentUser } from '@/lib/session'
import { Ticker } from '@/components/home/ticker'
import { DiscoverSearch } from '@/components/home/discover-search'
import { prisma } from '@/lib/prisma'
import nextDynamic from 'next/dynamic'

// Heavy client components — lazy-loaded to reduce initial JS bundle
const StoriesRail = nextDynamic(() => import('@/components/home/stories-rail').then(m => ({ default: m.StoriesRail })))
const BannerCarousel = nextDynamic(() => import('@/components/home/banner-carousel').then(m => ({ default: m.BannerCarousel })))
const CategoriesGrid = nextDynamic(() => import('@/components/home/categories-grid').then(m => ({ default: m.CategoriesGrid })))
const FeaturedRail = nextDynamic(() => import('@/components/home/featured-rail').then(m => ({ default: m.FeaturedRail })))
const RealEstateRail = nextDynamic(() => import('@/components/home/real-estate-rail').then(m => ({ default: m.RealEstateRail })))
const SpinWin = nextDynamic(() => import('@/components/home/spin-win').then(m => ({ default: m.SpinWin })))
const ShortsRail = nextDynamic(() => import('@/components/home/shorts-rail').then(m => ({ default: m.ShortsRail })))
const Testimonials = nextDynamic(() => import('@/components/home/testimonials').then(m => ({ default: m.Testimonials })))
const PricingPlans = nextDynamic(() => import('@/components/home/pricing-plans').then(m => ({ default: m.PricingPlans })))
const AgentCityCTA = nextDynamic(() => import('@/components/home/agent-city-cta').then(m => ({ default: m.AgentCityCTA })))
const SiteFooter = nextDynamic(() => import('@/components/home/site-footer').then(m => ({ default: m.SiteFooter })))

// Home page is fully dynamic (DB-driven, no caching) so fresh content shows.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const data = await getHomePageData()
  const viewer = await getCurrentUser()

  // Fetch settings to check if spin is enabled
  const settingsList = await prisma.setting.findMany()
  const settings = settingsList.reduce((acc, row) => {
    acc[row.key] = row.value
    return acc
  }, {} as Record<string, string>)
  const spinEnabled = (settings.spin_enabled ?? 'true') !== 'false'
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
          {/* 1. Stories (Premium) — wrapped in overflow-hidden to isolate horizontal scroll */}
          <div className="relative w-full overflow-hidden">
            <StoriesRail stories={data.stories} viewer={viewerInfo} />
          </div>

          {/* 2. Banner Ads ₹99/day */}
          <BannerCarousel banners={data.banners} />

          {/* 3. Discover — Search + Filters (below banner) */}
          <DiscoverSearch villages={data.villages} categories={data.categories} />

          {/* 4. Browse Categories */}
          <CategoriesGrid categories={data.categories} />

          {/* 5. Featured Business & Services */}
          <FeaturedRail listings={data.featured} />

          {/* 6. Premium Real Estate */}
          <RealEstateRail properties={data.realEstate} />

          {/* 7. Spin & Win */}
          {spinEnabled ? <SpinWin /> : null}

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
