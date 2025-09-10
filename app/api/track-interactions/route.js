import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req) {
  try {
    const body = await req.json();
    const { interactions, shop } = body;

    // Validate required fields
    if (!interactions || !Array.isArray(interactions) || interactions.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request: interactions array is required and must not be empty'
      }, { status: 400 });
    }

    if (!shop) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request: shop parameter is required'
      }, { status: 400 });
    }

    // Validate each interaction
    for (const interaction of interactions) {
      if (!interaction.productId || !interaction.productName || !interaction.interactionType) {
        return NextResponse.json({
          success: false,
          error: 'Invalid interaction: productId, productName, and interactionType are required'
        }, { status: 400 });
      }

      if (!['center_view', 'variation_view', 'add_to_cart'].includes(interaction.interactionType)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid interactionType: must be center_view, variation_view, or add_to_cart'
        }, { status: 400 });
      }
    }

    const db = await connectToDatabase();
    const collection = db.collection('product_interactions');

    const results = {
      processed: 0,
      updated: 0,
      created: 0,
      productCounts: {}
    };

    // Process each interaction
    for (const interaction of interactions) {
      const {
        productId,
        productName,
        productImage = '',
        interactionType,
        count = 1,
        timestamps = [new Date()]
      } = interaction;

      // Map interaction types to consistent field names
      const fieldMapping = {
        'center_view': 'centerViews',
        'variation_view': 'variationViews',
        'add_to_cart': 'addToCart'
      };

      const fieldName = fieldMapping[interactionType];
      if (!fieldName) {
        console.error(`Invalid interaction type: ${interactionType}`);
        continue;
      }

      // Prepare update operation
      const updateOperation = {
        $set: {
          productName,
          productImage,
          lastUpdated: new Date()
        },
        $inc: {
          [`interactions.${fieldName}.count`]: count,
          totalInteractions: count
        },
        $push: {
          [`interactions.${fieldName}.timestamps`]: { $each: timestamps }
        },
        $setOnInsert: {
          shop,
          createdAt: new Date()
        }
      };

      try {
        // First, ensure the document exists with proper structure
        await collection.updateOne(
          { productId, shop },
          {
            $setOnInsert: {
              shop,
              createdAt: new Date(),
              interactions: {
                centerViews: { count: 0, timestamps: [] },
                variationViews: { count: 0, timestamps: [] },
                addToCart: { count: 0, timestamps: [] }
              },
              totalInteractions: 0
            }
          },
          { upsert: true }
        );

        // Now update with the actual data
        const result = await collection.updateOne(
          { productId, shop },
          updateOperation
        );

        if (result.upsertedId) {
          results.created++;
        } else {
          results.updated++;
        }

        // Get current counts for this product
        const product = await collection.findOne({ productId, shop });
        if (product) {
          results.productCounts[productId] = {
            centerViews: product.interactions.centerViews.count,
            variationViews: product.interactions.variationViews.count,
            addToCart: product.interactions.addToCart.count,
            totalInteractions: product.totalInteractions
          };
        }

      } catch (error) {
        console.error(`Error processing interaction for product ${productId}:`, error);
        // Continue with other interactions even if one fails
      }

      // Always increment processed count
      results.processed++;
    }

    return NextResponse.json({
      success: true,
      message: 'Interactions tracked successfully',
      data: results
    });

  } catch (error) {
    console.error('Error tracking interactions:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

// GET endpoint to retrieve interaction data
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const shop = searchParams.get('shop');
    const productId = searchParams.get('productId');
    const interactionType = searchParams.get('interactionType');
    const limit = parseInt(searchParams.get('limit')) || 10;
    const offset = parseInt(searchParams.get('offset')) || 0;

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

    // Build sort criteria
    let sortCriteria = { lastUpdated: -1 };
    if (interactionType) {
      sortCriteria = { [`interactions.${interactionType}.count`]: -1 };
    }

    const products = await collection
      .find(query)
      .sort(sortCriteria)
      .skip(offset)
      .limit(limit)
      .toArray();

    const total = await collection.countDocuments(query);

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
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving interactions:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
