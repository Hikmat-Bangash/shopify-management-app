import { NextRequest, NextResponse } from 'next/server';

export async function GET(req) {
  const shop = req.nextUrl.searchParams.get('shop');
  const token = req.nextUrl.searchParams.get('token');

  if (!shop || !token) {
    return new NextResponse('Missing shop or token', { status: 400 });
  }

  const response = await fetch(`https://${shop}/admin/api/2024-04/products.json`, {
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    return new NextResponse('Failed to fetch products', { status: 500 });
  }

  const data = await response.json();
  return NextResponse.json(data);
}