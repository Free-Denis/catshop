// src/lib/db/blob-utils.js
import { put } from '@vercel/blob';
const DATA_FILE = 'data.json';
const BLOB_STORE_URL = 'https://qecbpcpssqmnkyz4.public.blob.vercel-storage.com';
// Временное хранилище в памяти для разработки
let memoryStorage = { users: [] };
// Функция для загрузки данных из Blob Storage
export async function loadData() {
  try {
    // Чтение из публичного Blob URL
    const response = await fetch(`${BLOB_STORE_URL}/${DATA_FILE}`, {
      cache: 'no-store'
    });
    if (response.ok) {
      const data = await response.json();
      // Сохраняем в памяти для кэша
      memoryStorage = data;
      console.log('✅ Данные загружены из Blob Storage');
      return data;
    }
   
    // Если файл не найден, возвращаем пустые данные
    console.log('Файл не найден в Blob, используем локальные данные');
    return memoryStorage;
   
  } catch (error) {
    console.error('Error loading data:', error.message);
    return memoryStorage;
  }
}
// Функция для сохранения данных в Blob Storage
export async function saveData(data) {
  try {
    console.log('Сохраняем данные через Vercel Blob SDK...');
   
    // 1. Сначала сохраняем в память (гарантированно работает)
    memoryStorage = data;
   
    // 2. Сохраняем в Blob Storage через SDK
    const jsonString = JSON.stringify(data, null, 2);
   
    const blob = await put(DATA_FILE, jsonString, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
      contentType: 'application/json'
    });
    console.log('✅ Данные сохранены в Blob Storage:', blob.url);
    return data;
   
  } catch (error) {
    console.error('❌ Ошибка сохранения через SDK:', error.message);
   
    // При ошибке всё равно возвращаем данные (они сохранены в памяти)
    console.log('⚠️ Используем локальное хранилище до исправления Blob');
    return data;
  }
}
// Хэширование пароля (простое для демо)
export function hashPassword(password) {
  return btoa(password); // В продакшене используйте bcrypt
}
// Генерация ID
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
// Проверка работы Blob Storage
export async function testBlobConnection() {
  try {
    // Пробуем загрузить данные
    const response = await fetch(`${BLOB_STORE_URL}/${DATA_FILE}`);
   
    return {
      canRead: response.ok,
      readStatus: response.status,
      publicUrl: `${BLOB_STORE_URL}/${DATA_FILE}`,
      sdkAvailable: true
    };
  } catch (error) {
    return {
      canRead: false,
      error: error.message,
      sdkAvailable: true
    };
  }
}
