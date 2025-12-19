// src/lib/db/blob-utils.js
const BLOB_STORE_URL = 'https://qecbpcpssqmnkyz4.public.blob.vercel-storage.com';
const BLOB_TOKEN = "vercel_blob_rw_QecbPCpSsqMNKYZ4_sADguH5zyoI7OWGz7tcWP9AENyMqXZ";
const DATA_FILE = 'data.json';

// Определяем базовый URL для API
const getBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (typeof process !== 'undefined' && process.env.VERCEL_ENV === 'development') {
    return 'http://localhost:3000';
  }
  return 'https://catshop-six.vercel.app';
};

// Функция для загрузки данных из Blob Storage
export async function loadData() {
  try {
    const response = await fetch(`${BLOB_STORE_URL}/${DATA_FILE}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('Файл не найден, создаем пустую структуру');
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

// Функция для сохранения данных в Blob Storage
export async function saveData(data) {
  try {
    console.log('Сохраняем данные через прямой Blob API...');
    
    // ПРЯМОЙ ВЫЗОВ Vercel Blob API - единственный рабочий способ
    const response = await fetch('https://api.vercel.com/v2/now/blob', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BLOB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: DATA_FILE,
        data: JSON.stringify(data, null, 2),
        contentType: 'application/json',
        access: 'public'
      })
    });

    console.log('Статус ответа:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка сохранения:', errorText);
      
      // Фоллбэк: просто возвращаем данные
      console.warn('⚠️  Используем фоллбэк - данные не сохранены в Blob');
      return data;
    }

    const result = await response.json();
    console.log('✅ Данные сохранены! URL:', result.url);
    return result;
    
  } catch (error) {
    console.error('Error saving data:', error);
    // При ошибке возвращаем данные, но не падаем
    return data;
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
