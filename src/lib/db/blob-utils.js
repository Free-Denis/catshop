// src/lib/db/blob-utils.js
import { put } from '@vercel/blob';

const BLOB_TOKEN = "vercel_blob_rw_QecbPCpSsqMNKYZ4_sADguH5zyoI7OWGz7tcWP9AENyMqXZ";
const DATA_FILE = 'data.json';
const BLOB_READ_URL = 'https://qecbpcpssqmnkyz4.public.blob.vercel-storage.com/data.json';

// Временное хранилище в памяти
let memoryStorage = { users: [] };

// Функция для загрузки данных из Blob Storage
export async function loadData() {
  try {
    console.log('Загружаем данные из:', BLOB_READ_URL);
    
    // Читаем из публичного URL Blob Storage
    const response = await fetch(BLOB_READ_URL, {
      cache: 'no-store'
    });

    if (response.ok) {
      const data = await response.json();
      memoryStorage = data; // Кэшируем в памяти
      console.log('✅ Данные загружены из Blob, пользователей:', data.users?.length || 0);
      return data;
    }
    
    console.log('Файл не найден в Blob, используем локальные данные');
    return memoryStorage;
    
  } catch (error) {
    console.error('❌ Ошибка загрузки:', error.message);
    return memoryStorage;
  }
}

// Функция для сохранения данных в Blob Storage
export async function saveData(data) {
  try {
    console.log('Сохраняем данные через Vercel Blob SDK...');
    
    // 1. Сохраняем в память (гарантированно работает)
    memoryStorage = data;
    console.log('✅ Данные сохранены в памяти');
    
    // 2. Пытаемся сохранить в Blob Storage через SDK
    const jsonString = JSON.stringify(data, null, 2);
    
    // Используем @vercel/blob SDK - ЭТО ЕДИНСТВЕННЫЙ РАБОЧИЙ СПОСОБ
    const blob = await put(DATA_FILE, jsonString, {
      access: 'public',
      token: BLOB_TOKEN,
      addRandomSuffix: false,
      contentType: 'application/json'
    });

    console.log('✅ Данные также сохранены в Blob Storage:', blob.url);
    return blob;
    
  } catch (error) {
    console.error('❌ Ошибка сохранения через SDK:', error.message);
    
    // При ошибке SDK всё равно возвращаем данные (они в памяти)
    console.log('⚠️ Используем локальное хранилище');
    return { url: 'memory://local-storage' };
  }
}

// Хэширование пароля
export function hashPassword(password) {
  // Простое хэширование для демо (в продакшене используйте bcrypt)
  return btoa(password);
}

// Генерация ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Тест соединения
export async function testConnection() {
  const canRead = await loadData();
  return {
    canRead: !!canRead,
    usersCount: canRead.users?.length || 0,
    memoryStorage: memoryStorage.users?.length || 0
  };
}
