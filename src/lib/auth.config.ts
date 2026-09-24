import type { NextAuthOptions } from 'next-auth'

/**
 * Edge-safe NextAuth config (NO database access here).
 *
 * This object is imported by BOTH `middleware.ts` (edge runtime) and
 * `auth.ts` (node runtime). Anything that touches Prisma / bcrypt / node-only
 * modules must live in `auth.ts`, not here — otherwise middleware fails to
 * bundle for the edge runtime.
 */
export const authConfig = {
  session: { strategy: 'jwt' as const },
  pages: {
    signIn: '/login',
  },
  providers: [], // populated in src/lib/auth.ts (node runtime)
  callbacks: {
    /**
     * Attach role / username / isPublic to the JWT on sign-in.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? 'USER'
        token.username = (user as { username?: string | null }).username
        token.isPublic = (user as { isPublic?: boolean }).isPublic ?? false
        if (user.name) token.name = user.name
        if (user.email) token.email = user.email
        if (user.image) token.picture = user.image
      }
      const email = token.email?.toLowerCase()?.trim()
      if (email === 'choutuppalapp@gmail.com' || email === 'admin@choutuppal.in' || token.username === 'admin') {
        token.role = 'ADMIN'
      }
      return token
    },
    /** Surface the JWT fields on the session object for client/server use. */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) || session.user.id
        const email = session.user.email?.toLowerCase()?.trim() || token.email?.toLowerCase()?.trim()
        const isAdmin = email === 'choutuppalapp@gmail.com' || email === 'admin@choutuppal.in' || token.username === 'admin' || token.role === 'ADMIN' || token.role === 'SUPER_ADMIN'
        session.user.role = isAdmin ? 'ADMIN' : ((token.role as string) ?? 'USER')
        session.user.username = (token.username as string | null) ?? null
        session.user.isPublic = (token.isPublic as boolean) ?? false
        if (token.name) session.user.name = token.name as string
        if (token.email) session.user.email = token.email as string
        if (token.picture) session.user.image = token.picture as string
      }
      return session
    },
    /** Hardened redirect callback — ensures OAuth redirect navigates to dashboard instead of getting stuck on login. */
    async redirect({ url, baseUrl }) {
      if (!url || url.startsWith('postgresql://') || url.startsWith('postgres://')) {
        return `${baseUrl}/dashboard`
      }
      if (url === '/login' || url.startsWith('/login?') || url.startsWith('/login/')) {
        return `${baseUrl}/dashboard`
      }
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`
      }
      try {
        const parsed = new URL(url)
        if (parsed.origin === new URL(baseUrl).origin) {
          if (parsed.pathname === '/login') {
            return `${baseUrl}/dashboard`
          }
          return url
        }
      } catch {
        return `${baseUrl}/dashboard`
      }
      return baseUrl
    },
  },
} satisfies NextAuthOptions

export type AuthConfig = typeof authConfig
