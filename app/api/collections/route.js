import { NextRequest, NextResponse } from 'next/server';

export async function GET(req) {
  return NextResponse.json({ message: 'Collections API is working' });
}

export async function POST(req) {
  try {
    const { shop, token } = await req.json();
    
    if (!shop || !token) {
      return NextResponse.json({ 
        error: 'Missing required parameters: shop and token' 
      }, { status: 400 });
    }

    console.log('Fetching all collections for shop:', shop);

    // Fetch all collections using Admin API
    const query = `
      query getCollections($first: Int!) {
        collections(first: $first) {
          edges {
            node {
              id
              title
              description
              handle
              image {
                url
                altText
              }
              productsCount {
                count
              }
              products(first: 10) {
                edges {
                  node {
                    id
                    title
                    handle
                    featuredImage {
                      url
                      altText
                    }
                    variants(first: 5) {
                      edges {
                        node {
                          id
                          title
                          price
                          image {
                            url
                            altText
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    // Add timeout and better error handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`https://${shop}/admin/api/2024-04/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Access-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          first: 50 // Fetch up to 50 collections
        }
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Admin API error:', response.status, errorText);
      return NextResponse.json({ 
        error: 'Failed to fetch collections from Shopify',
        status: response.status,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    
    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      return NextResponse.json({ 
        error: 'GraphQL errors occurred',
        details: data.errors
      }, { status: 400 });
    }

    const collections = data.data.collections.edges.map(edge => ({
      id: edge.node.id,
      title: edge.node.title,
      description: edge.node.description || '',
      handle: edge.node.handle,
      image: edge.node.image ? {
        url: edge.node.image.url,
        altText: edge.node.image.altText
      } : null,
      productsCount: edge.node.productsCount?.count || 0,
      products: edge.node.products.edges.map(productEdge => ({
        id: productEdge.node.id,
        title: productEdge.node.title,
        handle: productEdge.node.handle,
        featuredImage: productEdge.node.featuredImage ? {
          url: productEdge.node.featuredImage.url,
          altText: productEdge.node.featuredImage.altText
        } : null,
        variants: productEdge.node.variants.edges.map(variantEdge => ({
          id: variantEdge.node.id,
          title: variantEdge.node.title,
          price: variantEdge.node.price,
          image: variantEdge.node.image ? {
            url: variantEdge.node.image.url,
            altText: variantEdge.node.image.altText
          } : null
        }))
      }))
    }));

    console.log(`Fetched ${collections.length} collections successfully`);
    
    return NextResponse.json({
      success: true,
      collections: collections
    });

  } catch (error) {
    console.error('Error fetching collections:', error);
    if (error.name === 'AbortError') {
      return NextResponse.json({ 
        error: 'Request timed out',
        details: 'The request took too long to complete'
      }, { status: 408 });
    } else if (error.code === 'UND_ERR_CONNECT_TIMEOUT') {
      return NextResponse.json({ 
        error: 'Connection timeout',
        details: 'Unable to connect to Shopify API'
      }, { status: 408 });
    } else {
      return NextResponse.json({ 
        error: 'Internal server error',
        details: error.message
      }, { status: 500 });
    }
  }
}

