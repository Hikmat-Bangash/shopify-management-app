// app/api/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { saveStore } from '../../../lib/mongodb';

export async function GET(req) {
  const code = req.nextUrl.searchParams.get('code');
  const shop = req.nextUrl.searchParams.get('shop');
  const apiKey = process.env.SHOPIFY_API_KEY;
  const apiSecret = process.env.SHOPIFY_API_SECRET;
  const ROOT_PATH = process.env.ROOT_PATH;

 // Add this check!
  if (!shop || !code) {
    return new NextResponse('Missing shop or code parameter', { status: 400 });
  }

  try {
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

    // Get shop information to get store ID
    let storeId = null;
    try {
      const shopResponse = await fetch(`https://${shop}/admin/api/2024-04/shop.json`, {
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json',
        },
      });
      
      if (shopResponse.ok) {
        const shopData = await shopResponse.json();
        storeId = shopData.shop.id;
        console.log('Store ID fetched:', storeId);
      }
    } catch (shopError) {
      console.error('Error fetching shop information:', shopError);
    }

    // Save store information to database
    try {
      const saveResult = await saveStore(shop, accessToken, storeId);
      console.log('Database save result:', saveResult.message);
    } catch (dbError) {
      console.error('Error saving to database:', dbError);
      // Continue with the flow even if database save fails
    }

    const res = NextResponse.redirect(ROOT_PATH);
    // Set cookies for shop and token
    res.cookies.set('shop', shop, { path: '/', httpOnly: false });
    res.cookies.set('token', accessToken, { path: '/', httpOnly: false });
    return res;
  } catch (error) {
    console.error('Error in callback:', error);
    return new NextResponse('Authentication failed', { status: 500 });
  }
}
