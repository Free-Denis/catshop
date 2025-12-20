<script>
  import { onMount } from 'svelte';
  import CatBuilder from '$lib/components/CatBuilder.svelte';

  // Состояния авторизации
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

  // Уведомления на сайте
  let toastMessage = '';
  let toastType = ''; // 'success' или 'error'

  function showToast(message, type = 'success', duration = 3000) {
    toastMessage = message;
    toastType = type;
    setTimeout(() => {
      toastMessage = '';
      toastType = '';
    }, duration);
  }

  // ==================== ЛОКАЛЬНЫЕ ФУНКЦИИ ХРАНЕНИЯ ====================

  function getAllUsers() {
    const data = localStorage.getItem('catshop_users');
    return data ? JSON.parse(data) : {};
  }

  function saveAllUsers(users) {
    localStorage.setItem('catshop_users', JSON.stringify(users));
  }

  function getUserCart(username) {
    const cartData = localStorage.getItem(`cart_${username}`);
    return cartData ? JSON.parse(cartData) : [];
  }

  function saveUserCart(username, cart) {
    localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
  }

  function loadUserCart() {
    if (!currentUser) {
      cartItems = [];
      cartCount = 0;
      return;
    }
    cartItems = getUserCart(currentUser.username);
    cartCount = cartItems.length;
  }

  // ==================== АВТОРИЗАЦИЯ ====================

  async function handleAuth(e) {
    e.preventDefault();
    loginError = '';

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    if (!trimmedUsername || !trimmedPassword) {
      loginError = 'Заполните все поля';
      return;
    }
    if (trimmedUsername.length < 3) {
      loginError = 'Имя пользователя минимум 3 символа';
      return;
    }
    if (trimmedPassword.length < 6) {
      loginError = 'Пароль минимум 6 символов';
      return;
    }

    const users = getAllUsers();

    if (isRegistering) {
      if (users[trimmedUsername]) {
        loginError = 'Пользователь с таким именем уже существует';
        return;
      }
      users[trimmedUsername] = { password: trimmedPassword };
      saveAllUsers(users);
      saveUserCart(trimmedUsername, []);

      currentUser = { username: trimmedUsername };
      isAuthenticated = true;
      localStorage.setItem('current_user', JSON.stringify(currentUser));

      showToast('Регистрация успешна! Добро пожаловать!', 'success');
    } else {
      if (!users[trimmedUsername] || users[trimmedUsername].password !== trimmedPassword) {
        loginError = 'Неверное имя пользователя или пароль';
        return;
      }

      currentUser = { username: trimmedUsername };
      isAuthenticated = true;
      localStorage.setItem('current_user', JSON.stringify(currentUser));

      showToast(`С возвращением, ${trimmedUsername}!`, 'success');
    }

    showLoginModal = false;
    username = '';
    password = '';
    loadUserCart();
  }

  function logout() {
    isAuthenticated = false;
    currentUser = null;
    cartItems = [];
    cartCount = 0;
    localStorage.removeItem('current_user');
    showToast('Вы успешно вышли из аккаунта', 'success');
  }

  // ==================== КОРЗИНА ====================

  function handleAddToCart(event) {
    const catConfig = event.detail;

    if (!isAuthenticated) {
      showLoginModal = true;
      showToast('Войдите в аккаунт, чтобы добавить котика в корзину', 'error');
      return;
    }

    const newCat = {
      ...catConfig,
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };

    cartItems = [...cartItems, newCat];
    cartCount = cartItems.length;
    saveUserCart(currentUser.username, cartItems);

    showToast('Котик добавлен в корзину!', 'success');
  }

  // ==================== ФОРМА ЗАЯВКИ ====================

  function submitForm(e) {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      showToast('Заполните обязательные поля', 'error');
      return;
    }
    formSubmitted = true;
    showToast('Спасибо! Заявка отправлена.', 'success');
    formData = { name: '', phone: '', email: '' };
    setTimeout(() => (formSubmitted = false), 3000);
  }

  // ==================== ИНИЦИАЛИЗАЦИЯ ====================

  onMount(() => {
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      try {
        currentUser = JSON.parse(savedUser);
        isAuthenticated = true;
        loadUserCart();
      } catch (e) {
        localStorage.removeItem('current_user');
      }
    }
  });
</script>

