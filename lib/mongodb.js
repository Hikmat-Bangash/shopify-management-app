import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
console.log("database url >> ", uri);

// MongoDB connection options with timeout settings
const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  maxPoolSize: 10, // Maintain up to 10 socket connections
  retryWrites: true,
  w: 'majority'
});

export async function connectToDatabase() {
  try {
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await client.connect();
    console.log('Connected to MongoDB');
    return client.db('seller-management');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

export async function saveStore(shop, token, storeId = null) {
  try {
    const db = await connectToDatabase();
    const storesCollection = db.collection('store');
    
    // Check if store already exists
    const existingStore = await storesCollection.findOne({ shop });
    
    if (existingStore) {
      console.log('Store already exists in database:', shop);
      return { success: true, message: 'Store already exists', data: existingStore };
    }
    
    // Save new store
    const storeData = {
      shop,
      token,
      storeId,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await storesCollection.insertOne(storeData);
    console.log('Store saved to database:', shop);
    
    return { 
      success: true, 
      message: 'Store saved successfully', 
      data: { ...storeData, _id: result.insertedId }
    };
  } catch (error) {
    console.error('Error saving store to database:', error);
    throw error;
  }
}

export async function getStore(shop) {
  try {
    const db = await connectToDatabase();
    const storesCollection = db.collection('store');
    
    const store = await storesCollection.findOne({ shop });
    return store;
  } catch (error) {
    console.error('Error getting store from database:', error);
    throw error;
  }
}

export async function updateStore(shop, updates) {
  try {
    const db = await connectToDatabase();
    const storesCollection = db.collection('store');
    
    const result = await storesCollection.updateOne(
      { shop },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        } 
      }
    );
    
    return result;
  } catch (error) {
    console.error('Error updating store in database:', error);
    throw error;
  }
}

export async function saveSettings(shop, settings) {
  try {
    const db = await connectToDatabase();
    const settingsCollection = db.collection('settings');
    
    // Check if settings already exist for this shop
    const existingSettings = await settingsCollection.findOne({ shop });
    
    if (existingSettings) {
      // Update existing settings
      const result = await settingsCollection.updateOne(
        { shop },
        { 
          $set: { 
            ...settings, 
            updatedAt: new Date() 
          } 
        }
      );
      console.log('Settings updated for shop:', shop);
      return { success: true, message: 'Settings updated successfully', data: result };
    } else {
      // Save new settings
      const settingsData = {
        shop,
        ...settings,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await settingsCollection.insertOne(settingsData);
      console.log('Settings saved for shop:', shop);
      return { 
        success: true, 
        message: 'Settings saved successfully', 
        data: { ...settingsData, _id: result.insertedId }
      };
    }
  } catch (error) {
    console.error('Error saving settings to database:', error);
    throw error;
  }
}

export async function getSettings(shop) {
  try {
    const db = await connectToDatabase();
    const settingsCollection = db.collection('settings');
    
    const settings = await settingsCollection.findOne({ shop });
    return settings;
  } catch (error) {
    console.error('Error getting settings from database:', error);
    throw error;
  }
}

export async function closeConnection() {
  try {
    await client.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
}

// Product status functions
export async function saveProductStatus(shop, productId, isActive) {
  try {
    const db = await connectToDatabase();
    const productStatusCollection = db.collection('product_status');
    
    // Check if product status already exists
    const existingStatus = await productStatusCollection.findOne({ shop, productId });
    
    if (existingStatus) {
      // Update existing status
      const result = await productStatusCollection.updateOne(
        { shop, productId },
        { 
          $set: { 
            isActive, 
            updatedAt: new Date() 
          } 
        }
      );
      console.log('Product status updated for shop:', shop, 'product:', productId);
      return { success: true, message: 'Product status updated successfully', data: result };
    } else {
      // Save new status
      const statusData = {
        shop,
        productId,
        isActive,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await productStatusCollection.insertOne(statusData);
      console.log('Product status saved for shop:', shop, 'product:', productId);
      return { 
        success: true, 
        message: 'Product status saved successfully', 
        data: { ...statusData, _id: result.insertedId }
      };
    }
  } catch (error) {
    console.error('Error saving product status to database:', error);
    throw error;
  }
}

export async function getProductStatus(shop, productId) {
  try {
    const db = await connectToDatabase();
    const productStatusCollection = db.collection('product_status');
    
    const status = await productStatusCollection.findOne({ shop, productId });
    return status;
  } catch (error) {
    console.error('Error getting product status from database:', error);
    throw error;
  }
}

export async function getAllProductStatuses(shop) {
  try {
    const db = await connectToDatabase();
    const productStatusCollection = db.collection('product_status');
    
    const statuses = await productStatusCollection.find({ shop }).toArray();
    return statuses;
  } catch (error) {
    console.error('Error getting all product statuses from database:', error);
    throw error;
  }
}

// Product interaction tracking functions
export async function trackProductInteractions(shop, interactions) {
  try {
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

        results.processed++;
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
    }

    return results;

  } catch (error) {
    console.error('Error tracking product interactions:', error);
    throw error;
  }
}

export async function getProductInteractions(shop, options = {}) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('product_interactions');

    const {
      productId,
      interactionType,
      limit = 10,
      offset = 0,
      sortBy = 'lastUpdated',
      order = 'desc',
      dateFrom,
      dateTo
    } = options;

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
      case 'totalInteractions':
        sortCriteria = { totalInteractions: sortOrder };
        break;
      case 'lastUpdated':
      default:
        sortCriteria = { lastUpdated: sortOrder };
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

    return {
      products,
      total,
      limit,
      offset,
      hasMore: offset + limit < total
    };

  } catch (error) {
    console.error('Error getting product interactions:', error);
    throw error;
  }
}

export async function getProductInteractionSummary(shop, options = {}) {
  try {
    const db = await connectToDatabase();
    const collection = db.collection('product_interactions');

    const { dateFrom, dateTo, limit = 10 } = options;

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
      .toArray();

    const topProductsByVariationViews = await collection
      .find(query)
      .sort({ 'interactions.variationViews.count': -1 })
      .limit(limit)
      .toArray();

    const topProductsByAddToCart = await collection
      .find(query)
      .sort({ 'interactions.addToCart.count': -1 })
      .limit(limit)
      .toArray();

    const topProductsByTotalViews = await collection
      .find(query)
      .sort({ totalInteractions: -1 })
      .limit(limit)
      .toArray();

    return {
      summary,
      topProducts: {
        byCenterViews: topProductsByCenterViews,
        byVariationViews: topProductsByVariationViews,
        byAddToCart: topProductsByAddToCart,
        byTotalViews: topProductsByTotalViews
      }
    };

  } catch (error) {
    console.error('Error getting product interaction summary:', error);
    throw error;
  }
} 