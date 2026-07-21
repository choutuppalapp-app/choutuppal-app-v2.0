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
     * Attach role / username / isPublic to the JWT on first sign-in.
     * `user` is only present immediately after authorize() / OAuth sign-in.
     */
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role ?? 'USER'
        token.username = (user as { username?: string | null }).username
        token.isPublic = (user as { isPublic?: boolean }).isPublic ?? false
      }
      return token
    },
    /** Surface the JWT fields on the session object for client/server use. */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = (token.role as string) ?? 'USER'
        session.user.username = (token.username as string | null) ?? null
        session.user.isPublic = (token.isPublic as boolean) ?? false
      }
      return session
    },
    /**
     * Middleware gate. `auth` is the decoded session (runs the session callback
     * above, so `auth.user.role` is populated). Runs in the edge runtime.
     */
    authorized({ auth, request }) {
      const pathname = request.nextUrl.pathname
      const isLoggedIn = !!auth?.user
      const role = (auth?.user as { role?: string } | undefined)?.role

      if (pathname.startsWith('/admin')) {
        return isLoggedIn && role === 'ADMIN'
      }
      if (pathname.startsWith('/agent')) {
        return isLoggedIn && (role === 'AGENT' || role === 'ADMIN')
      }
      if (pathname.startsWith('/dashboard')) {
        return isLoggedIn
      }
      return true
    },
  },
} satisfies NextAuthOptions

export type AuthConfig = typeof authConfig
