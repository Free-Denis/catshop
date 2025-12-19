// src/lib/db/blob-utils.js
const BLOB_STORE_URL = 'https://qecbpcpssqmnkyz4.public.blob.vercel-storage.com';
const BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_QecbPCpSsqMNKYZ4_sADguH5zyoI7OWGz7tcWP9AENyMqXZ";
const DATA_FILE = 'data.json';

// Инициализация начальных данных - ТОЛЬКО пользователи
const initialData = {
  users: []
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
      console.log('Файл не найден, создаем начальные данные...');
      // СОЗДАЕМ ФАЙЛ АВТОМАТИЧЕСКИ
      await saveData(initialData);
      return initialData;
    }

    if (!response.ok) {
      throw new Error(`Ошибка загрузки: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error loading data:', error);
    // При ошибке возвращаем начальные данные
    return initialData;
  }
}

// Функция для сохранения данных в Blob Storage
export async function saveData(data) {
  try {
    console.log('Сохраняем данные в Blob Storage...');
    const response = await fetch(`${BLOB_STORE_URL}/${DATA_FILE}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${BLOB_READ_WRITE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data, null, 2)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Ошибка сохранения:', response.status, text);
      throw new Error(`Failed to save data: ${response.status}`);
    }

    console.log('Данные успешно сохранены!');
    return await response.json();
  } catch (error) {
    console.error('Error saving data:', error);
    throw error;
  }
}

// Хэширование пароля (простое для демо)
export function hashPassword(password) {
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

// Создать или обновить пользователя
export async function saveUser(userData) {
  const data = await loadData();
  const userIndex = data.users.findIndex(u => u.username === userData.username);
  
  if (userIndex === -1) {
    // Новый пользователь
    data.users.push(userData);
  } else {
    // Обновляем существующего
    data.users[userIndex] = { ...data.users[userIndex], ...userData };
  }
  
  await saveData(data);
  return userData;
}

// Добавить кота в корзину пользователя
export async function addCatToCart(username, catData) {
  const data = await loadData();
  const userIndex = data.users.findIndex(u => u.username === username);
  
  if (userIndex === -1) {
    throw new Error('Пользователь не найден');
  }
  
  const user = data.users[userIndex];
  
  if (!user.cart) {
    user.cart = [];
  }
  
  // Добавляем кота с параметрами для создания
  const catWithParams = {
    id: generateId(),
    ...catData,
    status: 'cart', // cart, ordered, sold
    createdAt: new Date().toISOString()
  };
  
  user.cart.push(catWithParams);
  await saveData(data);
  
  return catWithParams;
}

// Получить корзину пользователя
export async function getUserCart(username) {
  const data = await loadData();
  const user = data.users.find(u => u.username === username);
  
  if (!user || !user.cart) {
    return [];
  }
  
  return user.cart.filter(cat => cat.status === 'cart');
}

// Удалить кота из корзины
export async function removeCatFromCart(username, catId) {
  const data = await loadData();
  const userIndex = data.users.findIndex(u => u.username === username);
  
  if (userIndex === -1) {
    throw new Error('Пользователь не найден');
  }
  
  const user = data.users[userIndex];
  
  if (!user.cart) {
    return false;
  }
  
  const initialLength = user.cart.length;
  user.cart = user.cart.filter(cat => cat.id !== catId);
  
  if (user.cart.length !== initialLength) {
    await saveData(data);
    return true;
  }
  
  return false;
}

// Оформить заказ (поменять статус у котов в корзине)
export async function checkoutOrder(username) {
  const data = await loadData();
  const userIndex = data.users.findIndex(u => u.username === username);
  
  if (userIndex === -1) {
    throw new Error('Пользователь не найден');
  }
  
  const user = data.users[userIndex];
  
  if (!user.cart || user.cart.length === 0) {
    throw new Error('Корзина пуста');
  }
  
  // Меняем статус у всех котов в корзине
  const orderedCats = [];
  user.cart.forEach(cat => {
    if (cat.status === 'cart') {
      cat.status = 'ordered';
      cat.orderedAt = new Date().toISOString();
      orderedCats.push(cat);
    }
  });
  
  await saveData(data);
  
  return orderedCats;
}
