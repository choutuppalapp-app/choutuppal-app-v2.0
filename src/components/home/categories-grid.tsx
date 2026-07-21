'use client'

import Link from 'next/link'
import {
  Store,
  Wrench,
  Home,
  Newspaper,
  BookOpen,
  ArrowUpRight,
} from 'lucide-react'
import { SectionHeading } from './section-heading'

const CARDS = [
  {
    title: 'Business',
    desc: 'Shops, clinics, restaurants',
    href: '/?cat=business',
    icon: Store,
    gradient: 'from-blue-600 to-blue-400',
  },
  {
    title: 'Services',
    desc: 'Repair, home, professional',
    href: '/?cat=services',
    icon: Wrench,
    gradient: 'from-sky-500 to-amber-400',
  },
  {
    title: 'Real Estate',
    desc: 'Plots, houses, rentals',
    href: '/?cat=realestate',
    icon: Home,
    gradient: 'from-amber-500 to-amber-300',
  },
  {
    title: 'News',
    desc: 'Local updates daily',
    href: '/?cat=news',
    icon: Newspaper,
    gradient: 'from-blue-500 to-indigo-400',
  },
  {
    title: 'Blogs',
    desc: 'Stories & insights',
    href: '/?cat=blogs',
    icon: BookOpen,
    gradient: 'from-amber-600 to-blue-400',
  },
]

export function CategoriesGrid() {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <SectionHeading
        eyebrow="Explore"
        title="Browse Categories"
        subtitle="Everything in Choutuppal, one tap away."
      />
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CARDS.map((c) => {
          const Icon = c.icon
          return (
            <Link
              key={c.title}
              href={c.href}
              className="hover-glow group relative overflow-hidden rounded-2xl glass p-5"
            >
              <div
                className={`mb-3 grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br ${c.gradient} text-white shadow-lg`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">{c.title}</h3>
                  <p className="mt-0.5 text-xs text-slate-500">{c.desc}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-blue-500" />
              </div>
              {/* glow blob */}
              <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-blue-400/0 blur-2xl transition group-hover:bg-blue-400/20" />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
