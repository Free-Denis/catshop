// src/lib/db/blob-utils.js
const BLOB_STORE_URL = 'https://qecbpcpssqmnkyz4.public.blob.vercel-storage.com';
const BLOB_READ_WRITE_TOKEN = import.meta.env.VITE_BLOB_READ_WRITE_TOKEN || 'vercel_blob_rw_QecbPCpSsqMNKYZ4_sADguH5zyoI7OWGz7tcWP9AENyMqXZ';
const DATA_FILE = 'data.json';

// Инициализация начальных данных
const initialData = {
  users: [],
  cats: [
    {
      id: '1',
      breed: 'british',
      eyes: 'Золотистые',
      fur: 'Короткая',
      thickness: 4,
      price: 25000,
      available: true
    },
    {
      id: '2',
      breed: 'mainecoon',
      eyes: 'Зеленые',
      fur: 'Длинная',
      thickness: 5,
      price: 35000,
      available: true
    },
    {
      id: '3',
      breed: 'siamese',
      eyes: 'Голубые',
      fur: 'Короткая',
      thickness: 3,
      price: 30000,
      available: true
    }
  ]
};

// Функция для загрузки данных из Blob Storage
export async function loadData() {
  try {
    const response = await fetch(`${BLOB_STORE_URL}/${DATA_FILE}`, {
      headers: {
        'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`
      },
      cache: 'no-store'
    });

    if (response.status === 404) {
      // Файл не существует, создаем начальные данные
      console.log('Создаем начальные данные...');
      await saveData(initialData);
      return initialData;
    }

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error loading data:', error);
    // Возвращаем начальные данные при ошибке
    return initialData;
  }
}

// Функция для сохранения данных в Blob Storage
export async function saveData(data) {
  try {
    const response = await fetch(`${BLOB_STORE_URL}/${DATA_FILE}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data, null, 2)
    });

    if (!response.ok) {
      throw new Error(`Failed to save data: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
}

// Хэширование пароля
export function hashPassword(password) {
  // В реальном приложении используйте bcrypt
  return btoa(password);
}

// Генерация ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Получить пользователя по username
export async function getUserByUsername(username) {
  const data = await loadData();
  return data.users.find(u => u.username === username);
}

// Обновить пользователя
export async function updateUser(username, userData) {
  const data = await loadData();
  const userIndex = data.users.findIndex(u => u.username === username);
  
  if (userIndex === -1) {
    throw new Error('User not found');
  }
  
  data.users[userIndex] = { ...data.users[userIndex], ...userData };
  await saveData(data);
  return data.users[userIndex];
}
