// src/lib/db/blob-utils.js
const BLOB_STORE_URL = 'https://qecbpcpssqmnkyz4.public.blob.vercel-storage.com';
const BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_QecbPCpSsqMNKYZ4_sADguH5zyoI7OWGz7tcWP9AENyMqXZ";
const DATA_FILE = 'data.json';

// Функция для загрузки данных из Blob Storage
export async function loadData() {
  try {
    // Прямой GET запрос к публичному файлу
    const response = await fetch(`${BLOB_STORE_URL}/${DATA_FILE}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.log('Файл data.json не найден, возвращаем пустую структуру');
        return { users: [] };
      }
      console.error('Ошибка загрузки:', response.status, response.statusText);
      return { users: [] };
    }

    const data = await response.json();
    console.log('Данные успешно загружены из Blob');
    return data;
  } catch (error) {
    console.error('Error loading data:', error);
    return { users: [] };
  }
}

// Функция для сохранения данных в Blob Storage
export async function saveData(data) {
  try {
    console.log('Сохраняем данные в Blob Storage...');
    
    // Используем специальный эндпоинт Vercel Blob API
    const response = await fetch('https://api.vercel.com/v2/now/blob', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: DATA_FILE,
        data: JSON.stringify(data, null, 2),
        contentType: 'application/json',
        access: 'public'
      })
    });

    console.log('Статус сохранения:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ошибка сохранения:', response.status, errorText);
      
      // Пробуем альтернативный метод
      return await saveDataAlternative(data);
    }

    const result = await response.json();
    console.log('✅ Данные сохранены! URL:', result.url);
    return result;
  } catch (error) {
    console.error('Error saving data:', error);
    
    // Пробуем альтернативный метод при ошибке
    try {
      return await saveDataAlternative(data);
    } catch (fallbackError) {
      throw new Error(`Failed to save: ${error.message}`);
    }
  }
}

// Альтернативный метод сохранения
async function saveDataAlternative(data) {
  console.log('Пробуем альтернативный метод сохранения...');
  
  // Метод через PUT с добавлением query параметров
  const response = await fetch(`${BLOB_STORE_URL}/${DATA_FILE}?access=public`, {
    method: 'POST', // Пробуем POST
    headers: {
      'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`,
      'Content-Type': 'application/json',
      'x-vercel-accepted-methods': 'PUT,POST,PATCH'
    },
    body: JSON.stringify(data, null, 2)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Alternative method failed: ${response.status} - ${errorText}`);
  }

  console.log('✅ Данные сохранены через альтернативный метод');
  return data;
}

// Хэширование пароля
export function hashPassword(password) {
  // Простое хэширование для демо
  return btoa(password);
}

// Генерация ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Быстрая проверка доступности Blob Storage
export async function checkBlobAccess() {
  try {
    const response = await fetch(`${BLOB_STORE_URL}/${DATA_FILE}`, {
      headers: {
        'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`
      }
    });
    
    return {
      canRead: response.ok,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    return {
      canRead: false,
      error: error.message
    };
  }
}
