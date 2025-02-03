import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { pb } from './lib/pocketbase'

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

export function middleware(request: NextRequest) {
  // You can add your middleware logic here
  // For now, just continue to the next middleware/route
  return NextResponse.next()
}
