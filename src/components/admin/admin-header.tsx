'use client'

import React from 'react'
import Link from 'next/link'
import {
  ExternalLink,
  PlusCircle,
  Bell,
  Sparkles,
  RefreshCw,
  Search,
} from 'lucide-react'

interface AdminHeaderProps {
  title: string
  teluguTitle?: string
  description?: string
  secondaryActionButton?: {
    label: string
    onClick: () => void
    icon?: React.ElementType
  }
  actionButton?: {
    label: string
    onClick: () => void
    icon?: React.ElementType
  }
}

export function AdminHeader({
  title,
  teluguTitle,
  description,
  secondaryActionButton,
  actionButton,
}: AdminHeaderProps) {
  return (
    <header className="border-b border-slate-200 bg-white/95 sticky top-0 z-20 backdrop-blur-md">
      <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              {title}
            </h1>
            {teluguTitle && (
              <span className="hidden sm:inline-block rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {teluguTitle}
              </span>
            )}
          </div>
          {description && (
            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap sm:flex-nowrap">
          <div className="hidden lg:flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live System</span>
          </div>

          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <span>View Website</span>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </Link>

          {secondaryActionButton && (
            <button
              onClick={secondaryActionButton.onClick}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 hover:text-slate-900 transition"
            >
              {secondaryActionButton.icon && (
                <secondaryActionButton.icon className="h-4 w-4 text-slate-500" />
              )}
              <span>{secondaryActionButton.label}</span>
            </button>
          )}

          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-700 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-blue-800 transition"
            >
              {actionButton.icon ? (
                <actionButton.icon className="h-4 w-4" />
              ) : (
                <PlusCircle className="h-4 w-4" />
              )}
              <span>{actionButton.label}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
