import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import LoginPage from '@/app/login/page'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Register & Create Account | Choutuppal Super App',
  description: 'Join Choutuppal Super App to list your local business, explore verified properties, interact with your community, and access local services.',
}

export default async function RegisterPage() {
  const user = await getCurrentUser().catch(() => null)
  if (user) {
    redirect('/profile')
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <LoginPage />
    </Suspense>
  )
}
