import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js 16 proxy — Multi-Tenant domain interception + Protected route headers + Subdomain routing.
 */
export default function proxy(request: NextRequest) {
  const host = request.headers.get('host') || 'choutuppal.in'
  const cleanHost = host.split(':')[0].toLowerCase().trim()
  const url = request.nextUrl.clone()

  if (cleanHost.includes('franchise.choutuppal.in')) {
    // If visiting root of subdomain, serve the /franchise page
    if (url.pathname === '/') {
      url.pathname = '/franchise'
      return NextResponse.rewrite(url)
    }
    // If visiting any other path on subdomain, prepend /franchise
    if (!url.pathname.startsWith('/franchise')) {
      url.pathname = `/franchise${url.pathname}`
      return NextResponse.rewrite(url)
    }
  }

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-tenant-domain', cleanHost)

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
  response.headers.set('X-Protected-Route', 'true')
  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)'],
}
