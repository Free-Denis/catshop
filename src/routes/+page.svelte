<!-- src/routes/+page.svelte -->
<script>
  import { onMount } from 'svelte';
  import CatBuilder from '$lib/components/CatBuilder.svelte';
  
  // Состояния для авторизации
  let showLoginModal = false;
  let username = '';
  let password = '';
  let isRegistering = false;
  let loginError = '';
  let isAuthenticated = false;
  let currentUser = null;
  
  // Корзина
  let cartItems = [];
  let cartCount = 0;
  
  // Форма заявки
  let formData = { name: '', phone: '', email: '' };
  let formSubmitted = false;
  
  // Загрузить корзину пользователя из базы
  async function loadUserCart() {
    if (!currentUser) {
      cartItems = [];
      cartCount = 0;
      return;
    }
    
    try {
      const response = await fetch(`/api/cart/get?username=${encodeURIComponent(currentUser.username)}`);
      if (response.ok) {
        const data = await response.json();
        cartItems = data.cart || [];
        cartCount = data.count || 0;
        console.log('Корзина загружена из базы:', cartItems.length, 'котиков');
      }
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      cartItems = [];
      cartCount = 0;
    }
  }
  
  // Проверить создан ли файл в хранилище
  async function checkStorage() {
    try {
      const response = await fetch('/api/debug/check-storage');
      const data = await response.json();
      console.log('Статус хранилища:', data);
      
      if (data.fileExists) {
        console.log('Файл найден:', data.usersCount, 'пользователей');
      } else {
        console.log('Файл будет создан при первой записи');
      }
    } catch (error) {
      console.error('Ошибка проверки хранилища:', error);
    }
  }
  
  // Авторизация
  async function handleAuth() {
    loginError = '';
    
    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';
    
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        currentUser = data.user;
        isAuthenticated = true;
        showLoginModal = false;
        username = '';
        password = '';
        
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Загружаем корзину пользователя
        await loadUserCart();
        
      } else {
        loginError = data.error || 'Ошибка авторизации';
      }
    } catch (error) {
      loginError = 'Ошибка сети';
    }
  }
  
  function logout() {
    isAuthenticated = false;
    currentUser = null;
    cartItems = [];
    cartCount = 0;
    localStorage.removeItem('user');
  }
  
  // Добавление в корзину - СОХРАНЯЕТ В БАЗУ
  async function handleAddToCart(event) {
    const catConfig = event.detail;
    
    if (!isAuthenticated) {
      alert('Для добавления в корзину необходимо войти в систему');
      showLoginModal = true;
      return;
    }
    
    try {
      // Сохраняем котика в базу
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          cat: {
            ...catConfig,
            status: 'cart'
          }
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Обновляем локальное состояние
        cartItems.push(catConfig);
        cartCount = cartItems.length;
        alert('✅ Котик добавлен в корзину! Данные сохранены в базе.');
      } else {
        alert('❌ Ошибка: ' + result.error);
      }
    } catch (error) {
      console.error('Ошибка при сохранении котика:', error);
      alert('❌ Не удалось сохранить котика. Попробуйте снова.');
    }
  }
  
  // Отправка формы заявки (локально, без сохранения в базу)
  function submitForm(e) {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      alert('Заполните обязательные поля');
      return;
    }
    
    formSubmitted = true;
    console.log('Заявка отправлена:', formData);
    
    // Сбрасываем форму
    formData = { name: '', phone: '', email: '' };
    
    setTimeout(() => {
      formSubmitted = false;
    }, 3000);
  }
  
  // Инициализация
  onMount(async () => {
    // Проверяем хранилище
    await checkStorage();
    
    // Проверяем авторизацию
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      isAuthenticated = true;
      // Загружаем корзину пользователя
      await loadUserCart();
    }
  });
</script>

