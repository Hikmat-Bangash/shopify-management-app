import { NextRequest, NextResponse } from 'next/server';
import { getStore } from '../../../lib/mongodb';

export async function GET(req) {
  const shop = req.nextUrl.searchParams.get('shop');
  
  if (!shop) {
    return NextResponse.json({ error: 'Shop parameter is required' }, { status: 400 });
  }

  try {
    const store = await getStore(shop);
    
    if (store) {
      return NextResponse.json({
        success: true,
        isLoggedIn: true,
        store: {
          shop: store.shop,
          storeId: store.storeId,
          createdAt: store.createdAt,
          updatedAt: store.updatedAt
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        isLoggedIn: false,
        store: null
      });
    }
  } catch (error) {
    console.error('Error checking store status:', error);
    return NextResponse.json({ error: 'Failed to check store status' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { shop, token, storeId } = await req.json();
    
    if (!shop || !token) {
      return NextResponse.json({ error: 'Shop and token are required' }, { status: 400 });
    }

    const { saveStore } = await import('../../../lib/mongodb');
    const result = await saveStore(shop, token, storeId);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving store:', error);
    return NextResponse.json({ error: 'Failed to save store' }, { status: 500 });
  }
} 