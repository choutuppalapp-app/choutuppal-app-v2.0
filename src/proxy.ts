import withAuth from 'next-auth/middleware'
import { authConfig } from '@/lib/auth.config'

/**
 * Route protection proxy (Next.js 16 native convention, replaces middleware).
 *
 *   /dashboard/*  -> any logged-in user
 *   /agent/*      -> AGENT or ADMIN
 *   /admin/*      -> ADMIN only
 *
 * Role/identity are read from the JWT via authConfig.callbacks (no DB calls in
 * the edge runtime). Sign-in lives at /login. NextAuth's `withAuth` returns a
 * handler compatible with the Next.js 16 proxy signature.
 */
export default withAuth({
  ...authConfig,
  callbacks: authConfig.callbacks,
  pages: authConfig.pages,
})

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/agent/:path*'],
}
