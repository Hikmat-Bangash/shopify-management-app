# Seller Management App

A Next.js application for managing Shopify seller settings with MongoDB integration.

## Features

- Shopify OAuth authentication
- Settings management with layer-based collections
- MongoDB database integration
- Public API endpoints for external access

## Public API Documentation

### Base URL
```
https://your-vercel-app.vercel.app/api/public
```

### Authentication (Optional)
Set the `X-API-Key` header for API key authentication:
```javascript
headers: {
  'Content-Type': 'application/json',
  'X-API-Key': 'your-api-key'
}
```

### Settings API

#### Get Settings
```http
GET /api/public/settings?shop={shop}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shop": "your-shop.myshopify.com",
    "topValue": "product",
    "xAxis": "layer1",
    "yAxis": "layer2",
    "xAxisCollections": [...],
    "yAxisCollections": [...],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Settings retrieved successfully"
}
```

#### Save Settings
```http
POST /api/public/settings
```

**Request Body:**
```json
{
  "shop": "your-shop.myshopify.com",
  "topValue": "product",
  "xAxis": "layer1",
  "yAxis": "layer2",
  "xAxisCollections": [...],
  "yAxisCollections": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shop": "your-shop.myshopify.com",
    "message": "Settings saved successfully",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Settings saved successfully"
}
```

### Store API

#### Get Store
```http
GET /api/public/store?shop={shop}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shop": "your-shop.myshopify.com",
    "storeId": "123456789",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Store found"
}
```

#### Save Store
```http
POST /api/public/store
```

**Request Body:**
```json
{
  "shop": "your-shop.myshopify.com",
  "token": "shopify-access-token",
  "storeId": "123456789"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shop": "your-shop.myshopify.com",
    "message": "Store saved successfully",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Store saved successfully"
}
```

### Product Status API

#### Get Product Statuses
```http
GET /api/public/product-status?shop={shop}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shop": "your-shop.myshopify.com",
    "statuses": [
      {
        "shop": "your-shop.myshopify.com",
        "productId": "123456789",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "count": 1
  },
  "message": "Product statuses retrieved successfully"
}
```

#### Save Product Status
```http
POST /api/public/product-status
```

**Request Body:**
```json
{
  "shop": "your-shop.myshopify.com",
  "productId": "123456789",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "shop": "your-shop.myshopify.com",
    "productId": "123456789",
    "isActive": true,
    "message": "Product status saved successfully",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Product status saved successfully"
}
```

### Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error type",
  "message": "Human readable message",
  "details": ["Validation errors"] // Optional
}
```

### Usage Examples

#### JavaScript/Node.js
```javascript
// Get settings
const response = await fetch('https://your-vercel-app.vercel.app/api/public/settings?shop=your-shop.myshopify.com', {
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key' // Optional
  }
});

const data = await response.json();
console.log(data);

// Save settings
const saveResponse = await fetch('https://your-vercel-app.vercel.app/api/public/settings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Key': 'your-api-key' // Optional
  },
  body: JSON.stringify({
    shop: 'your-shop.myshopify.com',
    topValue: 'product',
    xAxis: 'layer1',
    yAxis: 'layer2',
    xAxisCollections: [...],
    yAxisCollections: [...]
  })
});

const saveData = await saveResponse.json();
console.log(saveData);
```

#### cURL
```bash
# Get settings
curl -X GET "https://your-vercel-app.vercel.app/api/public/settings?shop=your-shop.myshopify.com" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key"

# Save settings
curl -X POST "https://your-vercel-app.vercel.app/api/public/settings" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "shop": "your-shop.myshopify.com",
    "topValue": "product",
    "xAxis": "layer1",
    "yAxis": "layer2"
  }'

# Get product statuses
curl -X GET "https://your-vercel-app.vercel.app/api/public/product-status?shop=your-shop.myshopify.com" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key"

# Save product status
curl -X POST "https://your-vercel-app.vercel.app/api/public/product-status" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "shop": "your-shop.myshopify.com",
    "productId": "123456789",
    "isActive": true
  }'
```

## Environment Variables

Set these in your Vercel dashboard:

- `PUBLIC_API_KEY` (optional) - API key for authentication
- MongoDB connection string

## CORS Configuration

The API endpoints are configured to allow cross-origin requests from any domain. CORS headers are automatically set for all `/api/public/*` routes.

## Development

```bash
npm install
npm run dev
```

## Deployment

The app is configured for deployment on Vercel with automatic CORS handling and environment variable support.
