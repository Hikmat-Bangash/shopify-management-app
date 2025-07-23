// app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req) {
  const shop = req.nextUrl.searchParams.get('shop');
  const state = Math.random().toString(36).substring(7);
  const redirectUri = process.env.SHOPIFY_REDIRECT_URI;
  const scopes = process.env.SHOPIFY_SCOPES;
  const apiKey = process.env.SHOPIFY_API_KEY;

  if (!shop) {
    // Show an error or ask for shop domain
    return new NextResponse('Missing shop parameter', { status: 400 });
  }

  const authUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&redirect_uri=${redirectUri}&state=${state}`;
  return NextResponse.redirect(authUrl);
}
