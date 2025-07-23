import { NextResponse } from 'next/server';

export async function GET(req) {
  // Get the origin from the request headers
  const origin = req.nextUrl.origin;
  const response = NextResponse.redirect(origin + '/login');
  response.cookies.set('shop', '', { path: '/', maxAge: 0 });
  response.cookies.set('token', '', { path: '/', maxAge: 0 });
  return response;
}