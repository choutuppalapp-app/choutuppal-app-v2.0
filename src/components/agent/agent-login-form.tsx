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
    <div className="grid min-h-screen place-items-center bg-slate-900 p-4 text-white">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-slate-800 bg-slate-950 p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/30">
            <UserCheck className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Choutuppal Agent Panel</h1>
          <p className="mt-1 text-xs text-slate-400">Isolated Agent Onboarding & Leads Workspace</p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-center text-xs font-semibold text-red-400">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">Agent Email or Username</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="agent@choutuppal.in"
                className="border-slate-800 bg-slate-900/80 pl-9 text-white placeholder:text-slate-600 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-400">Password</label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="border-slate-800 bg-slate-900/80 pl-9 text-white placeholder:text-slate-600 focus:border-amber-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full gap-2 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 font-bold text-white shadow-lg shadow-amber-500/20 transition active:scale-[0.98]"
          >
            <LogIn className="h-4 w-4" />
            {loading ? 'Authenticating…' : 'Log In to Agent Panel'}
          </Button>
        </form>

        <div className="border-t border-slate-800/80 pt-4 text-center">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-white">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Public Site
          </Link>
        </div>
      </div>
    </div>
  )
}
