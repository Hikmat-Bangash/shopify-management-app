import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req) {
  try {
    const { shop } = await req.json();

    if (!shop) {
      return NextResponse.json({
        success: false,
        error: 'Shop parameter is required'
      }, { status: 400 });
    }

    const db = await connectToDatabase();
    const collection = db.collection('product_interactions');

    // Find all documents with inconsistent field names
    const documents = await collection.find({ shop }).toArray();
    
    let updatedCount = 0;
    const operations = [];

    for (const doc of documents) {
      const updateOps = {};
      let needsUpdate = false;

      // Check for inconsistent field names and fix them
      if (doc.interactions) {
        // Fix center_view -> centerViews
        if (doc.interactions.center_view) {
          if (!doc.interactions.centerViews) {
            doc.interactions.centerViews = { count: 0, timestamps: [] };
          }
          doc.interactions.centerViews.count += doc.interactions.center_view.count || 0;
          doc.interactions.centerViews.timestamps.push(...(doc.interactions.center_view.timestamps || []));
          delete doc.interactions.center_view;
          needsUpdate = true;
        }

        // Fix variation_view -> variationViews
        if (doc.interactions.variation_view) {
          if (!doc.interactions.variationViews) {
            doc.interactions.variationViews = { count: 0, timestamps: [] };
          }
          doc.interactions.variationViews.count += doc.interactions.variation_view.count || 0;
          doc.interactions.variationViews.timestamps.push(...(doc.interactions.variation_view.timestamps || []));
          delete doc.interactions.variation_view;
          needsUpdate = true;
        }

        // Ensure all required fields exist
        if (!doc.interactions.centerViews) {
          doc.interactions.centerViews = { count: 0, timestamps: [] };
          needsUpdate = true;
        }
        if (!doc.interactions.variationViews) {
          doc.interactions.variationViews = { count: 0, timestamps: [] };
          needsUpdate = true;
        }
        if (!doc.interactions.addToCart) {
          doc.interactions.addToCart = { count: 0, timestamps: [] };
          needsUpdate = true;
        }

        // Recalculate totalInteractions
        const newTotal = (doc.interactions.centerViews.count || 0) + 
                        (doc.interactions.variationViews.count || 0) + 
                        (doc.interactions.addToCart.count || 0);
        
        if (doc.totalInteractions !== newTotal) {
          doc.totalInteractions = newTotal;
          needsUpdate = true;
        }

        if (needsUpdate) {
          operations.push({
            updateOne: {
              filter: { _id: doc._id },
              update: {
                $set: {
                  interactions: doc.interactions,
                  totalInteractions: doc.totalInteractions,
                  lastUpdated: new Date()
                }
              }
            }
          });
        }
      }
    }

    if (operations.length > 0) {
      const result = await collection.bulkWrite(operations);
      updatedCount = result.modifiedCount;
    }

    return NextResponse.json({
      success: true,
      message: 'Database cleanup completed',
      data: {
        totalDocuments: documents.length,
        updatedDocuments: updatedCount
      }
    });

  } catch (error) {
    console.error('Error cleaning up database:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}
