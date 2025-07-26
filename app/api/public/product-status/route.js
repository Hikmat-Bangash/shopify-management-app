import { NextRequest, NextResponse } from 'next/server';
import { saveProductStatus, getAllProductStatuses } from '../../../../lib/mongodb';

// Optional API key validation (same as settings)
function validateApiKey(req) {
  const apiKey = req.headers.get('X-API-Key');
  const expectedApiKey = process.env.API_KEY;
  
  // If no API key is configured, allow all requests
  if (!expectedApiKey) {
    return true;
  }
  
  return apiKey === expectedApiKey;
}

// Input validation
function validateProductStatusData(data) {
  const errors = [];
  
  if (!data.shop) {
    errors.push('shop is required');
  }
  
  if (!data.productId) {
    errors.push('productId is required');
  }
  
  if (typeof data.isActive !== 'boolean') {
    errors.push('isActive must be a boolean');
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

    const statuses = await getAllProductStatuses(shop);
    
    return NextResponse.json({
      success: true,
      data: {
        shop,
        statuses: statuses,
        count: statuses.length
      },
      message: 'Product statuses retrieved successfully'
    });
  } catch (error) {
    console.error('Error getting product statuses:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve product statuses'
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
    const validationErrors = validateProductStatusData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        message: 'Invalid input data',
        details: validationErrors
      }, { status: 400 });
    }

    const { shop, productId, isActive } = body;

    const result = await saveProductStatus(shop, productId, isActive);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          shop,
          productId,
          isActive,
          message: result.message,
          updatedAt: new Date()
        },
        message: 'Product status saved successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to save product status'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error saving product status:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to save product status'
    }, { status: 500 });
  }
} 