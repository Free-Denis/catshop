// src/lib/db/blob-utils.js
import { put, head, del } from '@vercel/blob';

const BLOB_READ_WRITE_TOKEN = "vercel_blob_rw_QecbPCpSsqMNKYZ4_sADguH5zyoI7OWGz7tcWP9AENyMqXZ";
const BLOB_URL = 'https://qecbpcpssqmnkyz4.public.blob.vercel-storage.com/data.json';

// Функция для загрузки данных из Blob Storage
export async function loadData() {
  try {
    // Прямой fetch к публичному URL
    const response = await fetch(BLOB_URL, {
      cache: 'no-store'
    });

    if (!response.ok) {
      // Если файл не найден (404), возвращаем пустую структуру
      if (response.status === 404) {
        console.log('Файл не найден, возвращаем пустую структуру');
        return { users: [] };
      }
      throw new Error(`Failed to load: ${response.status}`);
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
    console.log('Сохраняем данные через Vercel Blob SDK...');
    
    const jsonString = JSON.stringify(data, null, 2);
    
    // Используем официальный SDK
    const blob = await put('data.json', jsonString, {
      access: 'public',
      token: BLOB_READ_WRITE_TOKEN,
      addRandomSuffix: false,
      contentType: 'application/json'
    });

    console.log('✅ Данные сохранены в Blob:', blob.url);
    return blob;
  } catch (error) {
    console.error('❌ Error saving with Vercel Blob SDK:', error);
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

// Проверка существования файла
export async function checkBlobExists() {
  try {
    await head('data.json', {
      token: BLOB_READ_WRITE_TOKEN
    });
    return true;
  } catch (error) {
    return false;
  }
}
