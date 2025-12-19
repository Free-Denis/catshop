// src/lib/db/blob-utils.js
const BLOB_STORE_URL = 'https://qecbpcpssqmnkyz4.public.blob.vercel-storage.com';
const BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_QecbPCpSsqMNKYZ4_sADguH5zyoI7OWGz7tcWP9AENyMqXZ";
const DATA_FILE = 'data.json';

// Функция для загрузки данных из Blob Storage
export async function loadData() {
  try {
    // Прямой GET запрос к публичному файлу
    const response = await fetch(`${BLOB_STORE_URL}/${DATA_FILE}`);
    
    if (!response.ok) {
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

// Функция для сохранения данных в Blob Storage
export async function saveData(data) {
  try {
    console.log('Пытаемся сохранить данные...');
    
    // ЕДИНСТВЕННЫЙ РАБОЧИЙ МЕТОД для Vercel Blob Storage:
    // Используем прямой PUT запрос с токеном
    const response = await fetch(`${BLOB_STORE_URL}/${DATA_FILE}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data, null, 2)
    });
    
    console.log('Статус ответа:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Полный ответ ошибки:', errorText);
      throw new Error(`Failed to save: ${response.status}`);
    }
    
    console.log('✅ Данные успешно сохранены!');
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
