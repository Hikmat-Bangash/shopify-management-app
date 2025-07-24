import { NextRequest, NextResponse } from 'next/server';

export async function GET(req) {
  const shop = req.nextUrl.searchParams.get('shop');
  const token = req.nextUrl.searchParams.get('token');

  if (!shop || !token) {
    return NextResponse.json({ error: 'Missing shop or token' }, { status: 400 });
  }

  try {
    // Get shop information from Shopify API
    const response = await fetch(`https://${shop}/admin/api/2024-04/shop.json`, {
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch shop information' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      shop: data.shop
    });
  } catch (error) {
    console.error('Error fetching shop information:', error);
    return NextResponse.json({ error: 'Failed to fetch shop information' }, { status: 500 });
  }
} 