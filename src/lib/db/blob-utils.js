// src/lib/db/blob-utils.js
const BLOB_STORE_URL = 'https://qecbpcpssqmnkyz4.public.blob.vercel-storage.com';
const BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_QecbPCpSsqMNKYZ4_sADguH5zyoI7OWGz7tcWP9AENyMqXZ";
const DATA_FILE = 'data.json';

// Функция для загрузки данных из Blob Storage
export async function loadData() {
  try {
    const response = await fetch(`${BLOB_STORE_URL}/${DATA_FILE}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      // Если файл не найден (404), возвращаем пустую структуру
      if (response.status === 404) {
        console.log('Файл не найден, возвращаем пустую структуру');
        return { users: [] };
      }
      console.error('Ошибка загрузки:', response.status);
      return { users: [] };
    }

    return await response.json();
  } catch (error) {
    console.error('Error loading data:', error);
    return { users: [] };
  }
}

// Функция для сохранения данных в Blob Storage через Vercel API
export async function saveData(data) {
  try {
    console.log('Сохраняем данные...');
    
    // Используем Vercel Blob REST API
    const response = await fetch(`https://vercel-blob-proxy.vercel.app/api/blob/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: DATA_FILE,
        data: JSON.stringify(data, null, 2),
        token: BLOB_READ_WRITE_TOKEN,
        access: 'public'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка сохранения:', response.status, errorText);
      throw new Error(`Failed to save: ${response.status}`);
    }

    console.log('✅ Данные сохранены!');
    return data;
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
}

// Хэширование пароля
export function hashPassword(password) {
  return btoa(password);
}

// Генерация ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Простая альтернатива: сохраняем через специальный API
export async function saveDataSimple(data) {
  // Этот метод будет использовать ваш собственный API
  const response = await fetch('/api/save-to-blob', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data })
  });
  
  if (!response.ok) {
    throw new Error('Failed to save');
  }
  
  return data;
}
