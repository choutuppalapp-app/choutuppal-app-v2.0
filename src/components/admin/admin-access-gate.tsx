'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Home,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  LogIn,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminAccessGateProps {
  currentUser?: {
    name?: string | null
    email?: string | null
    role?: string
  } | null
}

const AUTHORIZED_ADMIN_EMAIL = 'mailmosin@gmail.com'

export function AdminAccessGate({ currentUser }: AdminAccessGateProps) {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('mailmosin@gmail.com')
  const [password, setPassword] = useState('Admin@123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdminSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError(null)

    const cleanIdentifier = identifier.trim().toLowerCase()

    // Strict check: only mailmosin@gmail.com (or username 'mailmosin') is authorized
    if (
      cleanIdentifier !== AUTHORIZED_ADMIN_EMAIL &&
      cleanIdentifier !== 'mailmosin'
    ) {
      setError(`Access denied. Only authorized admin (${AUTHORIZED_ADMIN_EMAIL}) can access the admin panel.`)
      return
    }

    if (!password) {
      setError('Please enter your admin password.')
      return
    }

    setLoading(true)

    try {
      const res = await signIn('credentials', {
        identifier: cleanIdentifier,
        password: password,
        redirect: false,
      })

      if (res?.error) {
        setError('Invalid admin password. Please check your credentials and try again.')
      } else {
        router.refresh()
        window.location.reload()
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to authenticate as Administrator')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-blue-100 selection:text-blue-900">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-xl border border-slate-200">
        {/* Header Icon */}
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900 tracking-tight">
            Admin Control Center
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            అడ్మిన్ ప్రాప్యత ప్రమాణీకరణ (Authorized Access Only)
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] font-semibold text-blue-800">
            <Lock className="h-3 w-3 text-blue-600" />
            <span>Admin: {AUTHORIZED_ADMIN_EMAIL}</span>
          </div>
        </div>

        {/* Current status message if logged in as regular or other user */}
        {currentUser && (
          <div className="mt-5 rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                Logged in as {currentUser.name || currentUser.email} ({currentUser.role})
              </p>
              <p className="mt-0.5 text-[11px] text-amber-800">
                You need to authenticate with the authorized admin account ({AUTHORIZED_ADMIN_EMAIL}) to access the admin panel.
              </p>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleAdminSignIn} className="mt-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block">
              Admin Email
            </label>
            <input
              type="email"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="mailmosin@gmail.com"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-slate-50/70 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block">
              Admin Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-300 bg-slate-50/70 px-3.5 py-2.5 text-sm font-medium text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 focus:outline-none transition pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20 transition mt-2 cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating…
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <LogIn className="h-4 w-4" />
                Sign In to Admin Panel
              </span>
            )}
          </Button>
        </form>

        {/* Return to website & User login links */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-semibold text-slate-500 hover:text-slate-900 transition"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Return to Website</span>
          </Link>
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
          >
            User Login
          </Link>
        </div>
      </div>
    </div>
  )
}
