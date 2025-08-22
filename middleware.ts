import { NextRequest, NextResponse } from 'next/server';
import { env, isDevelopment } from './lib/config/env';

// Protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/inventory',
  '/transactions',
  '/users',
  '/settings',
  '/berita-acara',
  '/system-management'
];

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/unauthorized'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  // Get token from cookies or headers
  const token = request.cookies.get('accessToken')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '');

  // Handle API proxy for development
  if (pathname.startsWith('/api/')) {
    // Skip Next.js internal API routes
    if (pathname.startsWith('/api/_next/') || pathname.startsWith('/api/__nextjs')) {
      return NextResponse.next();
    }

    // Proxy to backend
    const backendUrl = new URL(pathname.replace('/api', ''), env.backendUrl);
    backendUrl.search = request.nextUrl.search;

    return NextResponse.rewrite(backendUrl);
  }

  // Handle uploads proxy for development
  if (pathname.startsWith('/uploads/')) {
    const backendUrl = new URL(pathname, env.backendUrl);
    return NextResponse.rewrite(backendUrl);
  }

  // Route protection logic
  if (isProtectedRoute && !token) {
    // Redirect to login if accessing protected route without token
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (token && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Add CORS headers for development
  const response = NextResponse.next();
  
  if (isDevelopment()) {
    response.headers.set('Access-Control-Allow-Origin', env.backendUrl);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
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
