import { NextRequest, NextResponse } from 'next/server';
import { getStore, saveStore } from '../../../../lib/mongodb';

/**
 * Public API endpoint for store management
 * 
 * GET /api/public/store?shop={shop}
 * POST /api/public/store
 * 
 * Headers:
 * - Content-Type: application/json
 * - X-API-Key: {api_key} (optional)
 */

// API key validation (optional)
function validateApiKey(request) {
  const apiKey = request.headers.get('x-api-key');
  const validApiKey = process.env.PUBLIC_API_KEY;
  
  // If no API key is configured, allow all requests
  if (!validApiKey) return true;
  
  return apiKey === validApiKey;
}

// Input validation
function validateStoreData(data) {
  const errors = [];
  
  if (!data.shop) {
    errors.push('shop is required');
  }
  
  if (!data.token) {
    errors.push('token is required');
  }
  
  return errors;
}

export async function GET(req) {
  try {
    // Optional API key validation
    if (!validateApiKey(req)) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or missing API key'
      }, { status: 401 });
    }

    const shop = req.nextUrl.searchParams.get('shop');
    
    if (!shop) {
      return NextResponse.json({
        success: false,
        error: 'Missing parameter',
        message: 'shop parameter is required'
      }, { status: 400 });
    }

    const store = await getStore(shop);
    
    if (store) {
      return NextResponse.json({
        success: true,
        data: {
          shop: store.shop,
          storeId: store.storeId,
          createdAt: store.createdAt,
          updatedAt: store.updatedAt
        },
        message: 'Store found'
      });
    } else {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'Store not found'
      });
    }
  } catch (error) {
    console.error('Error getting store:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve store data'
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // Optional API key validation
    if (!validateApiKey(req)) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
        message: 'Invalid or missing API key'
      }, { status: 401 });
    }

    const body = await req.json();
    
    // Validate input
    const validationErrors = validateStoreData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        message: 'Invalid input data',
        details: validationErrors
      }, { status: 400 });
    }

    const { shop, token, storeId } = body;

    const result = await saveStore(shop, token, storeId);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          shop,
          message: result.message,
          updatedAt: new Date()
        },
        message: 'Store saved successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to save store'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error saving store:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to save store'
    }, { status: 500 });
  }
} 