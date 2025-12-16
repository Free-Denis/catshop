import { loadData, saveData, generateId } from '$lib/db/blob-utils.js';

export async function POST({ request }) {
  try {
    const { username, cat } = await request.json();
    
    if (!username || !cat || !cat.breed) {
      return new Response(
        JSON.stringify({ error: 'Username and cat details are required' }),
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

    // Создаем объект котика для корзины
    const cartCat = {
      id: generateId(),
      name: cat.name || `Котик ${cat.breed}`,
      breed: cat.breed,
      eyes: cat.eyes || 'Разные',
      fur: cat.fur || 'Обычная',
      thickness: cat.thickness || 3,
      price: cat.price || 20000,
      status: 'cart',
      createdAt: new Date().toISOString()
    };

    // Добавляем в корзину пользователя
    data.users[userIndex].cart.push(cartCat);
    
    // Сохраняем данные
    await saveData(data);

    return new Response(
      JSON.stringify({ 
        message: 'Cat added to cart successfully',
        cat: cartCat 
      }),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Add to cart error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}