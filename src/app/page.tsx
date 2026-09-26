import { getHomePageData } from '@/lib/home-data'
import { getCurrentUser } from '@/lib/session'
import { Ticker } from '@/components/home/ticker'
import { prisma, safeDbQuery } from '@/lib/prisma'
import { swrCache } from '@/lib/cache'
import { StickySocials } from '@/components/home/sticky-socials'
import {
  StoriesRail,
  BannerCarousel,
  CategoriesGrid,
  FeaturedRail,
  RealEstateRail,
  NewsGrid,
  SendNewsCTA,
  BlogGrid,
  SpinWin,
  Testimonials,
  PricingPlans,
  CommunityHub,
} from '@/components/home/dynamic-wrappers'

export const dynamic = 'force-dynamic'
export const revalidate = 0

async function getCachedSettings() {
  return swrCache(
    'app_settings_global',
    () => safeDbQuery(() => prisma.setting.findMany(), []),
    { ttlMs: 5 * 1000, staleTtlMs: 15 * 60 * 1000 }
  )
}

export default async function Home() {
  const [data, viewerResult, settingsList] = await Promise.all([
    getHomePageData(),
    getCurrentUser().catch((err) => {
      console.error('[Home] getCurrentUser error:', err)
      return null
    }),
    getCachedSettings(),
  ])

  const viewer = viewerResult
  const appSettings: Record<string, string> = (settingsList || []).reduce((acc, row) => {
    acc[row.key] = row.value
    return acc
  }, {} as Record<string, string>)

  const spinEnabled = appSettings.spin_enabled !== 'false'

  let initialAnnouncements: string[] = []
  if (appSettings.ticker_items_json) {
    try {
      const parsed = JSON.parse(appSettings.ticker_items_json)
      if (Array.isArray(parsed)) {
        initialAnnouncements = parsed
          .filter((t: any) => t.isActive !== false)
          .map((t: any) => t.text)
          .filter(Boolean)
      }
    } catch {}
  }
  if (initialAnnouncements.length === 0 && appSettings.announcement_ticker) {
    initialAnnouncements = appSettings.announcement_ticker
      .split('|')
      .map((s) => s.trim())
      .filter(Boolean)
  }

  const viewerInfo = viewer
    ? {
        isLoggedIn: true,
        isPremium:
          viewer.planTier === 'PREMIUM' ||
          viewer.planTier === 'PRO' ||
          viewer.role === 'ADMIN' ||
          viewer.role === 'SUPER_ADMIN',
      }
    : { isLoggedIn: false, isPremium: false }

  return (
    <div className="flex min-h-screen flex-col">
      <Ticker initialAnnouncements={initialAnnouncements} />
      <StickySocials />

      <main className="flex-1">
        {/* Semantic H1 for Lighthouse Accessibility & SEO */}
        <h1 className="sr-only">
          చౌటుప్పల్ లోకల్ బిజినెస్ డైరెక్టరీ, రియల్ ఎస్టేట్ &amp; సర్వీసెస్ — Choutuppal Local Business &amp; Community App
        </h1>

        <div className="mx-auto flex w-full overflow-visible max-w-7xl flex-col gap-6 sm:gap-7 px-3 py-4 sm:px-4 sm:py-6 lg:px-6 relative z-20">
          {/* 1. Stories & Banners */}
          <div className="relative w-full overflow-hidden bg-white/40 backdrop-blur-md rounded-[2rem] p-4 shadow-sm border border-white/50">
            <StoriesRail stories={data.stories} viewer={viewerInfo} />
            <div className="mt-4">
              <BannerCarousel banners={data.banners} />
            </div>
          </div>

          {/* 2. Browse Categories */}
          <CategoriesGrid />

          {/* 3. Top Local Businesses Grid */}
          <FeaturedRail listings={data.featured} />

          {/* 4. Premium Properties Grid */}
          <RealEstateRail properties={data.realEstate} />

          {/* 5. Latest News Section */}
          <NewsGrid articles={data.latestNews} />

          {/* 6. Recent Blogs & Guides Section */}
          <BlogGrid blogs={data.latestBlogs} />

          {/* 7. Send News CTA */}
          <SendNewsCTA />

          {/* 8. Spin & Win */}
          {spinEnabled ? (
            <div className="mt-2">
              <SpinWin />
            </div>
          ) : null}

          {/* 7. Advertising & Monetization Section */}
          <div id="pricing" className="mt-8">
            <PricingPlans />
          </div>

          {/* 8. Opportunities & Community */}
          <CommunityHub />

          {/* 9. Reviews (Testimonials) */}
          <div className="mt-12">
            <Testimonials />
          </div>

          {/* Explore anchor target (mobile bottom nav) */}
          <div id="explore" className="scroll-mt-20" />
        </div>
      </main>

      {/* Bottom padding so content isn't hidden behind the mobile bottom nav */}
      <div className="h-20 md:hidden" aria-hidden />
    </div>
  )
}