<!-- Toast-уведомление -->
{#if toastMessage}
  <div class="toast {toastType}">
    <span>{toastMessage}</span>
  </div>
{/if}

<header class="header">
  <div class="header-container">
    <h1 class="logo">🐾 Кото-Мир</h1>
    <div class="header-actions">
      {#if isAuthenticated}
        <span class="username">👤 {currentUser?.username}</span>
        <button class="btn btn-logout" on:click={logout}>Выйти</button>
      {:else}
        <button class="btn btn-login" on:click={() => showLoginModal = true}>
          Войти / Регистрация
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

{#if showLoginModal}
  <div class="modal-overlay" on:click={() => showLoginModal = false}>
    <div class="modal" on:click|stopPropagation>
      <h2>{isRegistering ? 'Регистрация' : 'Вход'}</h2>
      <form on:submit={handleAuth}>
        <input type="text" bind:value={username} placeholder="Имя пользователя" required />
        <input type="password" bind:value={password} placeholder="Пароль" required />
        {#if loginError}
          <p class="error-message">{loginError}</p>
        {/if}
        <button type="submit" class="btn btn-primary">
          {isRegistering ? 'Зарегистрироваться' : 'Войти'}
        </button>
      </form>
      <button class="btn btn-link" on:click={() => { isRegistering = !isRegistering; loginError = ''; }}>
        {isRegistering ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
      </button>
      <button class="btn btn-close" on:click={() => { showLoginModal = false; loginError = ''; username = ''; password = ''; }}>✕</button>
    </div>
  </div>
{/if}

<main class="main-content">
  <section class="about-section">
    <h2>🐱 О нашем питомнике</h2>
    <div class="about-content">
      <p>Добро пожаловать в питомник "Кото-Мир" — место, где рождается счастье!</p>
      <p>Создайте своего идеального котика в конструкторе и добавьте в корзину.</p>
      {#if isAuthenticated}
        <p class="welcome-message">Добро пожаловать, <strong>{currentUser.username}</strong>! У вас в корзине: {cartCount} котиков.</p>
      {:else}
        <p class="auth-prompt">⚠️ Для добавления котиков в корзину необходимо войти в систему.</p>
      {/if}
    </div>
  </section>

  <section class="builder-section">
    <h2>🎨 Собери своего котика</h2>
    <CatBuilder on:addToCart={handleAddToCart} />
  </section>

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
</main>


<style>
  :global(body) {
    margin: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: #f8f9fa;
    min-height: 100vh;
  }
 
  .header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 2rem;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: sticky;
    top: 0;
    z-index: 100;
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
 
  .username {
    font-weight: 500;
    padding: 0.3rem 0.8rem;
    background: rgba(255,255,255,0.2);
    border-radius: 20px;
  }
 
  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: white;
    color: #667eea;
    font-weight: 500;
    transition: all 0.2s;
  }
 
  .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  }
 
  .btn-login {
    background: #48bb78;
    color: white;
  }
 
  .btn-logout {
    background: #f56565;
    color: white;
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
    transition: all 0.2s;
  }
 
  .cart-btn:hover {
    background: #ff5252;
    transform: translateY(-2px);
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
    backdrop-filter: blur(2px);
  }
 
  .modal {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    width: 90%;
    max-width: 400px;
    position: relative;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  }
 
  .modal h2 {
    margin-top: 0;
    color: #333;
  }
 
  .modal input {
    width: 100%;
    padding: 0.75rem;
    margin: 0.5rem 0;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-sizing: border-box;
    font-size: 1rem;
  }
 
  .modal input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }
 
  .error-message {
    color: #f56565;
    font-size: 0.9rem;
    margin: 0.5rem 0;
    padding: 0.5rem;
    background: #fed7d7;
    border-radius: 4px;
  }
 
  .btn-primary {
    background: #667eea;
    color: white;
    width: 100%;
    margin: 1rem 0;
  }
 
  .btn-link {
    background: none;
    color: #667eea;
    text-decoration: underline;
    width: 100%;
  }
 
  .btn-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    color: #999;
    font-size: 1.5rem;
    padding: 0;
    width: 30px;
    height: 30px;
  }
 
  .main-content {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
  }
 
  section {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.05);
  }
 
  h2 {
    color: #333;
    margin-top: 0;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #667eea;
  }
 
  .about-content {
    line-height: 1.6;
    color: #555;
  }
 
  .welcome-message {
    color: #48bb78;
    font-weight: 500;
    padding: 0.5rem;
    background: #c6f6d5;
    border-radius: 6px;
    margin-top: 1rem;
  }
 
  .auth-prompt {
    color: #ed8936;
    font-weight: 500;
    padding: 0.5rem;
    background: #feebc8;
    border-radius: 6px;
    margin-top: 1rem;
  }
 
  .consultation-form input {
    width: 100%;
    padding: 0.75rem;
    margin: 0.5rem 0;
    border: 1px solid #ddd;
    border-radius: 6px;
    box-sizing: border-box;
    font-size: 1rem;
  }
 
  .btn-submit {
    background: #48bb78;
    color: white;
    width: 100%;
    margin-top: 1rem;
    padding: 0.75rem;
    font-size: 1rem;
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
    border-left: 4px solid #667eea;
  }
 
  .btn-small {
    font-size: 0.8rem;
    padding: 0.3rem 0.6rem;
    margin-top: 0.5rem;
    background: #667eea;
    color: white;
  }
</style>
