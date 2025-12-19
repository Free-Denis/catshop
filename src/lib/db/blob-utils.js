// src/lib/db/blob-utils.js
import { put } from '@vercel/blob';

const BLOB_TOKEN = "vercel_blob_rw_QecbPCpSsqMNKYZ4_sADguH5zyoI7OWGz7tcWP9AENyMqXZ";
const DATA_FILE = 'data.json';

export async function loadData() {
  try {
    const response = await fetch(`https://qecbpcpssqmnkyz4.public.blob.vercel-storage.com/${DATA_FILE}`, { cache: 'no-store' });
    if (!response.ok) return { users: [] };
    return await response.json();
  } catch (error) {
    console.error('Ошибка загрузки:', error);
    return { users: [] };
  }
}

export async function saveData(data) {
  try {
    console.log('Сохраняем через Vercel Blob SDK...');
    // Используем официальный метод 'put'
    const blob = await put(DATA_FILE, JSON.stringify(data, null, 2), {
      access: 'public',
      token: BLOB_TOKEN,
      addRandomSuffix: false,
      contentType: 'application/json'
    });
    console.log('✅ Данные сохранены в Blob:', blob.url);
    return data;
  } catch (error) {
    console.error('❌ Ошибка сохранения через SDK:', error);
    // Можете добавить временное сохранение в памяти здесь, если нужно
    throw error; // Позволяет API-роуту отловить ошибку
  }
}

// Остальные функции (hashPassword, generateId) остаются без изменений
