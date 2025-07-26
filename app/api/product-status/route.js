import { NextRequest, NextResponse } from 'next/server';
import { saveProductStatus, getAllProductStatuses } from '../../../lib/mongodb';

export async function GET(req) {
  const shop = req.nextUrl.searchParams.get('shop');
  
  if (!shop) {
    return NextResponse.json({ error: 'Shop parameter is required' }, { status: 400 });
  }

  try {
    const statuses = await getAllProductStatuses(shop);
    return NextResponse.json({
      success: true,
      statuses: statuses
    });
  } catch (error) {
    console.error('Error getting product statuses:', error);
    return NextResponse.json({ error: 'Failed to get product statuses' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { shop, productId, isActive } = await req.json();
    
    if (!shop || !productId || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Shop, productId, and isActive are required' }, { status: 400 });
    }

    const result = await saveProductStatus(shop, productId, isActive);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving product status:', error);
    return NextResponse.json({ error: 'Failed to save product status' }, { status: 500 });
  }
} 