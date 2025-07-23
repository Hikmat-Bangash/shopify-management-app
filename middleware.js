import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  // Allow public access to login page
  if (pathname === '/') return NextResponse.next();

  const shop = request.cookies.get('shop')?.value;
  const token = request.cookies.get('token')?.value;

  if (!shop || !token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard', '/settings'],
};