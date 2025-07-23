// app/api/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req) {
  const code = req.nextUrl.searchParams.get('code');
  const shop = req.nextUrl.searchParams.get('shop');
  const apiKey = process.env.SHOPIFY_API_KEY;
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  const SHOPIFY_REDIRECT_URI = process.env.SHOPIFY_REDIRECT_URI;

  const response = await fetch(
    `https://${shop}/admin/oauth/access_token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: apiKey,
        client_secret: apiSecret,
        code,
      }),
    }
  );

  const data = await response.json();
  const accessToken = data.access_token;

  // Set cookies for shop and token
  const res = NextResponse.redirect(SHOPIFY_REDIRECT_URI);
  res.cookies.set('shop', shop, { path: '/', httpOnly: false });
  res.cookies.set('token', accessToken, { path: '/', httpOnly: false });
  return res;
}
