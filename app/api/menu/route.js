export async function POST(req) {
  const { shop } = await req.json();

  try {
    const response = await fetch(`https://${shop}/pages/menu`);
    if (!response.ok) {
      throw new Error('Failed to fetch menu');
    }
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.error('Error fetching menu:', error);
    return Response.json({ error: 'Failed to fetch menu data' }, { status: 500 });
  }
}