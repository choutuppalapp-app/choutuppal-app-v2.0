import Link from 'next/link'
import {
  UtensilsCrossed,
  Stethoscope,
  Car,
  GraduationCap,
  ShoppingBag,
  Wrench,
  Home,
  Sprout,
  Truck,
  Smartphone,
} from 'lucide-react'
import { SectionHeading } from './section-heading'

const CATEGORIES = [
  { name: 'Food & Dining', slug: 'food-dining', icon: UtensilsCrossed },
  { name: 'Health & Medical', slug: 'health-medical', icon: Stethoscope },
  { name: 'Automobile', slug: 'automobile', icon: Car },
  { name: 'Education', slug: 'education', icon: GraduationCap },
  { name: 'Retail Shopping', slug: 'retail-shopping', icon: ShoppingBag },
  { name: 'Services', slug: 'services', icon: Wrench },
  { name: 'Real Estate', slug: 'real-estate', icon: Home },
  { name: 'Agriculture', slug: 'agriculture', icon: Sprout },
  { name: 'Transport', slug: 'transport', icon: Truck },
  { name: 'Electronics', slug: 'electronics', icon: Smartphone },
]

export function CategoriesGrid() {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <SectionHeading
        title="Browse Categories"
      />

      {/* Mobile Horizontal Scroll Container */}
      <div className="flex overflow-x-auto no-scrollbar gap-3 md:hidden pb-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <Link
              key={cat.slug}
              href={`/listings?category=${cat.slug}`}
              className="flex shrink-0 w-20 flex-col items-center gap-2"
            >
              <div className="grid h-16 w-16 place-items-center rounded-2xl text-white shadow-md bg-gradient-to-br from-blue-600 to-amber-500">
                <Icon size={28} />
              </div>
              <span className="text-xs font-semibold text-slate-700 text-center leading-tight">
                {cat.name}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Desktop Grid Container */}
      <div className="hidden md:grid md:grid-cols-5 lg:grid-cols-10 gap-4">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <Link
              key={cat.slug}
              href={`/listings?category=${cat.slug}`}
              className="flex flex-col items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
            >
              <div className="grid h-16 w-16 place-items-center rounded-2xl text-white shadow-md bg-gradient-to-br from-blue-600 to-amber-500">
                <Icon size={28} />
              </div>
              <span className="text-xs font-bold text-slate-700 text-center leading-tight">
                {cat.name}
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
