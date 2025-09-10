import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get('shop');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const limit = parseInt(searchParams.get('limit')) || 10;

    if (!shop) {
      return NextResponse.json({
        success: false,
        error: 'Shop parameter is required'
      }, { status: 400 });
    }

    const db = await connectToDatabase();
    const collection = db.collection('product_interactions');

    // Build query for date filtering
    const query = { shop };
    if (dateFrom || dateTo) {
      query.lastUpdated = {};
      if (dateFrom) {
        query.lastUpdated.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        query.lastUpdated.$lte = new Date(dateTo);
      }
    }

    // Get overall summary statistics
    const summaryPipeline = [
      { $match: query },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalCenterViews: { $sum: '$interactions.centerViews.count' },
          totalVariationViews: { $sum: '$interactions.variationViews.count' },
          totalAddToCart: { $sum: '$interactions.addToCart.count' },
          totalAllInteractions: { $sum: '$totalInteractions' }
        }
      }
    ];

    const summaryResult = await collection.aggregate(summaryPipeline).toArray();
    const summary = summaryResult[0] || {
      totalProducts: 0,
      totalCenterViews: 0,
      totalVariationViews: 0,
      totalAddToCart: 0,
      totalAllInteractions: 0
    };

    // Get top products by different criteria
    const topProductsByCenterViews = await collection
      .find(query)
      .sort({ 'interactions.centerViews.count': -1 })
      .limit(limit)
      .project({
        productId: 1,
        productName: 1,
        productImage: 1,
        'interactions.centerViews.count': 1,
        totalInteractions: 1
      })
      .toArray();

    const topProductsByVariationViews = await collection
      .find(query)
      .sort({ 'interactions.variationViews.count': -1 })
      .limit(limit)
      .project({
        productId: 1,
        productName: 1,
        productImage: 1,
        'interactions.variationViews.count': 1,
        totalInteractions: 1
      })
      .toArray();

    const topProductsByAddToCart = await collection
      .find(query)
      .sort({ 'interactions.addToCart.count': -1 })
      .limit(limit)
      .project({
        productId: 1,
        productName: 1,
        productImage: 1,
        'interactions.addToCart.count': 1,
        totalInteractions: 1
      })
      .toArray();

    const topProductsByTotalViews = await collection
      .find(query)
      .sort({ totalInteractions: -1 })
      .limit(limit)
      .project({
        productId: 1,
        productName: 1,
        productImage: 1,
        totalInteractions: 1
      })
      .toArray();

    // Get recent activity across all products
    const recentActivityPipeline = [
      { $match: query },
      {
        $project: {
          productId: 1,
          productName: 1,
          recentCenterViews: {
            $slice: ['$interactions.centerViews.timestamps', -3]
          },
          recentVariationViews: {
            $slice: ['$interactions.variationViews.timestamps', -3]
          },
          recentAddToCart: {
            $slice: ['$interactions.addToCart.timestamps', -3]
          }
        }
      },
      {
        $project: {
          productId: 1,
          productName: 1,
          allRecentActivity: {
            $concatArrays: [
              {
                $map: {
                  input: '$recentCenterViews',
                  as: 'timestamp',
                  in: {
                    productId: '$productId',
                    productName: '$productName',
                    interactionType: 'center_view',
                    timestamp: '$$timestamp'
                  }
                }
              },
              {
                $map: {
                  input: '$recentVariationViews',
                  as: 'timestamp',
                  in: {
                    productId: '$productId',
                    productName: '$productName',
                    interactionType: 'variation_view',
                    timestamp: '$$timestamp'
                  }
                }
              },
              {
                $map: {
                  input: '$recentAddToCart',
                  as: 'timestamp',
                  in: {
                    productId: '$productId',
                    productName: '$productName',
                    interactionType: 'add_to_cart',
                    timestamp: '$$timestamp'
                  }
                }
              }
            ]
          }
        }
      },
      { $unwind: '$allRecentActivity' },
      { $replaceRoot: { newRoot: '$allRecentActivity' } },
      { $sort: { timestamp: -1 } },
      { $limit: 20 }
    ];

    const recentActivity = await collection.aggregate(recentActivityPipeline).toArray();

    // Calculate conversion rates
    const conversionRates = {
      centerToVariation: summary.totalCenterViews > 0 ? 
        ((summary.totalVariationViews / summary.totalCenterViews) * 100).toFixed(2) : 0,
      variationToCart: summary.totalVariationViews > 0 ? 
        ((summary.totalAddToCart / summary.totalVariationViews) * 100).toFixed(2) : 0,
      centerToCart: summary.totalCenterViews > 0 ? 
        ((summary.totalAddToCart / summary.totalCenterViews) * 100).toFixed(2) : 0
    };

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalProducts: summary.totalProducts,
          totalCenterViews: summary.totalCenterViews,
          totalVariationViews: summary.totalVariationViews,
          totalAddToCart: summary.totalAddToCart,
          totalAllInteractions: summary.totalAllInteractions
        },
        conversionRates: {
          centerToVariation: parseFloat(conversionRates.centerToVariation),
          variationToCart: parseFloat(conversionRates.variationToCart),
          centerToCart: parseFloat(conversionRates.centerToCart)
        },
        topProducts: {
          byCenterViews: topProductsByCenterViews.map(p => ({
            productId: p.productId,
            productName: p.productName,
            productImage: p.productImage,
            centerViews: p.interactions.centerViews.count,
            totalInteractions: p.totalInteractions
          })),
          byVariationViews: topProductsByVariationViews.map(p => ({
            productId: p.productId,
            productName: p.productName,
            productImage: p.productImage,
            variationViews: p.interactions.variationViews.count,
            totalInteractions: p.totalInteractions
          })),
          byAddToCart: topProductsByAddToCart.map(p => ({
            productId: p.productId,
            productName: p.productName,
            productImage: p.productImage,
            addToCart: p.interactions.addToCart.count,
            totalInteractions: p.totalInteractions
          })),
          byTotalViews: topProductsByTotalViews.map(p => ({
            productId: p.productId,
            productName: p.productName,
            productImage: p.productImage,
            totalInteractions: p.totalInteractions
          }))
        },
        recentActivity: recentActivity.slice(0, 20)
      }
    });

  } catch (error) {
    console.error('Error retrieving analytics summary:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
