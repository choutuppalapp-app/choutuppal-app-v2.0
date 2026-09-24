import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Multi-Subdomain Routing Middleware (Next.js 15+ App Router)
 * 
 * Subdomain Mapping:
 * - `admin.choutuppal.in`   -> Rewrites to `/admin` & `/admin/*` routes
 * - `agent.choutuppal.in`   -> Rewrites to `/agent` & `/agent/*` (or `/dashboard`)
 * - `franchise.choutuppal.in` -> Rewrites to `/franchise` & `/franchise/*`
 * - `www.choutuppal.in` / `choutuppal.in` -> Public Website
 * 
 * In development / preview environments (localhost, Cloud Run, Vercel preview),
 * standard routing is preserved, while custom subdomain testing is supported via
 * ?subdomain=admin query param or x-forwarded-host header.
 */
export default function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl
  const host = request.headers.get('host') || 'www.choutuppal.in'
  const cleanHost = host.split(':')[0].toLowerCase().trim()

  // Determine active subdomain (support host header and dev ?subdomain= query override)
  let subdomain = ''
  if (cleanHost.startsWith('admin.')) {
    subdomain = 'admin'
  } else if (cleanHost.startsWith('agent.')) {
    subdomain = 'agent'
  } else if (cleanHost.startsWith('franchise.')) {
    subdomain = 'franchise'
  } else if (cleanHost.startsWith('www.')) {
    subdomain = 'www'
  } else if (searchParams.has('subdomain')) {
    subdomain = searchParams.get('subdomain') || ''
  }

  // Clone URL for potential rewriting
  const url = request.nextUrl.clone()

  // 1. Admin Subdomain (`admin.choutuppal.in`)
  if (subdomain === 'admin') {
    if (pathname === '/') {
      url.pathname = '/admin'
      const res = NextResponse.rewrite(url)
      setContextHeaders(res, 'admin', cleanHost, pathname)
      return res
    }
    if (!pathname.startsWith('/admin')) {
      url.pathname = `/admin${pathname}`
      const res = NextResponse.rewrite(url)
      setContextHeaders(res, 'admin', cleanHost, pathname)
      return res
    }
  }

  // 2. Agent Subdomain (`agent.choutuppal.in`)
  if (subdomain === 'agent') {
    if (pathname === '/') {
      url.pathname = '/agent'
      const res = NextResponse.rewrite(url)
      setContextHeaders(res, 'agent', cleanHost, pathname)
      return res
    }
    if (!pathname.startsWith('/agent') && !pathname.startsWith('/dashboard')) {
      url.pathname = `/agent${pathname}`
      const res = NextResponse.rewrite(url)
      setContextHeaders(res, 'agent', cleanHost, pathname)
      return res
    }
  }

  // 3. Franchise Subdomain (`franchise.choutuppal.in`)
  if (subdomain === 'franchise') {
    if (pathname === '/') {
      url.pathname = '/franchise'
      const res = NextResponse.rewrite(url)
      setContextHeaders(res, 'franchise', cleanHost, pathname)
      return res
    }
    if (!pathname.startsWith('/franchise')) {
      url.pathname = `/franchise${pathname}`
      const res = NextResponse.rewrite(url)
      setContextHeaders(res, 'franchise', cleanHost, pathname)
      return res
    }
  }

  // Default: Public Website
  const response = NextResponse.next()
  setContextHeaders(response, subdomain || 'root', cleanHost, pathname)
  return response
}

function setContextHeaders(
  response: NextResponse,
  subdomain: string,
  host: string,
  pathname: string
) {
  response.headers.set('x-subdomain', subdomain)
  response.headers.set('x-tenant-domain', host)
  response.headers.set('x-pathname', pathname)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - API routes (/api/*)
     * - Next.js internal static assets (_next/static, _next/image)
     * - Favicon, robots, sitemap, manifest, assetlinks
     * - Image/Media files (.svg, .png, .jpg, .jpeg, .gif, .webp, .ico, .woff, .woff2)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|manifest.webmanifest|.well-known|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2)$).*)',
  ],
}
