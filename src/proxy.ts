import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js 16 proxy — Multi-Tenant domain interception + Protected route headers.
 */
export default function proxy(request: NextRequest) {
  const host = request.headers.get('host') || 'choutuppal.in'
  const cleanHost = host.split(':')[0].toLowerCase().trim()

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
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|webmanifest)$).*)'],
}
