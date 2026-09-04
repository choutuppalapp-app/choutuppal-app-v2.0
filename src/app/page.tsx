import { getHomePageData } from '@/lib/home-data'
import { getCurrentUser } from '@/lib/session'
import { Ticker } from '@/components/home/ticker'
import { prisma } from '@/lib/prisma'
import { StickySocials } from '@/components/home/sticky-socials'
import {
  StoriesRail,
  BannerCarousel,
  CategoriesGrid,
  FeaturedRail,
  RealEstateRail,
  SendNewsCTA,
  BlogGrid,
  SpinWin,
  Testimonials,
  PricingPlans,
  CommunityHub
} from '@/components/home/dynamic-wrappers'
import Image from 'next/image'

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
  let appSettings: Record<string, string> = {}
  try {
    const settingsList = await prisma.setting.findMany()
    appSettings = settingsList.reduce((acc, row) => {
      acc[row.key] = row.value
      return acc
    }, {} as Record<string, string>)
    if (appSettings.spin_enabled === 'false') spinEnabled = false
  } catch (err) {
    console.error('[Home] settings query error:', err)
  }

  const heroImage = appSettings.hero_bg_image || '/images/hero-banner.webp'

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
    <>
      <div className="flex min-h-screen flex-col">
        <Ticker />
        <StickySocials />

      <main className="flex-1">
        {/* 1. Hero Section */}
        <section 
          className="relative w-full overflow-hidden gradient-brand pt-12 pb-8 sm:pt-20 sm:pb-12 px-4 text-center text-white"
        >
          <Image
            src={heroImage}
            alt="Hero Background"
            fill
            priority
            fetchPriority="high"
            sizes="(max-width: 768px) 100vw, 1200px"
            quality={60}
            className="object-cover absolute inset-0 z-0"
          />
          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-black/60 sm:bg-gradient-to-t sm:from-black/80 sm:to-black/30 z-0" />
          
          <div className="relative z-10 mx-auto max-w-3xl">
            <h1 className="text-4xl font-black tracking-tight sm:text-6xl md:text-7xl mb-4 text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)]">
              {appSettings.hero_title || 'Choutuppal App'}
            </h1>
            <p className="text-base sm:text-lg md:text-xl font-bold text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] mb-6 max-w-2xl mx-auto">
              {appSettings.hero_subtitle || 'Your Town, All In One App'}
            </p>
          </div>
        </section>

        <div className="mx-auto flex w-full overflow-visible max-w-7xl flex-col gap-6 sm:gap-7 px-3 py-4 sm:px-4 sm:py-6 lg:px-6 mt-[-2rem] relative z-20">
          
          {/* 2. Stories & Banners */}
          <div className="relative w-full overflow-hidden bg-white/40 backdrop-blur-md rounded-[2rem] p-4 shadow-sm border border-white/50">
            <StoriesRail stories={data.stories} viewer={viewerInfo} />
            <div className="mt-4">
              <BannerCarousel banners={data.banners} />
            </div>
          </div>

          {/* 3. Browse Categories */}
          <CategoriesGrid />

          {/* 4. Top Local Businesses Grid */}
          <FeaturedRail listings={data.featured} />

          {/* 5. Premium Properties Grid */}
          <RealEstateRail properties={data.realEstate} />

          {/* 6. Recent Blogs & News Section */}
          <div className="mt-4 flex flex-col gap-6">
            <BlogGrid blogs={data.latestBlogs} />
            <SendNewsCTA />
          </div>

          {/* 7. Spin & Win */}
          {spinEnabled ? (
            <div className="mt-4">
              <SpinWin />
            </div>
          ) : null}

          {/* 8. Advertising & Monetization Section */}
          <div id="pricing" className="mt-8">
            <PricingPlans />
          </div>

          {/* 9. Opportunities & Community */}
          <CommunityHub />

          {/* 10. Reviews (Testimonials) */}
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
    </>
  )
}


// Force Update
