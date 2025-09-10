# Product Interaction Tracking APIs

This document describes the complete API structure for tracking product interactions in the spinning tool.

## Database Structure

### Collection: `product_interactions`

```javascript
{
  _id: ObjectId,
  productId: String,           // Unique product identifier
  productName: String,         // Product name
  productImage: String,        // Product image URL
  shop: String,                // Shop identifier
  interactions: {
    centerViews: {
      count: Number,           // Total times this product appeared in center
      timestamps: [Date]       // Array of timestamps for each center view
    },
    variationViews: {
      count: Number,           // Total times user swiped vertically on this product
      timestamps: [Date]       // Array of timestamps for each variation view
    },
    addToCart: {
      count: Number,           // Total times user clicked add-to-cart for this product
      timestamps: [Date]       // Array of timestamps for each add-to-cart action
    }
  },
  totalInteractions: Number,   // Sum of all interaction counts for this specific product
  lastUpdated: Date,           // Last time this record was updated
  createdAt: Date              // When this record was first created
}
```

## API Endpoints

### 1. Track Product Interactions

**Endpoint**: `POST /api/track-interactions`

**Description**: Track product interactions (center views, variation views, add-to-cart actions)

#### Request Body Examples:

##### Center View Only:
```javascript
{
  "shop": "your-shop.myshopify.com",
  "interactions": [
    {
      "productId": "prod_123",
      "productName": "Omega Seamaster",
      "productImage": "https://example.com/watch.jpg",
      "interactionType": "center_view",
      "count": 1,
      "timestamps": ["2024-01-15T10:30:00Z"]
    }
  ]
}
```

##### Variation Views Only:
```javascript
{
  "shop": "your-shop.myshopify.com",
  "interactions": [
    {
      "productId": "prod_123",
      "productName": "Omega Seamaster",
      "productImage": "https://example.com/watch.jpg",
      "interactionType": "variation_view",
      "count": 3,
      "timestamps": [
        "2024-01-15T10:30:00Z",
        "2024-01-15T10:31:00Z",
        "2024-01-15T10:32:00Z"
      ]
    }
  ]
}
```

##### Add-to-Cart Only:
```javascript
{
  "shop": "your-shop.myshopify.com",
  "interactions": [
    {
      "productId": "prod_123",
      "productName": "Omega Seamaster",
      "productImage": "https://example.com/watch.jpg",
      "interactionType": "add_to_cart",
      "count": 1,
      "timestamps": ["2024-01-15T10:35:00Z"]
    }
  ]
}
```

##### Multiple Interactions (Mixed Types):
```javascript
{
  "shop": "your-shop.myshopify.com",
  "interactions": [
    {
      "productId": "prod_123",
      "productName": "Omega Seamaster",
      "productImage": "https://example.com/watch.jpg",
      "interactionType": "center_view",
      "count": 2,
      "timestamps": ["2024-01-15T10:30:00Z", "2024-01-15T10:31:00Z"]
    },
    {
      "productId": "prod_123",
      "productName": "Omega Seamaster",
      "productImage": "https://example.com/watch.jpg",
      "interactionType": "variation_view",
      "count": 1,
      "timestamps": ["2024-01-15T10:32:00Z"]
    },
    {
      "productId": "prod_456",
      "productName": "Rolex Submariner",
      "productImage": "https://example.com/rolex.jpg",
      "interactionType": "add_to_cart",
      "count": 1,
      "timestamps": ["2024-01-15T10:35:00Z"]
    }
  ]
}
```

#### Response:
```javascript
{
  "success": true,
  "message": "Interactions tracked successfully",
  "data": {
    "processed": 3,
    "updated": 2,
    "created": 1,
    "productCounts": {
      "prod_123": {
        "centerViews": 5,
        "variationViews": 3,
        "addToCart": 2,
        "totalInteractions": 10
      },
      "prod_456": {
        "centerViews": 0,
        "variationViews": 0,
        "addToCart": 1,
        "totalInteractions": 1
      }
    }
  }
}
```

### 2. Get Product Analytics

**Endpoint**: `GET /api/analytics/products`

**Description**: Retrieve product interaction analytics with filtering and sorting options

#### Query Parameters:
- `shop` (required): Shop identifier
- `productId` (optional): Specific product ID to filter
- `sortBy` (optional): Sort by `centerViews`, `variationViews`, `addToCart`, `totalViews`, `lastUpdated` (default: `totalViews`)
- `order` (optional): `asc` or `desc` (default: `desc`)
- `limit` (optional): Number of results (default: 10)
- `offset` (optional): Pagination offset (default: 0)
- `dateFrom` (optional): Start date filter (ISO string)
- `dateTo` (optional): End date filter (ISO string)

#### Example Requests:

##### Get All Products Sorted by Total Views:
```
GET /api/analytics/products?shop=your-shop.myshopify.com&sortBy=totalViews&order=desc&limit=20
```

##### Get Specific Product:
```
GET /api/analytics/products?shop=your-shop.myshopify.com&productId=prod_123
```

##### Get Products with Date Filter:
```
GET /api/analytics/products?shop=your-shop.myshopify.com&dateFrom=2024-01-01T00:00:00Z&dateTo=2024-01-31T23:59:59Z
```

