import { loadData, saveData } from '$lib/db/blob-utils.js';

export async function DELETE({ request }) {
  try {
    const { username, catId } = await request.json();
    
    if (!username || !catId) {
      return new Response(
        JSON.stringify({ error: 'Username and catId are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await loadData();
    const userIndex = data.users.findIndex(u => u.username === username);
    
    if (userIndex === -1) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Находим индекс котика в корзине
    const cartIndex = data.users[userIndex].cart.findIndex(
      item => item.id === catId && item.status === 'cart'
    );
    
    if (cartIndex === -1) {
      return new Response(
        JSON.stringify({ error: 'Cat not found in cart' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Удаляем котика из корзины
    data.users[userIndex].cart.splice(cartIndex, 1);
    
    // Сохраняем данные
    await saveData(data);

    return new Response(
      JSON.stringify({ 
        message: 'Cat removed from cart successfully'
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Remove from cart error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}