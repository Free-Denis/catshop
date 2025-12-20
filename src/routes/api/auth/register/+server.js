// src/routes/api/auth/register/+server.js
import { loadData, saveData, hashPassword, generateId } from '$lib/db/blob-utils.js';
export async function POST({ request }) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Parse error:', parseError);
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400 }
      );
    }

    const { username, password } = body;

    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username and password are required' }),
        { status: 400 }
      );
    }
    // Загружаем текущие данные
    let data = await loadData();

    // Проверяем, существует ли пользователь
    if (data.users && data.users.find(user => user.username === username)) {
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
      cart: [],
      orders: []
    };
    // Добавляем пользователя
    if (!data.users) data.users = [];
    data.users.push(newUser);

    // Сохраняем обновленные данные (saveData не выбрасывает ошибку)
    await saveData(data);
    // Возвращаем пользователя (без пароля)
    const { password: _, ...userWithoutPassword } = newUser;

    return new Response(
      JSON.stringify({
        success: true,
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
      JSON.stringify({
        success: false,
        error: 'Registration failed',
        details: error.message
      }),
      { status: 500 }
    );
  }
}
