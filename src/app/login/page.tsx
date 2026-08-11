'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { Loader2, Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchRoleRedirect } from '@/lib/role-redirect'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

/* -------------------------------------------------------------------------- */
/*                              Google "G" icon                               */
/* -------------------------------------------------------------------------- */

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*                              Spinner helper                                */
/* -------------------------------------------------------------------------- */

function Spinner({ className }: { className?: string }) {
  return <Loader2 className={`animate-spin ${className ?? ''}`} />
}

/* -------------------------------------------------------------------------- */
/*                                Page                                        */
/* -------------------------------------------------------------------------- */

export default function LoginPage() {
  // useSearchParams requires a Suspense boundary in the App Router.
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginInner />
    </Suspense>
  )
}

function LoginFallback() {
  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-blue-50/60 via-white to-amber-50/50">
      <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
    </div>
  )
}

function LoginInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // ---- Google OAuth callback redirect ---------------------------------------
  // When Google OAuth completes, NextAuth sends the browser to /login?google=1.
  // Detect that, read the now-active session, and redirect to the role-
  // appropriate destination (admin -> /admin, agent -> /agent, user -> /dashboard).
  useEffect(() => {
    if (searchParams.get('google') !== '1') return
    let active = true
    fetch('/api/auth/session', { cache: 'no-store' })
      .then((r) => r.json())
      .then(async (data) => {
        if (!active) return
        if (data?.user) {
          const dest = await fetchRoleRedirect()
          router.replace(dest)
        }
      })
      .catch(() => {})
    return () => { active = false }
  }, [searchParams, router])

  // ---- Fetch villages for the signup form -----------------------------------
  useEffect(() => {
    let active = true
    fetch('/api/villages')
      .then((r) => r.json())
      .then((j) => {
        if (active) {
          const list = j?.villages || j?.data || (Array.isArray(j) ? j : [])
          if (Array.isArray(list)) setVillages(list)
        }
      })
      .catch(() => {})
    return () => { active = false }
  }, [])

  // ---- Active tab -----------------------------------------------------------
  const [tab, setTab] = useState<'login' | 'signup'>('login')

  // ---- Login form -----------------------------------------------------------
  const [loginIdentifier, setLoginIdentifier] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  // ---- Signup form ----------------------------------------------------------
  const [suName, setSuName] = useState('')
  const [suUsername, setSuUsername] = useState('')
  const [suIdentifier, setSuIdentifier] = useState('')
  const [suPassword, setSuPassword] = useState('')
  const [suConfirm, setSuConfirm] = useState('')
  const [suVillage, setSuVillage] = useState('')
  const [villages, setVillages] = useState<Array<{ id: string; name: string }>>([])
  const [suError, setSuError] = useState('')
  const [suLoading, setSuLoading] = useState(false)
  const [suGoogleLoading, setSuGoogleLoading] = useState(false)

  // ---- Show / hide password -------------------------------------------------
  const [showPwd, setShowPwd] = useState(false)
  const [showSuPwd, setShowSuPwd] = useState(false)

  // ---- Forgot password dialog ----------------------------------------------
  const [forgotOpen, setForgotOpen] = useState(false)
  const [fpStep, setFpStep] = useState<1 | 2>(1)
  const [fpIdentifier, setFpIdentifier] = useState('')
  const [fpToken, setFpToken] = useState('')
  const [fpPassword, setFpPassword] = useState('')
  const [fpDevToken, setFpDevToken] = useState<string | null>(null)
  const [fpInfo, setFpInfo] = useState('')
  const [fpError, setFpError] = useState('')
  const [fpLoading, setFpLoading] = useState(false)

  /* --------------------------- Login handler ------------------------------ */
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoginError('')

    if (!loginIdentifier.trim() || !loginPassword) {
      setLoginError('Please enter your email/phone and password.')
      return
    }

    setLoginLoading(true)
    try {
      const res = await signIn('credentials', {
        identifier: loginIdentifier.trim(),
        password: loginPassword,
        redirect: false,
      })

      if (res?.ok && !res.error) {
        toast.success('Logged in! Redirecting…')
        try {
          const dest = await fetchRoleRedirect()
          router.replace(dest || '/dashboard')
        } catch {
          router.replace('/dashboard')
        }
        return
      }

      setLoginError('Invalid email/phone or password.')
    } catch {
      setLoginError('Something went wrong. Please try again.')
    } finally {
      setLoginLoading(false)
    }
  }

  /* --------------------------- Google handler ----------------------------- */
  async function handleGoogle(which: 'login' | 'signup') {
    const setter = which === 'login' ? setGoogleLoading : setSuGoogleLoading
    setter(true)
    try {
      // Redirect to Google OAuth. After the callback completes, NextAuth sends
      // the browser to the callbackUrl; we use /login?google=1 which then reads
      // the session and redirects to the role-appropriate destination. If env
      // vars aren't set, NextAuth surfaces an error page (acceptable for demo).
      await signIn('google', { callbackUrl: '/login?google=1' })
    } catch {
      toast.error('Google sign-in failed to start.')
      setter(false)
    }
  }

  /* --------------------------- Signup handler ----------------------------- */
  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setSuError('')

    if (!suName.trim()) {
      setSuError('Please enter your full name.')
      return
    }
    if (!suIdentifier.trim()) {
      setSuError('Please enter your phone number.')
      return
    }
    if (suPassword.length < 6) {
      setSuError('Password must be at least 6 characters.')
      return
    }

    setSuLoading(true)
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: suName.trim(),
          phone: suIdentifier.trim(),
          password: suPassword,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSuError(data?.error || 'Sign up failed. Please try again.')
        setSuLoading(false)
        return
      }

      // Auto-login after successful signup.
      const r = await signIn('credentials', {
        identifier: suIdentifier.trim(),
        password: suPassword,
        redirect: false,
      })

      if (r?.ok && !r.error) {
        toast.success('Account created! Redirecting…')
        try {
          const dest = await fetchRoleRedirect()
          router.replace(dest || '/dashboard')
        } catch {
          router.replace('/dashboard')
        }
        return
      }

      // Account was created but auto-login failed — fall back to login tab.
      toast.success('Account created! Please log in.')
      setTab('login')
      setLoginIdentifier(suIdentifier.trim())
    } catch {
      setSuError('Something went wrong. Please try again.')
    } finally {
      setSuLoading(false)
    }
  }

  /* --------------------- Forgot password: step 1 -------------------------- */
  async function handleForgotStep1(e: React.FormEvent) {
    e.preventDefault()
    setFpError('')
    setFpInfo('')

    if (!fpIdentifier.trim()) {
      setFpError('Please enter your email or phone.')
      return
    }

    setFpLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: fpIdentifier.trim() }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFpError(data?.error || 'Request failed.')
        return
      }

      setFpInfo('If the account exists, a reset link has been sent.')
      if (data.devToken) {
        setFpDevToken(data.devToken)
        setFpToken(data.devToken) // prefill for dev convenience
      }
      setFpStep(2)
    } catch {
      setFpError('Something went wrong. Please try again.')
    } finally {
      setFpLoading(false)
    }
  }

  /* --------------------- Forgot password: step 2 -------------------------- */
  async function handleForgotStep2(e: React.FormEvent) {
    e.preventDefault()
    setFpError('')

    if (fpToken.trim().length < 16) {
      setFpError('Please enter a valid reset token.')
      return
    }
    if (fpPassword.length < 6) {
      setFpError('Password must be at least 6 characters.')
      return
    }

    setFpLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: fpToken.trim(),
          password: fpPassword,
        }),
      })

      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFpError(data?.error || 'Reset failed.')
        return
      }

      toast.success('Password reset! You can now log in.')
      setForgotOpen(false)
      resetForgot()
      setTab('login')
    } catch {
      setFpError('Something went wrong. Please try again.')
    } finally {
      setFpLoading(false)
    }
  }

  function resetForgot() {
    setFpStep(1)
    setFpIdentifier('')
    setFpToken('')
    setFpPassword('')
    setFpDevToken(null)
    setFpInfo('')
    setFpError('')
  }

  /* ------------------------------ Render ----------------------------------- */
  const anyLoading = loginLoading || suLoading

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6">
      {/* Decorative gradient orbs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 -top-32 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 -right-32 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl"
      />

      {/* Logo + title */}
      <div className="relative mb-6 flex flex-col items-center gap-3 text-center">
        <Link
          href="/"
          className="flex items-center gap-3 hover-lift"
          aria-label="Choutuppal home"
        >
          <img src="/logo.png" alt="Choutuppal App" className="h-14 w-auto" />
        </Link>
        <p className="max-w-[320px] text-sm text-slate-500">
          Sign in to manage your business, listings &amp; community.
        </p>
      </div>

      {/* Glass card */}
      <div className="relative w-full max-w-[440px]">
        <div className="glass-strong rounded-3xl p-6 sm:p-8">
          <Tabs
            value={tab}
            onValueChange={(v) => setTab(v as 'login' | 'signup')}
          >
            <TabsList className="grid h-11 w-full grid-cols-2 rounded-xl bg-slate-100/80 p-1">
              <TabsTrigger
                value="login"
                className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
              >
                Login
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="rounded-lg text-sm font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* ----------------------------- LOGIN ----------------------------- */}
            <TabsContent value="login" className="mt-6">
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="login-identifier">Email or Phone</Label>
                  <Input
                    id="login-identifier"
                    name="identifier"
                    type="text"
                    autoComplete="username"
                    placeholder="you@example.com or +91…"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    disabled={anyLoading || googleLoading}
                    className="h-11 bg-white/80"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <button
                      type="button"
                      onClick={() => setForgotOpen(true)}
                      className="text-xs font-semibold text-blue-600 transition hover:text-amber-600"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="login-password"
                      name="password"
                      type={showPwd ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      disabled={anyLoading || googleLoading}
                      className="h-11 bg-white/80 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:text-slate-700"
                      aria-label={showPwd ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPwd ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {loginError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                  >
                    {loginError}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={anyLoading || googleLoading}
                  className="gradient-brand h-11 w-full rounded-xl text-sm font-bold text-white shadow-md shadow-blue-500/30 transition hover:shadow-lg hover:shadow-blue-500/40 disabled:opacity-60"
                >
                  {loginLoading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Logging in…
                    </>
                  ) : (
                    'Login'
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-1 flex items-center">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="px-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                    or
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleGoogle('login')}
                  disabled={anyLoading || googleLoading}
                  className="h-11 w-full rounded-xl border-slate-200 bg-white/90 text-sm font-semibold text-slate-700 transition hover:bg-white hover:shadow-sm disabled:opacity-60"
                >
                  {googleLoading ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <GoogleIcon className="h-5 w-5" />
                  )}
                  Continue with Google
                </Button>
              </form>
            </TabsContent>

            {/* ----------------------------- SIGN UP --------------------------- */}
            <TabsContent value="signup" className="mt-6">
              <form onSubmit={handleSignup} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="su-name">Full Name</Label>
                  <Input
                    id="su-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={suName}
                    onChange={(e) => setSuName(e.target.value)}
                    disabled={suLoading || suGoogleLoading}
                    className="h-11 bg-white/80"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="su-identifier">Phone Number</Label>
                  <Input
                    id="su-identifier"
                    name="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="10-digit mobile number"
                    value={suIdentifier}
                    onChange={(e) => setSuIdentifier(e.target.value)}
                    disabled={suLoading || suGoogleLoading}
                    className="h-11 bg-white/80"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="su-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="su-password"
                      name="password"
                      type={showSuPwd ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Min 6 characters"
                      value={suPassword}
                      onChange={(e) => setSuPassword(e.target.value)}
                      disabled={suLoading || suGoogleLoading}
                      className="h-11 bg-white/80 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSuPwd((s) => !s)}
                      className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-md text-slate-400 transition hover:text-slate-700"
                      aria-label={showSuPwd ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showSuPwd ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {suError && (
                  <p
                    role="alert"
                    className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                  >
                    {suError}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={suLoading || suGoogleLoading}
                  className="gradient-brand h-11 w-full rounded-xl text-sm font-bold text-white shadow-md shadow-blue-500/30 transition hover:shadow-lg hover:shadow-blue-500/40 disabled:opacity-60"
                >
                  {suLoading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Creating account…
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>

                {/* Divider */}
                <div className="relative my-1 flex items-center">
                  <div className="h-px flex-1 bg-slate-200" />
                  <span className="px-3 text-xs font-medium uppercase tracking-wide text-slate-400">
                    or
                  </span>
                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleGoogle('signup')}
                  disabled={suLoading || suGoogleLoading}
                  className="h-11 w-full rounded-xl border-slate-200 bg-white/90 text-sm font-semibold text-slate-700 transition hover:bg-white hover:shadow-sm disabled:opacity-60"
                >
                  {suGoogleLoading ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <GoogleIcon className="h-5 w-5" />
                  )}
                  Continue with Google
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Back to home */}
      <div className="relative mt-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-slate-200/70 bg-white/60 px-4 py-2 text-sm font-medium text-slate-600 backdrop-blur-md transition hover:border-blue-300 hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Choutuppal Home
        </Link>
      </div>

      {/* ----------------------- Forgot password dialog ---------------------- */}
      <Dialog
        open={forgotOpen}
        onOpenChange={(o) => {
          setForgotOpen(o)
          if (!o) {
            // reset when fully closed
            setTimeout(resetForgot, 200)
          }
        }}
      >
        <DialogContent className="glass-strong max-w-[440px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900">
              {fpStep === 1 ? 'Reset your password' : 'Set a new password'}
            </DialogTitle>
            <DialogDescription>
              {fpStep === 1
                ? 'Enter the email or phone on your account and we’ll send a reset link.'
                : 'Paste the reset token and choose a new password (min 6 characters).'}
            </DialogDescription>
          </DialogHeader>

          {fpStep === 1 ? (
            <form onSubmit={handleForgotStep1} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="fp-identifier">Email or Phone</Label>
                <Input
                  id="fp-identifier"
                  type="text"
                  placeholder="you@example.com or +91…"
                  value={fpIdentifier}
                  onChange={(e) => setFpIdentifier(e.target.value)}
                  disabled={fpLoading}
                  className="h-11 bg-white/80"
                  autoFocus
                />
              </div>

              {fpError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                >
                  {fpError}
                </p>
              )}

              <DialogFooter className="flex-row gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setForgotOpen(false)}
                  disabled={fpLoading}
                  className="rounded-xl"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={fpLoading}
                  className="gradient-brand rounded-xl text-white shadow-md shadow-blue-500/30"
                >
                  {fpLoading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Sending…
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleForgotStep2} className="flex flex-col gap-4">
              {fpInfo && (
                <p className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-slate-700">
                  {fpInfo}
                </p>
              )}

              {fpDevToken && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Dev mode reset token
                  </p>
                  <code className="block break-all rounded bg-white/80 px-2 py-1.5 font-mono text-[11px] text-slate-800">
                    {fpDevToken}
                  </code>
                  <p className="mt-1 text-[11px] text-amber-700/80">
                    Pasted into the token field below for convenience.
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="fp-token">Reset token</Label>
                <Input
                  id="fp-token"
                  type="text"
                  placeholder="Paste your reset token"
                  value={fpToken}
                  onChange={(e) => setFpToken(e.target.value)}
                  disabled={fpLoading}
                  className="h-11 bg-white/80 font-mono text-xs"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="fp-password">New password</Label>
                <Input
                  id="fp-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Min 6 characters"
                  value={fpPassword}
                  onChange={(e) => setFpPassword(e.target.value)}
                  disabled={fpLoading}
                  className="h-11 bg-white/80"
                />
              </div>

              {fpError && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
                >
                  {fpError}
                </p>
              )}

              <DialogFooter className="flex-row gap-2 sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFpStep(1)}
                  disabled={fpLoading}
                  className="rounded-xl"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  disabled={fpLoading}
                  className="gradient-brand rounded-xl text-white shadow-md shadow-blue-500/30"
                >
                  {fpLoading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Resetting…
                    </>
                  ) : (
                    'Reset password'
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </main>
  )
}
