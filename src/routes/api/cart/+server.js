import { loadData } from '$lib/db/blob-utils.js';

export async function GET({ request, url }) {
  try {
    const username = url.searchParams.get('username');
    
    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Username is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await loadData();
    const user = data.users.find(u => u.username === username);
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Возвращаем только котики со статусом "cart"
    const cartItems = user.cart.filter(item => item.status === 'cart');
    
    return new Response(
      JSON.stringify({ 
        cart: cartItems,
        count: cartItems.length,
        total: cartItems.reduce((sum, item) => sum + item.price, 0)
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Get cart error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}