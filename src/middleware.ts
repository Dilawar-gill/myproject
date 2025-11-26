import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken, COOKIE_NAME } from './lib/auth'

/**
 * Middleware to protect routes and handle authentication
 * Runs before every request to check if user is authenticated
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const token = req.cookies.get(COOKIE_NAME)?.value

  // Allow Next.js internal routes and static files
  if (pathname.startsWith('/_next') || pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Public routes that don't require authentication
  const publicPaths = ['/login']
  const isPublicPath = publicPaths.includes(pathname)

  // Verify token
  const isAuthenticated = token ? verifyToken(token) !== null : false

  // If user is on login page and already authenticated, redirect to home
  if (pathname === '/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/', req.url))
    }
    // Not authenticated, allow access to login page
    return NextResponse.next()
  }

  // If user is trying to access protected route without authentication, redirect to login
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Allow the request to proceed
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