<!-- ШАПКА -->
<header class="header">
  <div class="header-container">
    <h1 class="logo">🐾 Кото-Мир</h1>
    
    <div class="header-actions">
      {#if isAuthenticated}
        <span class="username">{currentUser?.username}</span>
        <button class="btn btn-logout" on:click={logout}>Выйти</button>
      {:else}
        <button class="btn btn-login" on:click={() => showLoginModal = true}>
          Войти
        </button>
      {/if}
      
      <a href="/cart" class="cart-btn">
        🛒 Корзина
        {#if cartCount > 0}
          <span class="cart-count">{cartCount}</span>
        {/if}
      </a>
    </div>
  </div>
</header>

<!-- МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ -->
{#if showLoginModal}
<div class="modal-overlay" on:click={() => showLoginModal = false}>
  <div class="modal" on:click|stopPropagation>
    <h2>{isRegistering ? 'Регистрация' : 'Вход'}</h2>
    
    <form on:submit|preventDefault={handleAuth}>
      <input type="text" bind:value={username} placeholder="Имя пользователя" required />
      <input type="password" bind:value={password} placeholder="Пароль" required />
      
      {#if loginError}
        <p class="error-message">{loginError}</p>
      {/if}
      
      <button type="submit" class="btn btn-primary">
        {isRegistering ? 'Зарегистрироваться' : 'Войти'}
      </button>
    </form>
    
    <button class="btn btn-link" on:click={() => isRegistering = !isRegistering}>
      {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
    </button>
    
    <button class="btn btn-close" on:click={() => showLoginModal = false}>✕</button>
  </div>
</div>
{/if}

<!-- ОСНОВНОЕ СОДЕРЖИМОЕ -->
<main class="main-content">
  
  <!-- ИНФОРМАЦИЯ О ПРЕДПРИЯТИИ -->
  <section class="about-section">
    <h2>🐱 О нашем питомнике</h2>
    <div class="about-content">
      <p>Добро пожаловать в питомник "Кото-Мир" — место, где рождается счастье!</p>
      <p>Создайте своего идеального котика в конструкторе и добавьте в корзину.</p>
      <p>Все данные хранятся в облачной базе Vercel Blob Storage.</p>
    </div>
  </section>
  
  <!-- КОНСТРУКТОР КОТИКА -->
  <section class="builder-section">
    <h2>🎨 Собери своего котика</h2>
    <CatBuilder {cartItems} {cartCount} on:addToCart={handleAddToCart} />
  </section>
  
  <!-- ФОРМА ЗАЯВКИ -->
  <section class="form-section">
    <h2>📞 Оставить заявку на консультацию</h2>
    
    {#if formSubmitted}
      <div class="success-message">
        <h3>✅ Спасибо за заявку!</h3>
        <p>Мы свяжемся с вами в ближайшее время.</p>
      </div>
    {:else}
      <form class="consultation-form" on:submit={submitForm}>
        <input type="text" bind:value={formData.name} placeholder="Ваше имя *" required />
        <input type="tel" bind:value={formData.phone} placeholder="Телефон *" required />
        <input type="email" bind:value={formData.email} placeholder="Email" />
        <button type="submit" class="btn btn-submit">Отправить заявку</button>
      </form>
    {/if}
  </section>
  
  <!-- ИНФО О БАЗЕ -->
  <section class="db-info">
    <h3>ℹ️ Информация о хранилище</h3>
    <p><strong>URL базы:</strong> https://qecbpcpssqmnkyz4.public.blob.vercel-storage.com/data.json</p>
    <p><strong>Хранится:</strong> Пользователи и их коты (с параметрами для создания и статусом)</p>
    <p><strong>Статусы котов:</strong> cart (в корзине), ordered (заказан), sold (продан)</p>
    <button class="btn btn-small" on:click={checkStorage}>Проверить хранилище</button>
  </section>
</main>

<style>
  :global(body) {
    margin: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #f8f9fa;
    min-height: 100vh;
  }
  
  .header {
    background: #667eea;
    color: white;
    padding: 1rem 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
  
  .header-container {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .logo {
    margin: 0;
    font-size: 1.5rem;
  }
  
  .header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: white;
    color: #667eea;
    font-weight: 500;
  }
  
  .btn-login:hover, .btn-logout:hover {
    background: #f0f0f0;
  }
  
  .cart-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    background: #ff6b6b;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    text-decoration: none;
  }
  
  .cart-count {
    background: white;
    color: #ff6b6b;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
  }
  
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    position: relative;
  }
  
  .modal input {
    width: 100%;
    padding: 0.5rem;
    margin: 0.5rem 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
  }
  
  .error-message {
    color: red;
    font-size: 0.9rem;
  }
  
  .btn-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    color: #999;
  }
  
  .main-content {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
  }
  
  section {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  }
  
  .consultation-form input {
    width: 100%;
    padding: 0.5rem;
    margin: 0.5rem 0;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
  }
  
  .btn-submit {
    background: #48bb78;
    color: white;
    width: 100%;
    margin-top: 1rem;
  }
  
  .success-message {
    text-align: center;
    padding: 2rem;
    background: #c6f6d5;
    border-radius: 8px;
    color: #22543d;
  }
  
  .db-info {
    background: #e9ecef;
    font-size: 0.9rem;
  }
  
  .btn-small {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
    margin-top: 0.5rem;
  }
</style>
