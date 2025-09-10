import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get('shop');
    const productId = searchParams.get('productId');
    const sortBy = searchParams.get('sortBy') || 'totalViews';
    const order = searchParams.get('order') || 'desc';
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = parseInt(searchParams.get('offset')) || 0;
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

    if (!shop) {
      return NextResponse.json({
        success: false,
        error: 'Shop parameter is required'
      }, { status: 400 });
    }

    const db = await connectToDatabase();
    const collection = db.collection('product_interactions');

    // Build query
    const query = { shop };
    if (productId) {
      query.productId = productId;
    }

    // Add date filters if provided
    if (dateFrom || dateTo) {
      query.lastUpdated = {};
      if (dateFrom) {
        query.lastUpdated.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.lastUpdated.$lte = new Date(dateTo);
      }
    }

    // Build sort criteria
    let sortCriteria = {};
    const sortOrder = order === 'asc' ? 1 : -1;
    
    switch (sortBy) {
      case 'centerViews':
        sortCriteria = { 'interactions.centerViews.count': sortOrder };
        break;
      case 'variationViews':
        sortCriteria = { 'interactions.variationViews.count': sortOrder };
        break;
      case 'addToCart':
        sortCriteria = { 'interactions.addToCart.count': sortOrder };
        break;
      case 'totalViews':
      default:
        sortCriteria = { totalInteractions: sortOrder };
        break;
    }

    // Get products with pagination
    const products = await collection
      .find(query)
      .sort(sortCriteria)
      .skip(offset)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(query);

    // Get summary statistics
    const summaryPipeline = [
      { $match: query },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalCenterViews: { $sum: '$interactions.centerViews.count' },
          totalVariationViews: { $sum: '$interactions.variationViews.count' },
          totalAddToCart: { $sum: '$interactions.addToCart.count' },
          totalAllViews: { $sum: '$totalInteractions' }
        }
      }
    ];

    const summaryResult = await collection.aggregate(summaryPipeline).toArray();
    const summary = summaryResult[0] || {
      totalProducts: 0,
      totalCenterViews: 0,
      totalVariationViews: 0,
      totalAddToCart: 0,
      totalAllViews: 0
    };

    // Format response
    const formattedProducts = products.map(product => ({
      productId: product.productId,
      productName: product.productName,
      productImage: product.productImage,
      viewCounts: {
        centerViews: product.interactions.centerViews.count,
        variationViews: product.interactions.variationViews.count,
        addToCart: product.interactions.addToCart.count,
        totalViews: product.totalInteractions
      },
      lastUpdated: product.lastUpdated,
      createdAt: product.createdAt
    }));

    return NextResponse.json({
      success: true,
      data: {
        products: formattedProducts,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        },
        summary: {
          totalProducts: summary.totalProducts,
          totalCenterViews: summary.totalCenterViews,
          totalVariationViews: summary.totalVariationViews,
          totalAddToCart: summary.totalAddToCart,
          totalAllViews: summary.totalAllViews
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving product analytics:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
