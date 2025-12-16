import { writable } from 'svelte/store';

export const authStore = writable({
  user: null,
  isAuthenticated: false
});

// Проверяем авторизацию при загрузке
if (typeof window !== 'undefined') {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    authStore.set({
      user: JSON.parse(savedUser),
      isAuthenticated: true
    });
  }
  
  // Сохраняем в localStorage при изменении
  authStore.subscribe((value) => {
    if (value.user) {
      localStorage.setItem('user', JSON.stringify(value.user));
    } else {
      localStorage.removeItem('user');
    }
  });
}