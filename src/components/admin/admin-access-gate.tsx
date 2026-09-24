'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import {
  ShieldCheck,
  Lock,
  ArrowRight,
  Sparkles,
  KeyRound,
  UserCheck,
  Home,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminAccessGateProps {
  currentUser?: {
    name?: string | null
    email?: string | null
    role?: string
  } | null
}

export function AdminAccessGate({ currentUser }: AdminAccessGateProps) {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('admin@choutuppal.in')
  const [password, setPassword] = useState('Admin@123')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAdminSignIn = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await signIn('credentials', {
        identifier: identifier.trim(),
        password: password,
        redirect: false,
      })

      if (res?.error) {
        setError('Invalid admin credentials. Please try again.')
      } else {
        router.refresh()
        window.location.reload()
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to sign in as Administrator')
    } finally {
      setLoading(false)
    }
  }

  const handleQuickAdminLogin = async (adminEmail: string) => {
    setIdentifier(adminEmail)
    setPassword('Admin@123')
    setLoading(true)
    setError(null)
    try {
      const res = await signIn('credentials', {
        identifier: adminEmail,
        password: 'Admin@123',
        redirect: false,
      })

      if (res?.error) {
        setError('Could not complete quick sign in')
      } else {
        router.refresh()
        window.location.reload()
      }
    } catch {
      setError('Failed to authenticate admin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col justify-center items-center p-4 sm:p-6">
      {/* Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl border border-slate-100">
        {/* Header Icon */}
        <div className="text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-blue-700 text-white shadow-lg shadow-blue-700/30">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
            Admin Control Center
          </h2>
          <p className="mt-1 text-xs text-slate-500 font-medium">
            అడ్మిన్ డాష్‌బోర్డ్ ప్రమాణీకరణ (Authentication Required)
          </p>
        </div>

        {/* Current status message if logged in as regular user */}
        {currentUser && (
          <div className="mt-5 rounded-2xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                Logged in as {currentUser.name || currentUser.email} ({currentUser.role})
              </p>
              <p className="mt-0.5 text-[11px] text-amber-800">
                Administrator privileges are required to access merchant listings and moderation.
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

        {/* 1-Click Quick Admin Pass */}
        <div className="mt-6 space-y-2">
          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            Instant Admin Sign-in
          </label>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleQuickAdminLogin('choutuppalapp@gmail.com')}
            className="w-full flex items-center justify-between p-3 rounded-2xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 transition text-xs font-bold shadow-2xs group"
          >
            <div className="flex items-center gap-2.5">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-blue-700 text-white font-black text-xs">
                ★
              </span>
              <div className="text-left">
                <p className="font-bold">choutuppalapp@gmail.com</p>
                <p className="text-[10px] text-blue-700 font-medium">Master Admin Account</p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-700 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            or enter credentials
          </span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleAdminSignIn} className="space-y-3.5">
          <div>
            <label className="text-xs font-bold text-slate-700 block">
              Admin Email / Username
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="admin@choutuppal.in"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block">
              Password
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-xs text-slate-900 focus:bg-white focus:border-blue-700 focus:outline-none pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-2xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-700/20 transition mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Panel'}
          </Button>
        </form>

        {/* Return to website */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-bold text-slate-500 hover:text-slate-900"
          >
            <Home className="h-3.5 w-3.5" />
            <span>Return to Website</span>
          </Link>
          <Link
            href="/login"
            className="font-bold text-blue-700 hover:underline"
          >
            User Login
          </Link>
        </div>
      </div>
    </div>
  )
}
