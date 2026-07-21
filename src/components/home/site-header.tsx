'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, MapPin, Tag, Download, LogIn, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Village, Category } from '@prisma/client'

interface SiteHeaderProps {
  villages: Pick<Village, 'id' | 'name' | 'slug'>[]
  categories: Pick<Category, 'id' | 'name' | 'slug'>[]
}

export function SiteHeader({ villages, categories }: SiteHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [query, setQuery] = useState('')

  return (
    <header className="sticky top-0 z-50 border-b border-white/40 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-3 sm:px-4 lg:px-6">
        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl gradient-brand text-lg font-black text-white shadow-lg shadow-blue-500/30">
            C
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-sm font-extrabold tracking-tight text-slate-900">
              Choutuppal
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-600">
              App v2.0
            </span>
          </span>
        </Link>

        {/* Search (desktop) */}
        <form
          className="hidden flex-1 items-center gap-2 md:flex"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search shops, services, properties…"
              className="h-10 w-full rounded-xl border border-slate-200 bg-white/80 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="h-10 w-[130px] bg-white/80">
                <MapPin className="mr-1 h-3.5 w-3.5 text-blue-500" />
                <SelectValue placeholder="Village" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Villages</SelectItem>
                {villages.map((v) => (
                  <SelectItem key={v.id} value={v.slug}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="h-10 w-[130px] bg-white/80">
                <Tag className="mr-1 h-3.5 w-3.5 text-amber-500" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.slug}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </form>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="hidden gap-2 border-slate-200 bg-white/80 sm:inline-flex"
            onClick={() => {
              const e = new Event('beforeinstallprompt')
              window.dispatchEvent(e)
              alert(
                'Install: tap your browser menu → "Add to Home screen" to install the Choutuppal App.',
              )
            }}
          >
            <Download className="h-4 w-4 text-blue-600" />
            <span className="hidden lg:inline">Install App</span>
          </Button>
          <Button
            asChild
            size="sm"
            className="gap-2 gradient-brand text-white shadow-md shadow-blue-500/30"
          >
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              <span className="hidden sm:inline">Login</span>
              <span className="sm:hidden">Login</span>
            </Link>
          </Button>
          <button
            aria-label="Toggle menu"
            className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 bg-white/80 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile search drawer */}
      <div
        className={cn(
          'border-t border-white/40 bg-white/80 px-3 py-3 backdrop-blur-xl md:hidden',
          mobileOpen ? 'block' : 'hidden',
        )}
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search shops, services, properties…"
            className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-blue-400"
          />
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Select defaultValue="all">
            <SelectTrigger className="h-10 w-full bg-white">
              <MapPin className="mr-1 h-3.5 w-3.5 text-blue-500" />
              <SelectValue placeholder="Village" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Villages</SelectItem>
              {villages.map((v) => (
                <SelectItem key={v.id} value={v.slug}>
                  {v.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue="all">
            <SelectTrigger className="h-10 w-full bg-white">
              <Tag className="mr-1 h-3.5 w-3.5 text-amber-500" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.slug}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  )
}
