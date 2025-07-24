import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Handle CORS for API routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Set CORS headers for API routes
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key');
    response.headers.set('Access-Control-Max-Age', '86400');
    
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
    
    return response;
  }
  
  // Handle authentication for protected routes (existing logic)
  if (pathname === '/') return NextResponse.next();

  const shop = request.cookies.get('shop')?.value;
  const token = request.cookies.get('token')?.value;

  if (!shop || !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/:path*',
    '/dashboard',
    '/settings',
    '/products'
  ],
};