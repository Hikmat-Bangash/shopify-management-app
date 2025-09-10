import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req, { params }) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get('shop');
    const { productId } = params;

    if (!shop) {
      return NextResponse.json({
        success: false,
        error: 'Shop parameter is required'
      }, { status: 400 });
    }

    if (!productId) {
      return NextResponse.json({
        success: false,
        error: 'Product ID is required'
      }, { status: 400 });
    }

    const db = await connectToDatabase();
    const collection = db.collection('product_interactions');

    // Find the specific product
    const product = await collection.findOne({ productId, shop });

    if (!product) {
      return NextResponse.json({
        success: false,
        error: 'Product not found'
      }, { status: 404 });
    }

    // Get recent activity (last 10 interactions)
    const recentActivity = [];
    
    // Get recent center views
    const recentCenterViews = product.interactions.centerViews.timestamps
      .slice(-5)
      .map(timestamp => ({
        interactionType: 'center_view',
        timestamp: timestamp
      }));

    // Get recent variation views
    const recentVariationViews = product.interactions.variationViews.timestamps
      .slice(-5)
      .map(timestamp => ({
        interactionType: 'variation_view',
        timestamp: timestamp
      }));

    // Get recent add to cart
    const recentAddToCart = product.interactions.addToCart.timestamps
      .slice(-5)
      .map(timestamp => ({
        interactionType: 'add_to_cart',
        timestamp: timestamp
      }));

    // Combine and sort by timestamp
    recentActivity.push(...recentCenterViews, ...recentVariationViews, ...recentAddToCart);
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    recentActivity.splice(10); // Keep only last 10

    // Calculate interaction rates
    const totalInteractions = product.totalInteractions;
    const centerViewRate = totalInteractions > 0 ? 
      ((product.interactions.centerViews.count / totalInteractions) * 100).toFixed(2) : 0;
    const variationViewRate = totalInteractions > 0 ? 
      ((product.interactions.variationViews.count / totalInteractions) * 100).toFixed(2) : 0;
    const addToCartRate = totalInteractions > 0 ? 
      ((product.interactions.addToCart.count / totalInteractions) * 100).toFixed(2) : 0;

    return NextResponse.json({
      success: true,
      data: {
        productId: product.productId,
        productName: product.productName,
        productImage: product.productImage,
        viewCounts: {
          centerViews: product.interactions.centerViews.count,
          variationViews: product.interactions.variationViews.count,
          addToCart: product.interactions.addToCart.count,
          totalViews: product.totalInteractions
        },
        interactionRates: {
          centerViewRate: parseFloat(centerViewRate),
          variationViewRate: parseFloat(variationViewRate),
          addToCartRate: parseFloat(addToCartRate)
        },
        recentActivity,
        lastUpdated: product.lastUpdated,
        createdAt: product.createdAt
      }
    });

  } catch (error) {
    console.error('Error retrieving product view analytics:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
