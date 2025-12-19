// src/routes/api/debug/check-storage/+server.js
import { loadData } from '$lib/db/blob-utils.js';

export async function GET() {
  try {
    const data = await loadData();
    
    return new Response(
      JSON.stringify({
        status: 'success',
        fileExists: true,
        usersCount: data.users?.length || 0,
        users: data.users?.map(u => ({
          username: u.username,
          cartItems: u.cart?.filter(c => c.status === 'cart').length || 0,
          orders: u.orders?.length || 0
        })) || [],
        totalCatsInAllCarts: data.users?.reduce((total, user) => 
          total + (user.cart?.filter(c => c.status === 'cart').length || 0), 0
        ) || 0
      }, null, 2),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        status: 'error',
        error: error.message,
        fileExists: false
      }),
      { status: 500 }
    );
  }
}
