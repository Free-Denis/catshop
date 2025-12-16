// src/routes/api/order/create/+server.js (исправляем)
import { loadData, saveData, generateId } from '$lib/db/blob-utils.js';

export async function POST({ request }) {
  try {
    const { username } = await request.json();
    
    if (!username) {
      return new Response(
        JSON.stringify({ error: 'Username is required' }),
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

    const user = data.users[userIndex];
    
    // Получаем только котиков со статусом "cart"
    const cartItems = user.cart.filter(item => item.status === 'cart');
    
    if (cartItems.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Cart is empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Создаем заказ
    const orderId = generateId();
    const order = {
      id: orderId,
      items: cartItems.map(item => ({
        catId: item.id,
        name: `Котик ${item.breed}`,
        breed: item.breed,
        price: item.price
      })),
      total: cartItems.reduce((sum, item) => sum + item.price, 0),
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    // Добавляем заказ в историю
    user.orders.push(order);
    
    // Меняем статус котиков на "ordered" (вместо удаления)
    user.cart.forEach(item => {
      if (item.status === 'cart') {
        item.status = 'ordered';
        item.orderedAt = new Date().toISOString();
      }
    });
    
    // Сохраняем данные
    await saveData(data);

    return new Response(
      JSON.stringify({ 
        message: 'Order created successfully',
        order: order
      }),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Create order error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}