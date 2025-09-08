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