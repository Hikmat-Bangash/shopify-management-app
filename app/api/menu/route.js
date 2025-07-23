export async function POST(req) {
  const { shop, token } = await req.json();

  const menuQuery = `{
    menu(handle: "main-menu") {
      title
      items {
        title
        type
        url
        resource {
          ... on Collection {
            id
            title
            handle
            products(first: 100) {
              edges {
                node {
                  id
                  title
                }
              }
            }
          }
        }
      }
    }
  }`;

  const response = await fetch(`https://${shop}/admin/api/2024-04/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Access-Token': token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: menuQuery }),
  });

  const data = await response.json();
  return Response.json(data);
}