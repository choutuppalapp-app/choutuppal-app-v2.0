'use client'

import { Plus, Star } from 'lucide-react'
import type { Story } from '@prisma/client'

interface StoriesRailProps {
  stories: (Story & {
    owner: { username: string | null; name: string | null; image: string | null }
  })[]
}

const RING = 'gradient-ring'

export function StoriesRail({ stories }: StoriesRailProps) {
  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
          Stories
        </h2>
        <span className="text-[11px] font-semibold text-amber-600">Premium</span>
      </div>
      <div className="no-scrollbar mt-3 flex gap-4 overflow-x-auto pb-2">
        {/* Add story (owner) */}
        <button
          className="flex shrink-0 flex-col items-center gap-1.5"
          aria-label="Add your story"
        >
          <span className="relative grid h-16 w-16 place-items-center rounded-full border-2 border-dashed border-slate-300 bg-white/70 text-slate-400 hover:border-blue-400 hover:text-blue-600">
            <Plus className="h-6 w-6" />
          </span>
          <span className="text-[11px] font-medium text-slate-500">Add</span>
        </button>

        {stories.map((s, i) => {
          const name =
            s.owner.username ??
            s.owner.name ??
            `Story ${i + 1}`
          const initial = name.charAt(0).toUpperCase()
          return (
            <button
              key={s.id}
              className="flex shrink-0 flex-col items-center gap-1.5"
              title={s.caption ?? undefined}
            >
              <span className="relative grid h-16 w-16 place-items-center rounded-full p-[3px]">
                <span
                  className={`absolute inset-0 rounded-full ${RING} ${i % 2 === 0 ? 'animate-spin-slow' : ''}`}
                />
                <span className="relative grid h-full w-full place-items-center overflow-hidden rounded-full border-2 border-white bg-gradient-to-br from-blue-500 to-amber-400 text-lg font-bold text-white">
                  {initial}
                  <Star className="absolute right-0 top-0 h-4 w-4 fill-amber-400 text-amber-500" />
                </span>
              </span>
              <span className="max-w-[64px] truncate text-[11px] font-medium text-slate-600">
                {name}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
