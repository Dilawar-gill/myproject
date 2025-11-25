import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, COOKIE_NAME } from './lib/auth'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public routes
  if (pathname === '/login' || pathname.startsWith('/api/') || pathname.startsWith('/_next')) {
    return NextResponse.next()
  }

  // For now, allow all routes (auth is optional)
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*', '/invoices/:path*'],
}