#### Response:
```javascript
{
  "success": true,
  "data": {
    "products": [
      {
        "productId": "prod_123",
        "productName": "Omega Seamaster",
        "productImage": "https://example.com/watch.jpg",
        "viewCounts": {
          "centerViews": 15,
          "variationViews": 8,
          "addToCart": 3,
          "totalViews": 26
        },
        "lastUpdated": "2024-01-15T10:30:00Z",
        "createdAt": "2024-01-10T09:00:00Z"
      }
    ],
    "pagination": {
      "total": 150,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    },
    "summary": {
      "totalProducts": 150,
      "totalCenterViews": 1200,
      "totalVariationViews": 800,
      "totalAddToCart": 200,
      "totalAllViews": 2200
    }
  }
}
```

### 3. Get Individual Product Analytics

**Endpoint**: `GET /api/analytics/product-views/[productId]`

**Description**: Get detailed analytics for a specific product

#### Query Parameters:
- `shop` (required): Shop identifier

#### Example Request:
```
GET /api/analytics/product-views/prod_123?shop=your-shop.myshopify.com
```

#### Response:
```javascript
{
  "success": true,
  "data": {
    "productId": "prod_123",
    "productName": "Omega Seamaster",
    "productImage": "https://example.com/watch.jpg",
    "viewCounts": {
      "centerViews": 15,
      "variationViews": 8,
      "addToCart": 3,
      "totalViews": 26
    },
    "interactionRates": {
      "centerViewRate": 57.69,
      "variationViewRate": 30.77,
      "addToCartRate": 11.54
    },
    "recentActivity": [
      {
        "interactionType": "add_to_cart",
        "timestamp": "2024-01-15T10:35:00Z"
      },
      {
        "interactionType": "variation_view",
        "timestamp": "2024-01-15T10:32:00Z"
      }
    ],
    "lastUpdated": "2024-01-15T10:35:00Z",
    "createdAt": "2024-01-10T09:00:00Z"
  }
}
```

### 4. Get Analytics Summary

**Endpoint**: `GET /api/analytics/summary`

**Description**: Get overall analytics summary with top products and conversion rates

#### Query Parameters:
- `shop` (required): Shop identifier
- `dateFrom` (optional): Start date filter (ISO string)
- `dateTo` (optional): End date filter (ISO string)
- `limit` (optional): Number of top products to return (default: 10)

#### Example Request:
```
GET /api/analytics/summary?shop=your-shop.myshopify.com&limit=5
```

#### Response:
```javascript
{
  "success": true,
  "data": {
    "summary": {
      "totalProducts": 45,
      "totalCenterViews": 800,
      "totalVariationViews": 300,
      "totalAddToCart": 150,
      "totalAllInteractions": 1250
    },
    "conversionRates": {
      "centerToVariation": 37.5,
      "variationToCart": 50.0,
      "centerToCart": 18.75
    },
    "topProducts": {
      "byCenterViews": [
        {
          "productId": "prod_123",
          "productName": "Omega Seamaster",
          "productImage": "https://example.com/watch.jpg",
          "centerViews": 15,
          "totalInteractions": 26
        }
      ],
      "byVariationViews": [...],
      "byAddToCart": [...],
      "byTotalViews": [...]
    },
    "recentActivity": [
      {
        "productId": "prod_123",
        "productName": "Omega Seamaster",
        "interactionType": "add_to_cart",
        "timestamp": "2024-01-15T10:35:00Z"
      }
    ]
  }
}
```

## Usage Examples

### Frontend Integration

#### Track Center View:
```javascript
const trackCenterView = async (product) => {
  const response = await fetch('/api/track-interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shop: 'your-shop.myshopify.com',
      interactions: [{
        productId: product.id,
        productName: product.title,
        productImage: product.image,
        interactionType: 'center_view',
        count: 1,
        timestamps: [new Date().toISOString()]
      }]
    })
  });
  return response.json();
};
```

#### Track Variation Views:
```javascript
const trackVariationViews = async (product, viewCount) => {
  const timestamps = Array(viewCount).fill().map(() => new Date().toISOString());
  
  const response = await fetch('/api/track-interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shop: 'your-shop.myshopify.com',
      interactions: [{
        productId: product.id,
        productName: product.title,
        productImage: product.image,
        interactionType: 'variation_view',
        count: viewCount,
        timestamps: timestamps
      }]
    })
  });
  return response.json();
};
```

#### Track Add-to-Cart:
```javascript
const trackAddToCart = async (product) => {
  const response = await fetch('/api/track-interactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      shop: 'your-shop.myshopify.com',
      interactions: [{
        productId: product.id,
        productName: product.title,
        productImage: product.image,
        interactionType: 'add_to_cart',
        count: 1,
        timestamps: [new Date().toISOString()]
      }]
    })
  });
  return response.json();
};
```

#### Get Analytics:
```javascript
const getAnalytics = async (shop, options = {}) => {
  const params = new URLSearchParams({ shop, ...options });
  const response = await fetch(`/api/analytics/products?${params}`);
  return response.json();
};
```

## Error Handling

All APIs return consistent error responses:

```javascript
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details"
}
```

Common HTTP status codes:
- `400`: Bad Request (missing required parameters)
- `404`: Not Found (product not found)
- `500`: Internal Server Error

## Database Indexes

For optimal performance, create these indexes:

```javascript
// Compound index for efficient queries
db.product_interactions.createIndex({ 
  "shop": 1, 
  "productId": 1 
});

// Index for analytics queries
db.product_interactions.createIndex({ 
  "shop": 1,
  "lastUpdated": -1 
});

// Index for interaction type filtering
db.product_interactions.createIndex({ 
  "shop": 1,
  "interactions.centerViews.count": -1,
  "interactions.variationViews.count": -1,
  "interactions.addToCart.count": -1
});
```
