'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { UserCheck, LogIn, Lock, Mail, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'

export function AgentLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      identifier: email.trim(),
      password,
      redirect: false,
    })

    if (res?.ok && !res?.error) {
      toast.success('Agent authenticated successfully')
      router.refresh()
    } else {
      setError('Invalid agent credentials or insufficient privileges.')
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-yellow-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-blue-100 bg-white p-8 shadow-xl">
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm">
            <UserCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900">Choutuppal Agent Panel</h1>
          <p className="mt-1 text-xs text-slate-500">Isolated Agent Onboarding & Leads Workspace</p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-center text-xs font-semibold text-red-600">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Agent Email or Username</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@choutuppal.in"
                className="border-slate-200 bg-white pl-9 text-slate-900 placeholder:text-slate-400 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-slate-200 bg-white pl-9 text-slate-900 placeholder:text-slate-400 focus:border-amber-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full gap-2 bg-gradient-to-r from-blue-600 to-amber-500 font-bold text-white shadow-lg shadow-amber-500/20 transition active:scale-[0.98]"
          >
            <LogIn className="h-4 w-4" />
            {loading ? 'Authenticating…' : 'Log In to Agent Panel'}
          </Button>
        </form>

        <div className="border-t border-slate-100 pt-4 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 transition hover:text-slate-900">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Public Site
          </Link>
        </div>
      </div>
    </div>
  )
}
