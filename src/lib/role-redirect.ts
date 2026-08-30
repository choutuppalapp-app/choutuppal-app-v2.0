/**
 * Role-based redirect destination after authentication.
 *
 *   ADMIN / SUPER_ADMIN  -> /admin
 *   AGENT                -> /agent
 *   USER (default)       -> /dashboard
 *
 * The role strings match the values stored in the User table and surfaced on
 * the NextAuth session via the JWT/session callbacks in auth.config.ts.
 */
export function roleRedirectPath(role: string | undefined | null): string {
  if (role === 'ADMIN' || role === 'SUPER_ADMIN') return 'https://admin.choutuppal.in'
  if (role === 'AGENT') return 'https://agent.choutuppal.in'
  return '/dashboard'
}

/**
 * Fetch the current session and return the correct redirect path for the
 * authenticated user. Used right after a successful signIn() — the JWT cookie
 * is set by the time this runs.
 *
 * Falls back to /dashboard if the session can't be read (e.g. the fetch race
 * loses to the cookie being set).
 */
export async function fetchRoleRedirect(): Promise<string> {
  try {
    const res = await fetch('/api/auth/session', { cache: 'no-store' })
    if (!res.ok) return '/dashboard'
    const data = await res.json()
    if (!data?.user) return '/dashboard'
    return roleRedirectPath(data.user.role)
  } catch {
    return '/dashboard'
  }
}
