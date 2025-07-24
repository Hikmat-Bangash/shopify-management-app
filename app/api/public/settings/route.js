import { NextRequest, NextResponse } from 'next/server';
import { getSettings, saveSettings } from '../../../../lib/mongodb';

/**
 * Public API endpoint for settings management
 * 
 * GET /api/public/settings?shop={shop}
 * POST /api/public/settings
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
function validateSettingsData(data) {
  const errors = [];
  
  if (!data.shop) {
    errors.push('shop is required');
  }
  
  if (data.topValue && !['home', 'catalog', 'contact', 'product'].includes(data.topValue)) {
    errors.push('topValue must be one of: home, catalog, contact, product');
  }
  
  if (data.xAxis && !['all', 'layer1', 'layer2', 'layer3'].includes(data.xAxis)) {
    errors.push('xAxis must be one of: all, layer1, layer2, layer3');
  }
  
  if (data.yAxis && !['layer2', 'layer3', 'variants', 'none'].includes(data.yAxis)) {
    errors.push('yAxis must be one of: layer2, layer3, variants, none');
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

    const settings = await getSettings(shop);
    
    if (settings) {
      return NextResponse.json({
        success: true,
        data: {
          shop: settings.shop,
          topValue: settings.topValue,
          xAxis: settings.xAxis,
          yAxis: settings.yAxis,
          xAxisCollections: settings.xAxisCollections || [],
          yAxisCollections: settings.yAxisCollections || [],
          createdAt: settings.createdAt,
          updatedAt: settings.updatedAt
        },
        message: 'Settings retrieved successfully'
      });
    } else {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No settings found for this shop'
      });
    }
  } catch (error) {
    console.error('Error getting settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to retrieve settings'
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
    const validationErrors = validateSettingsData(body);
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Validation failed',
        message: 'Invalid input data',
        details: validationErrors
      }, { status: 400 });
    }

    const { shop, topValue, xAxis, yAxis, xAxisCollections, yAxisCollections } = body;

    const settingsData = {
      topValue: topValue || '',
      xAxis: xAxis || '',
      yAxis: yAxis || '',
      xAxisCollections: xAxisCollections || [],
      yAxisCollections: yAxisCollections || []
    };

    const result = await saveSettings(shop, settingsData);
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        data: {
          shop,
          message: result.message,
          updatedAt: new Date()
        },
        message: 'Settings saved successfully'
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Database error',
        message: 'Failed to save settings'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: 'Failed to save settings'
    }, { status: 500 });
  }
} 