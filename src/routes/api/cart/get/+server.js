// src/routes/api/cart/get/+server.js
import { loadData } from '$lib/db/blob-utils.js';

export async function GET({ url }) {
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

    // Только котики со статусом 'cart'
    const cartItems = user.cart.filter(item => item.status === 'cart');
    const total = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
    
    return new Response(
      JSON.stringify({ 
        cart: cartItems,
        total: total,
        count: cartItems.length
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