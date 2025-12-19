// src/lib/db/blob-utils.js
const BLOB_STORE_URL = 'https://qecbpcpssqmnkyz4.public.blob.vercel-storage.com';
const BLOB_TOKEN = "vercel_blob_rw_QecbPCpSsqMNKYZ4_sADguH5zyoI7OWGz7tcWP9AENyMqXZ";
const DATA_FILE = 'data.json';

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

// Функция для сохранения данных в Blob Storage через специальный API
export async function saveData(data) {
  try {
    console.log('Сохраняем данные через Blob API...');
    
    // ЕДИНСТВЕННЫЙ РАБОЧИЙ МЕТОД для Vercel Blob
    const response = await fetch('/api/blob/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: DATA_FILE,
        data: JSON.stringify(data, null, 2)
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to save: ${response.status} - ${errorData.error || 'Unknown error'}`);
    }

    console.log('✅ Данные сохранены!');
    return await response.json();
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
