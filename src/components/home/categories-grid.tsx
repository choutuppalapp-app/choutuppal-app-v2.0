'use client'

import Link from 'next/link'
import {
  Store,
  Wrench,
  Home as HomeIcon,
  UtensilsCrossed,
  Pill,
  Smartphone,
  ShoppingCart,
  GraduationCap,
  Car,
  HeartPulse,
  ShoppingBag,
  Sprout,
  Truck,
  Building,
  Laptop,
  type LucideIcon,
} from 'lucide-react'
import { SectionHeading } from './section-heading'
import { cn } from '@/lib/utils'

/** Map DB icon string or slug -> Lucide component. */
const ICON_MAP: Record<string, LucideIcon> = {
  UtensilsCrossed,
  'food-dining': UtensilsCrossed,
  HeartPulse,
  Pill,
  'health-medical': HeartPulse,
  Car,
  automobile: Car,
  GraduationCap,
  education: GraduationCap,
  ShoppingBag,
  ShoppingCart,
  'retail-shopping': ShoppingBag,
  Wrench,
  services: Wrench,
  Home: HomeIcon,
  Building,
  'real-estate': HomeIcon,
  Sprout,
  agriculture: Sprout,
  Truck,
  transport: Truck,
  Smartphone,
  Laptop,
  electronics: Smartphone,
  Store,
}

/** Distinct rich gradient themes per category slug */
const CATEGORY_GRADIENTS: Record<string, string> = {
  'food-dining': 'from-amber-500 to-orange-600 text-white shadow-orange-500/20',
  'health-medical': 'from-rose-500 to-red-600 text-white shadow-rose-500/20',
  'automobile': 'from-blue-600 to-indigo-600 text-white shadow-blue-500/20',
  'education': 'from-violet-600 to-purple-600 text-white shadow-purple-500/20',
  'retail-shopping': 'from-pink-500 to-rose-500 text-white shadow-pink-500/20',
  'services': 'from-teal-500 to-emerald-600 text-white shadow-teal-500/20',
  'real-estate': 'from-sky-500 to-blue-600 text-white shadow-sky-500/20',
  'agriculture': 'from-emerald-500 to-green-600 text-white shadow-emerald-500/20',
  'transport': 'from-amber-600 to-yellow-600 text-white shadow-amber-500/20',
  'electronics': 'from-indigo-500 to-cyan-600 text-white shadow-indigo-500/20',
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

const DEFAULT_CATEGORIES: CategoryCardData[] = [
  { id: 'c1', name: 'Food & Dining', slug: 'food-dining', icon: 'UtensilsCrossed' },
  { id: 'c2', name: 'Health & Medical', slug: 'health-medical', icon: 'HeartPulse' },
  { id: 'c3', name: 'Automobile', slug: 'automobile', icon: 'Car' },
  { id: 'c4', name: 'Education', slug: 'education', icon: 'GraduationCap' },
  { id: 'c5', name: 'Retail Shopping', slug: 'retail-shopping', icon: 'ShoppingBag' },
  { id: 'c6', name: 'Services', slug: 'services', icon: 'Wrench' },
  { id: 'c7', name: 'Real Estate', slug: 'real-estate', icon: 'Home' },
  { id: 'c8', name: 'Agriculture', slug: 'agriculture', icon: 'Sprout' },
  { id: 'c9', name: 'Transport', slug: 'transport', icon: 'Truck' },
  { id: 'c10', name: 'Electronics', slug: 'electronics', icon: 'Smartphone' },
]

export function CategoriesGrid({ categories }: CategoriesGridProps) {
  const cards: CategoryCardData[] =
    categories.length > 0 ? categories : DEFAULT_CATEGORIES

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <SectionHeading
        eyebrow="Explore"
        title="Browse Categories"
        subtitle="Everything in Choutuppal, one tap away."
      />

      <div className="mt-4 flex overflow-x-auto no-scrollbar gap-3 md:grid md:grid-cols-5 lg:grid-cols-10 pb-3 pt-1 scroll-smooth">
        {cards.map((c) => {
          const Icon = ICON_MAP[c.icon ?? ''] ?? ICON_MAP[c.slug] ?? Store
          const gradientClass =
            CATEGORY_GRADIENTS[c.slug] ?? 'from-blue-600 to-indigo-600 text-white shadow-blue-500/20'

          return (
            <Link
              key={c.id}
              href={`/listings?category=${c.slug}`}
              className="group flex w-[90px] md:w-auto shrink-0 flex-col items-center justify-between rounded-2xl border border-white/60 bg-white/40 p-3.5 text-center backdrop-blur-xl shadow-xs transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-blue-400 hover:bg-white/90 hover:shadow-lg"
            >
              <div
                className={cn(
                  'mb-2.5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br shadow-md transition-transform duration-300 group-hover:scale-110',
                  gradientClass
                )}
              >
                <Icon className="h-6 w-6 stroke-[2.2]" />
              </div>
              <span className="text-[11px] md:text-xs font-bold leading-tight text-slate-800 transition-colors group-hover:text-blue-700">
                {c.name}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
