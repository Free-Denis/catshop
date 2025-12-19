// src/routes/api/debug/check-storage/+server.js
import { loadData } from '$lib/db/blob-utils.js';

export async function GET() {
  try {
    const data = await loadData();
    return new Response(
      JSON.stringify({
        fileExists: true,
        usersCount: data.users.length,
        message: 'Хранилище работает',
        dataStructure: {
          users: 'Массив пользователей',
          userStructure: {
            username: 'string',
            password: 'string (хеш)',
            cart: 'Массив котов',
            catStructure: {
              id: 'string',
              breed: 'british|siamese|mainecoon',
              furColor: 'string (#hex)',
              eyeColor: 'string (#hex)',
              fat: 'number (0.1-0.9)',
              status: 'cart|ordered|sold',
              createdAt: 'ISO string'
            }
          }
        }
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        fileExists: false,
        message: 'Файл будет создан автоматически при первой записи',
        error: error.message
      }),
      { status: 200 }
    );
  }
}
