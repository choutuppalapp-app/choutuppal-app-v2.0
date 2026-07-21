import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js 16 proxy (replaces the deprecated `middleware` convention).
 *
 * Auth is enforced by Server Components (they call `getCurrentUser()` and
 * `redirect('/login')` when unauthenticated). This proxy is a thin pass-through
 * that only adds a cache-control header — the next-auth v4 `withAuth` wrapper
 * has a known incompatibility with Next.js 16's edge runtime (the JWT can't be
 * decoded in the proxy context), so we rely on the server-side guard instead,
 * which is the recommended Next.js 16 pattern.
 *
 * Matched routes: /dashboard/*, /admin/*, /agent/*
 */
export default function proxy(_request: NextRequest) {
  const response = NextResponse.next()
  response.headers.set('X-Protected-Route', 'true')
  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/agent/:path*'],
}
