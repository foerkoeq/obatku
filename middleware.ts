import { NextRequest, NextResponse } from 'next/server';
import { isDevelopment } from './lib/config/env';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Frontend-first mode: set landing page to dashboard
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Handle API proxy for development
  // Frontend-only mode: no backend proxying, only pass-through with basic CORS headers
  if (pathname.startsWith('/api/')) {
    // Skip Next.js internal API routes
    if (pathname.startsWith('/api/_next/') || pathname.startsWith('/api/__nextjs')) {
      return NextResponse.next();
    }

    // Let Next.js rewrites handle the proxying
    // Just ensure CORS headers are set
    const response = NextResponse.next();
    
    // Add CORS headers for API requests
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    
    return response;
  }

  // Add CORS headers for development
  const response = NextResponse.next();
  
  if (isDevelopment()) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
