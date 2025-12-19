// src/routes/api/auth/register/+server.js
import { loadData, saveData, hashPassword, generateId } from '$lib/db/blob-utils.js';

export async function POST({ request }) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username and password are required' }),
        { status: 400 }
      );
    }

    const data = await loadData();
    
    // Проверяем, существует ли пользователь
    if (data.users.find(user => user.username === username)) {
      return new Response(
        JSON.stringify({ error: 'Username already exists' }),
        { status: 409 }
      );
    }

    // Создаем нового пользователя
    const newUser = {
      id: generateId(),
      username,
      password: hashPassword(password),
      createdAt: new Date().toISOString(),
      cart: []
    };

    data.users.push(newUser);
    await saveData(data);

    // Возвращаем без пароля
    const { password: _, ...userWithoutPassword } = newUser;
    
    return new Response(
      JSON.stringify({ 
        message: 'Registration successful',
        user: userWithoutPassword 
      }),
      { status: 201 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
