import { loadData, saveData, hashPassword, generateId } from '$lib/db/blob-utils.js';

export async function POST({ request }) {
  try {
    const { username, password, email } = await request.json();
    
    // Валидация
    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Загружаем данные
    const data = await loadData();
    
    // Проверяем, существует ли пользователь
    const userExists = data.users.find(user => user.username === username);
    if (userExists) {
      return new Response(
        JSON.stringify({ error: 'Username already exists' }),
        { status: 409, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Создаем нового пользователя
    const newUser = {
      id: generateId(),
      username,
      password: hashPassword(password),
      email: email || '',
      createdAt: new Date().toISOString(),
      cart: [],
      orders: []
    };

    // Добавляем пользователя
    data.users.push(newUser);
    
    // Сохраняем данные
    await saveData(data);

    // Возвращаем пользователя (без пароля)
    const { password: _, ...userWithoutPassword } = newUser;
    
    return new Response(
      JSON.stringify({ 
        message: 'Registration successful',
        user: userWithoutPassword 
      }),
      { 
        status: 201, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}