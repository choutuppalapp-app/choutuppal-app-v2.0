'use client'

import nextDynamic from 'next/dynamic'

const Loader = () => <div className="h-64 w-full animate-pulse bg-slate-100 rounded-xl" />

export const StoriesRail = nextDynamic(() => import('@/components/home/stories-rail').then(m => ({ default: m.StoriesRail })), { ssr: false, loading: Loader })
export const BannerCarousel = nextDynamic(() => import('@/components/home/banner-carousel').then(m => ({ default: m.BannerCarousel })), { ssr: false, loading: Loader })
export const CategoriesGrid = nextDynamic(() => import('@/components/home/categories-grid').then(m => ({ default: m.CategoriesGrid })), { ssr: false, loading: Loader })
export const FeaturedRail = nextDynamic(() => import('@/components/home/featured-rail').then(m => ({ default: m.FeaturedRail })), { ssr: false, loading: Loader })
export const RealEstateRail = nextDynamic(() => import('@/components/home/real-estate-rail').then(m => ({ default: m.RealEstateRail })), { ssr: false, loading: Loader })
export const SendNewsCTA = nextDynamic(() => import('@/components/home/send-news-cta').then(m => ({ default: m.SendNewsCTA })), { ssr: false, loading: Loader })
export const BlogGrid = nextDynamic(() => import('@/components/home/blog-grid').then(m => ({ default: m.BlogGrid })), { ssr: false, loading: Loader })
export const SpinWin = nextDynamic(() => import('@/components/home/spin-win').then(m => ({ default: m.SpinWin })), { ssr: false, loading: Loader })
export const Testimonials = nextDynamic(() => import('@/components/home/testimonials').then(m => ({ default: m.Testimonials })), { ssr: false, loading: Loader })
export const PricingPlans = nextDynamic(() => import('@/components/home/pricing-plans').then(m => ({ default: m.PricingPlans })), { ssr: false, loading: Loader })
export const CommunityHub = nextDynamic(() => import('@/components/home/community-hub').then(m => ({ default: m.CommunityHub })), { ssr: false, loading: Loader })
