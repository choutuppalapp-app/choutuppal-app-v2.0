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
  { name: 'Food & Dining', slug: 'food-dining', icon: UtensilsCrossed, gradient: 'from-orange-500 to-red-500' },
  { name: 'Health & Medical', slug: 'health-medical', icon: Stethoscope, gradient: 'from-rose-500 to-pink-500' },
  { name: 'Automobile', slug: 'automobile', icon: Car, gradient: 'from-blue-500 to-indigo-500' },
  { name: 'Education', slug: 'education', icon: GraduationCap, gradient: 'from-purple-500 to-violet-500' },
  { name: 'Retail Shopping', slug: 'retail-shopping', icon: ShoppingBag, gradient: 'from-green-500 to-emerald-500' },
  { name: 'Services', slug: 'services', icon: Wrench, gradient: 'from-slate-500 to-gray-600' },
  { name: 'Real Estate', slug: 'real-estate', icon: Home, gradient: 'from-amber-500 to-yellow-500' },
  { name: 'Agriculture', slug: 'agriculture', icon: Sprout, gradient: 'from-lime-500 to-green-500' },
  { name: 'Transport', slug: 'transport', icon: Truck, gradient: 'from-cyan-500 to-blue-500' },
  { name: 'Electronics', slug: 'electronics', icon: Smartphone, gradient: 'from-fuchsia-500 to-purple-500' },
]

export function CategoriesGrid() {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <SectionHeading
        title="Browse Categories"
      />

      {/* Mobile Horizontal Scroll Container */}
      <div className="flex overflow-x-auto no-scrollbar gap-3 md:hidden mt-6 pb-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <Link
              key={cat.slug}
              href={`/listings?category=${cat.slug}`}
              className="flex shrink-0 w-20 flex-col items-center gap-2 group"
            >
              <div
                className={`grid h-16 w-16 place-items-center rounded-2xl text-white shadow-md bg-gradient-to-br ${cat.gradient} transition-transform group-hover:scale-105 group-active:scale-95`}
              >
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
      <div className="hidden md:grid md:grid-cols-5 lg:grid-cols-10 gap-4 mt-6">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon
          return (
            <Link
              key={cat.slug}
              href={`/listings?category=${cat.slug}`}
              className="flex flex-col items-center gap-3 p-3 rounded-2xl hover:bg-slate-50 transition-colors group"
            >
              <div
                className={`grid h-16 w-16 place-items-center rounded-2xl text-white shadow-md bg-gradient-to-br ${cat.gradient} transition-transform group-hover:scale-110`}
              >
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
