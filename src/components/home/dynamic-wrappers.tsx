'use client'

import nextDynamic from 'next/dynamic'

// Direct components for Above-the-fold content (Instant Server-Rendered HTML, zero layout shift)
export { StoriesRail } from '@/components/home/stories-rail'
export { BannerCarousel } from '@/components/home/banner-carousel'
export { CategoriesGrid } from '@/components/home/categories-grid'
export { FeaturedRail } from '@/components/home/featured-rail'
export { RealEstateRail } from '@/components/home/real-estate-rail'
export { NewsGrid } from '@/components/home/news-grid'
export { SendNewsCTA } from '@/components/home/send-news-cta'
export { BlogGrid } from '@/components/home/blog-grid'

// Lazy-loaded components for below-the-fold heavy interactive widgets
const LazySkeleton = () => <div className="h-48 w-full rounded-2xl bg-slate-100/60 animate-pulse my-4" />

export const SpinWin = nextDynamic(
  () => import('@/components/home/spin-win').then((m) => ({ default: m.SpinWin })),
  { ssr: false, loading: LazySkeleton }
)
export const Testimonials = nextDynamic(
  () => import('@/components/home/testimonials').then((m) => ({ default: m.Testimonials })),
  { ssr: false, loading: LazySkeleton }
)
export const PricingPlans = nextDynamic(
  () => import('@/components/home/pricing-plans').then((m) => ({ default: m.PricingPlans })),
  { ssr: false, loading: LazySkeleton }
)
export const CommunityHub = nextDynamic(
  () => import('@/components/home/community-hub').then((m) => ({ default: m.CommunityHub })),
  { ssr: false, loading: LazySkeleton }
)
