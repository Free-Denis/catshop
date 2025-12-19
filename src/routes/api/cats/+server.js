// src/routes/api/cats/+server.js
import { loadData } from '$lib/db/blob-utils.js';

export async function GET() {
  try {
    const data = await loadData();
    return new Response(
      JSON.stringify({ 
        cats: data.cats || [],
        count: data.cats?.length || 0 
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to load cats' }),
      { status: 500 }
    );
  }
}
