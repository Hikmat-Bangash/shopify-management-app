# MongoDB Integration for Seller Management App

## Overview
This document describes the MongoDB integration implemented for the Shopify Seller Management app. The integration saves store information (shop, token, and storeId) to a MongoDB database after successful authentication.

## Database Schema

### Store Collection
The `store` collection contains the following fields:
- `shop` (String): The Shopify shop domain (e.g., "your-store.myshopify.com")
- `token` (String): The Shopify access token
- `storeId` (Number): The Shopify store ID (optional, fetched from Shopify API)
- `createdAt` (Date): When the store was first saved
- `updatedAt` (Date): When the store was last updated

### Settings Collection
The `settings` collection contains the following fields:
- `shop` (String): The Shopify shop domain (foreign key to store collection)
- `topValue` (String): The selected product root option (home, catalog, contact, product)
- `xAxis` (String): The X-axis display mode (all, level1, level2, level3)
- `yAxis` (String): The Y-axis display mode (level2, level3, variants, none)
- `xAxisCollections` (Array): Array of collection objects selected for X-axis
- `yAxisCollections` (Array): Array of collection objects selected for Y-axis
- `createdAt` (Date): When the settings were first saved
- `updatedAt` (Date): When the settings were last updated

#### Collection Object Structure
Each collection object in the arrays contains:
- `id` (String): Shopify collection ID
- `title` (String): Collection title
- `handle` (String): Collection handle
- `description` (String): Collection description
- `image` (Object): Collection image data
- `level` (Number): Collection hierarchy level (1, 2, 3)
- `products` (Array): Array of products in the collection

## Implementation Details

### 1. MongoDB Connection (`lib/mongodb.js`)
- Connects to MongoDB Atlas using the provided connection string
- Provides functions for database operations:
  - `connectToDatabase()`: Establishes connection to MongoDB
  - `saveStore(shop, token, storeId)`: Saves store information
  - `getStore(shop)`: Retrieves store information
  - `updateStore(shop, updates)`: Updates store information
  - `saveSettings(shop, settings)`: Saves or updates settings
  - `getSettings(shop)`: Retrieves settings
  - `closeConnection()`: Closes the database connection

### 2. Authentication Flow
1. User logs in through Shopify OAuth
2. After successful authentication, the callback route:
   - Fetches shop information from Shopify API to get storeId
   - Saves store information to MongoDB database
   - Sets cookies for shop and token
   - Redirects to the main application

### 3. Database Operations
- **Check Existing Store**: Before saving, the system checks if a store already exists in the database
- **Save New Store**: If the store doesn't exist, it saves the new store information
- **Skip Duplicate**: If the store already exists, it skips saving and continues with the flow

### 4. API Endpoints

#### `/api/store` (GET)
- Checks if a store is already logged in
- Parameters: `shop` (query parameter)
- Returns: Store information and login status

#### `/api/store` (POST)
- Saves store information to database
- Parameters: `shop`, `token`, `storeId` (JSON body)
- Returns: Save operation result

#### `/api/shop` (GET)
- Fetches shop information from Shopify API
- Parameters: `shop`, `token` (query parameters)
- Returns: Shop information including store ID

#### `/api/settings` (GET)
- Retrieves settings for a shop
- Parameters: `shop` (query parameter)
- Returns: Settings data including collections

#### `/api/settings` (POST)
- Saves or updates settings for a shop
- Parameters: `shop`, `topValue`, `xAxis`, `yAxis`, `xAxisCollections`, `yAxisCollections` (JSON body)
- Returns: Save operation result

### 5. State Management Updates
The auth store (`store/authStore.js`) has been updated to include:
- `storeId`: Store ID from Shopify
- `isLoggedIn`: Login status
- `checkStoreStatus(shop)`: Check if store exists in database
- `saveStoreToDB(shop, token, storeId)`: Save store to database
- `getSettings(shop)`: Get settings from database
- `saveSettings(shop, settings)`: Save settings to database

## Usage

### Testing the Integration
1. Navigate to `/test-db` to test database operations
2. Navigate to `/test-settings` to test settings operations
3. Use the test buttons to check store status and save store information
4. View the test results to verify database operations

### Settings Management
1. Navigate to `/settings` to configure layer-based collections
2. Select Product Root, X-Axis, and Y-Axis options
3. View selected collections with full details
4. Save settings to database for later use

### Database Connection
The MongoDB connection string is configured in `lib/mongodb.js`:
```
mongodb+srv://spintura:spintura-app@spintura-app.n4kfrd0.mongodb.net/
```

## Error Handling
- Database connection errors are logged and handled gracefully
- If database operations fail, the authentication flow continues
- Store information is still saved locally even if database save fails

## Security Considerations
- Access tokens are stored in the database (consider encryption for production)
- Database connection uses environment variables for credentials
- Implement proper authentication and authorization for production use

## Future Enhancements
- Add encryption for sensitive data
- Implement token refresh logic
- Add database indexing for better performance
- Add data validation and sanitization
- Implement proper error logging and monitoring 