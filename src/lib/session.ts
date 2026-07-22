import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { User } from '@prisma/client'

/**
 * Server-side session helpers. Used by Server Components and API routes to
 * read the authenticated user without touching the edge runtime.
 */
export async function getSession() {
  return getServerSession(authOptions)
}

/** Returns the full DB User row for the current session, or null. */
export async function getCurrentUser(): Promise<User | null> {
  const session = await getSession()
  if (!session?.user?.id) return null
  return prisma.user.findUnique({ where: { id: session.user.id } })
}

/** Require auth in a Server Component — redirects to /login when unauthenticated. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('UNAUTHENTICATED')
  }
  if (user.isBanned) {
    throw new Error('BANNED')
  }
  return user
}

/** Require auth in an API route — returns { user } or { error, status }. */
export async function requireApiUser(): Promise<
  { ok: true; user: User } | { ok: false; status: number; error: string }
> {
  const user = await getCurrentUser()
  if (!user) return { ok: false, status: 401, error: 'Unauthorized' }
  if (user.isBanned) return { ok: false, status: 403, error: 'Account banned' }
  return { ok: true, user }
}

/** True if the user is an admin (ADMIN or SUPER_ADMIN). */
export function isAdminRole(role: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}

/** True if the user can access the agent panel (AGENT or ADMIN). */
export function isAgentRole(role: string): boolean {
  return role === 'AGENT' || isAdminRole(role)
}

/** Require an admin in an API route — returns { user } or { error, status }. */
export async function requireApiAdmin(): Promise<
  { ok: true; user: User } | { ok: false; status: number; error: string }
> {
  const auth = await requireApiUser()
  if (!auth.ok) return auth
  if (!isAdminRole(auth.user.role)) {
    return { ok: false, status: 403, error: 'Admin access required' }
  }
  return { ok: true, user: auth.user }
}

/** Require an agent (or admin) in an API route. */
export async function requireApiAgent(): Promise<
  { ok: true; user: User } | { ok: false; status: number; error: string }
> {
  const auth = await requireApiUser()
  if (!auth.ok) return auth
  if (!isAgentRole(auth.user.role)) {
    return { ok: false, status: 403, error: 'Agent access required' }
  }
  return { ok: true, user: auth.user }
}

/** Require an admin in a Server Component — redirects non-admins to /. */
export async function requireAdmin(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  if (user.isBanned) throw new Error('BANNED')
  if (!isAdminRole(user.role)) throw new Error('FORBIDDEN')
  return user
}

/** Require an agent (or admin) in a Server Component. */
export async function requireAgent(): Promise<User> {
  const user = await getCurrentUser()
  if (!user) throw new Error('UNAUTHENTICATED')
  if (user.isBanned) throw new Error('BANNED')
  if (!isAgentRole(user.role)) throw new Error('FORBIDDEN')
  return user
}
