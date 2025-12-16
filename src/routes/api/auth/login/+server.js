import { loadData, hashPassword } from '$lib/db/blob-utils.js';

export async function POST({ request }) {
  try {
    const { username, password } = await request.json();
    
    if (!username || !password) {
      return new Response(
        JSON.stringify({ error: 'Username and password are required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Загружаем данные
    const data = await loadData();
    
    // Ищем пользователя
    const user = data.users.find(u => u.username === username);
    
    // Проверяем пароль
    if (!user || user.password !== hashPassword(password)) {
      return new Response(
        JSON.stringify({ error: 'Invalid credentials' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Возвращаем пользователя (без пароля)
    const { password: _, ...userWithoutPassword } = user;
    
    return new Response(
      JSON.stringify({ 
        message: 'Login successful',
        user: userWithoutPassword 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Login error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}