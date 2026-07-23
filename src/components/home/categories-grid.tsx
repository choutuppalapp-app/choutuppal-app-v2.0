'use client'

import Link from 'next/link'
import {
  Store,
  Wrench,
  Home as HomeIcon,
  Newspaper,
  BookOpen,
  UtensilsCrossed,
  Pill,
  Smartphone,
  ShoppingCart,
  GraduationCap,
  Car,
  Shirt,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react'
import { SectionHeading } from './section-heading'

/** Map DB icon string → Lucide component. Falls back to Store. */
const ICON_MAP: Record<string, LucideIcon> = {
  Store,
  Wrench,
  Home: HomeIcon,
  Newspaper,
  BookOpen,
  UtensilsCrossed,
  Pill,
  Smartphone,
  ShoppingCart,
  GraduationCap,
  Car,
  Shirt,
  HeartPulse,
}

interface CategoryCardData {
  id: string
  name: string
  slug: string
  icon: string | null
}

interface CategoriesGridProps {
  categories: CategoryCardData[]
}

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  // If no DB categories, fall back to the original 5 static cards.
  const cards: CategoryCardData[] =
    categories.length > 0
      ? categories
      : [
          { id: 's1', name: 'Business', slug: 'business', icon: 'Store' },
          { id: 's2', name: 'Services', slug: 'services', icon: 'Wrench' },
          { id: 's3', name: 'Real Estate', slug: 'realestate', icon: 'Home' },
          { id: 's4', name: 'News', slug: 'news', icon: 'Newspaper' },
          { id: 's5', name: 'Blogs', slug: 'blogs', icon: 'BookOpen' },
        ]

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <SectionHeading
        eyebrow="Explore"
        title="Browse Categories"
        subtitle="Everything in Choutuppal, one tap away."
      />
      <div className="mt-5 grid grid-cols-3 gap-4 md:grid-cols-6">
        {cards.map((c) => {
          const Icon = ICON_MAP[c.icon ?? ''] ?? Store
          return (
            <Link
              key={c.id}
              href={`/explore?category=${c.slug}`}
              className="group flex flex-col items-center justify-center rounded-2xl border border-white/30 bg-white/20 p-4 text-center backdrop-blur-lg transition-all hover:scale-105 hover:border-blue-500 hover:shadow-lg"
            >
              <span className="mb-2 grid h-12 w-12 place-items-center rounded-xl gradient-brand text-white shadow-md transition group-hover:shadow-lg">
                <Icon className="h-6 w-6" />
              </span>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-blue-700">
                {c.name}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
