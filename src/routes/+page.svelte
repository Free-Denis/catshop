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
  
  // Данные для страницы
  let galleryImages = [
    { id: 1, caption: 'Наш питомник' },
    { id: 2, caption: 'Игровая зона' },
    { id: 3, caption: 'Уход за котятами' },
    { id: 4, caption: 'Сертификаты качества' }
  ];
  
  let reviews = [];
  let availableCats = []; // Котики из базы
  
  // Форма заявки
  let formData = {
    name: '',
    phone: '',
    email: '',
    contactMethod: 'phone',
    agree: false,
    captcha: ''
  };
  
  let formSubmitted = false;
  let captchaCode = '';
  
  // ========== ВСЕ ФУНКЦИИ РАБОТЫ С БАЗОЙ ==========
  
  // Загрузить котиков из базы
  async function loadCatsFromDB() {
    try {
      const response = await fetch('/api/cats');
      if (response.ok) {
        const data = await response.json();
        availableCats = data.cats || [];
        console.log('Загружены котики из базы:', availableCats.length);
      }
    } catch (error) {
      console.error('Ошибка загрузки котиков:', error);
    }
  }
  
  // Загрузить отзывы из базы
  async function loadReviewsFromDB() {
    try {
      const response = await fetch('/api/reviews');
      if (response.ok) {
        const data = await response.json();
        reviews = data.reviews || [];
      } else {
        // Если нет в базе, используем начальные
        reviews = [
          { 
            id: '1', 
            name: 'Анна Петрова', 
            avatar: '👩', 
            cat: 'Британский котёнок', 
            review: 'Замечательный котёнок! Очень ласковый и игривый. Питомник рекомендую!',
            createdAt: new Date().toISOString()
          },
          { 
            id: '2', 
            name: 'Иван Сидоров', 
            avatar: '👨', 
            cat: 'Мейн-кун', 
            review: 'Кот просто великолепен! Здоровый, активный, все прививки сделаны.',
            createdAt: new Date().toISOString()
          },
          { 
            id: '3', 
            name: 'Мария Иванова', 
            avatar: '👩‍💼', 
            cat: 'Сфинкс', 
            review: 'Мечта сбылась! Котёнок очень умный и ласковый. Спасибо питомнику!',
            createdAt: new Date().toISOString()
          }
        ];
      }
    } catch (error) {
      console.error('Ошибка загрузки отзывов:', error);
    }
  }
  
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
      } else {
        cartItems = [];
        cartCount = 0;
      }
    } catch (error) {
      console.error('Ошибка загрузки корзины:', error);
      cartItems = [];
      cartCount = 0;
    }
  }
  
  // Генерация капчи
  function generateCaptcha() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    captchaCode = result;
  }
  
  // Авторизация - РАБОТАЕТ С БАЗОЙ
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
        
        // Загружаем все данные пользователя из базы
        await loadUserCart();
        
      } else {
        loginError = data.error || 'Ошибка авторизации';
      }
    } catch (error) {
      loginError = 'Ошибка сети';
    }
  }
  
  // Выход
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
      // Сохраняем котика в базу через API
      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          cat: {
            ...catConfig,
            name: `Котик ${catConfig.breed === 'british' ? 'Британский' : 
                  catConfig.breed === 'siamese' ? 'Сиамский' : 'Мейн-кун'}`,
            createdAt: new Date().toISOString(),
            status: 'cart'
          }
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        // Обновляем локальное состояние
        cartItems.push(catConfig);
        cartCount = cartItems.length;
        alert('✅ Котик добавлен в корзину и сохранен в базе!');
      } else {
        alert('❌ Ошибка: ' + result.error);
      }
    } catch (error) {
      console.error('Ошибка при сохранении котика:', error);
      alert('❌ Не удалось сохранить котика. Попробуйте снова.');
    }
  }
  
  // Отправка формы заявки - СОХРАНЯЕТ В БАЗУ
  async function submitForm(e) {
    e.preventDefault();
    
    if (!formData.agree) {
      alert('Необходимо согласие на обработку данных');
      return;
    }
    
    if (formData.captcha !== captchaCode) {
      alert('Неверный код CAPTCHA');
      generateCaptcha();
      return;
    }
    
    try {
      // Сохраняем заявку в базу
      const response = await fetch('/api/requests/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          captcha: captchaCode,
          submittedAt: new Date().toISOString(),
          status: 'new'
        })
      });
      
      if (response.ok) {
        formSubmitted = true;
        
        // Сбрасываем форму
        formData = {
          name: '',
          phone: '',
          email: '',
          contactMethod: 'phone',
          agree: false,
          captcha: ''
        };
        
        generateCaptcha();
        
        setTimeout(() => {
          formSubmitted = false;
        }, 5000);
      } else {
        const data = await response.json();
        alert('Ошибка отправки: ' + data.error);
      }
    } catch (error) {
      alert('Ошибка сети при отправке формы');
    }
  }
  
  // Добавление отзыва - СОХРАНЯЕТ В БАЗУ
  async function addReview() {
    const reviewText = prompt('Напишите ваш отзыв:');
    if (!reviewText || !reviewText.trim()) return;
    
    if (!isAuthenticated) {
      alert('Чтобы оставить отзыв, войдите в систему');
      return;
    }
    
    try {
      const response = await fetch('/api/reviews/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          review: reviewText,
          cat: 'Котик из конструктора',
          createdAt: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        alert('✅ Спасибо за отзыв! Он сохранен.');
        // Обновляем отзывы
        await loadReviewsFromDB();
      } else {
        alert('❌ Ошибка при сохранении отзыва');
      }
    } catch (error) {
      console.error('Ошибка:', error);
    }
  }
  
  // Инициализация - ЗАГРУЖАЕТ ВСЕ ИЗ БАЗЫ
  onMount(async () => {
    // Загружаем общие данные
    await loadCatsFromDB();
    await loadReviewsFromDB();
    
    // Проверяем авторизацию
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      isAuthenticated = true;
      // Загружаем данные пользователя
      await loadUserCart();
    }
    
    generateCaptcha();
  });
</script>

<!-- ШАПКА -->
<header class="header">
  <div class="header-container">
    <h1 class="logo">🐾 Кото-Мир</h1>
    
    <div class="header-actions">
      {#if isAuthenticated}
        <span class="username">Привет, {currentUser?.username}!</span>
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
<div class="modal-overlay" on:click={() => showLoginModal = false}
     on:keydown={(e) => e.key === 'Escape' && (showLoginModal = false)}
     tabindex="0" role="button">
  <div class="modal" on:click|stopPropagation
       on:keydown|stopPropagation>
    <h2>{isRegistering ? 'Регистрация' : 'Вход'}</h2>
    
    <form on:submit|preventDefault={handleAuth}>
      <div class="form-group">
        <label for="login-username">Имя пользователя</label>
        <input id="login-username" type="text" bind:value={username} placeholder="Имя пользователя" required />
      </div>
      
      <div class="form-group">
        <label for="login-password">Пароль</label>
        <input id="login-password" type="password" bind:value={password} placeholder="Пароль" required />
      </div>
      
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
    
    <button class="btn btn-close" on:click={() => showLoginModal = false} aria-label="Закрыть">✕</button>
  </div>
</div>
{/if}

<!-- ОСНОВНОЕ СОДЕРЖИМОЕ -->
<main class="main-content">
  
  <!-- ИНФОРМАЦИЯ О ПРЕДПРИЯТИИ -->
  <section class="about-section">
    <h2>🐱 О нашем питомнике</h2>
    <div class="about-content">
      <div class="about-text">
        <p>Добро пожаловать в питомник "Кото-Мир" — место, где рождается счастье!</p>
        <p>Мы занимаемся профессиональным разведением породистых кошек с 2010 года. Все наши котята выращены в любви и заботе, имеют полный пакет документов, привиты и обладают отличным здоровьем.</p>
        <p>Наша миссия — дарить людям верных пушистых друзей, которые будут радовать вас долгие годы своей лаской и преданностью.</p>
      </div>
      
      <!-- Доступные котики из базы -->
      {#if availableCats.length > 0}
        <div class="available-cats">
          <h3>🐱 Доступные породы в питомнике:</h3>
          <div class="cats-grid">
            {#each availableCats as cat}
              {#if cat.available}
                <div class="cat-badge">
                  <span class="cat-breed">
                    {cat.breed === 'british' ? 'Британский' : 
                     cat.breed === 'siamese' ? 'Сиамский' : 'Мейн-кун'}
                  </span>
                  <span class="cat-price">{cat.price.toLocaleString()} ₽</span>
                </div>
              {/if}
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </section>
  
  <!-- ГАЛЕРЕЯ -->
  <section class="gallery-section">
    <h2>📷 Наш питомник</h2>
    <div class="gallery">
      {#each galleryImages as image}
        <div class="gallery-item">
          <div class="image-placeholder">{image.caption}</div>
          <p>{image.caption}</p>
        </div>
      {/each}
    </div>
  </section>
  
  <!-- ОТЗЫВЫ -->
  <section class="reviews-section">
    <div class="reviews-header">
      <h2>⭐ Отзывы наших клиентов</h2>
      <button class="btn btn-add-review" on:click={addReview}>
        + Добавить отзыв
      </button>
    </div>
    <div class="reviews">
      {#each reviews as review}
        <div class="review-card">
          <div class="review-header">
            <span class="avatar">{review.avatar || '👤'}</span>
            <div>
              <h4>{review.name}</h4>
              <p class="cat-name">Котик: {review.cat}</p>
              <small class="review-date">
                {new Date(review.createdAt || Date.now()).toLocaleDateString()}
              </small>
            </div>
          </div>
          <p class="review-text">"{review.review}"</p>
        </div>
      {/each}
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
        <p><small>Ваша заявка сохранена в нашей базе.</small></p>
      </div>
    {:else}
      <form class="consultation-form" on:submit={submitForm}>
        <div class="form-group">
          <label for="name">Ваше имя *</label>
          <input id="name" type="text" bind:value={formData.name} required />
        </div>
        
        <div class="form-group">
          <label for="phone">Телефон *</label>
          <input id="phone" type="tel" bind:value={formData.phone} required />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input id="email" type="email" bind:value={formData.email} />
        </div>
        
        <div class="form-group">
          <label for="contact-method">Предпочтительный способ связи</label>
          <select id="contact-method" bind:value={formData.contactMethod}>
            <option value="phone">Телефон</option>
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="telegram">Telegram</option>
          </select>
        </div>
        
        <div class="form-group captcha-group">
          <label for="captcha">Введите код с картинки *</label>
          <div class="captcha">
            <div class="captcha-code">{captchaCode}</div>
            <button type="button" class="btn-refresh" on:click={generateCaptcha} aria-label="Обновить код">🔄</button>
          </div>
          <input id="captcha" type="text" bind:value={formData.captcha} placeholder="Введите код" required />
        </div>
        
        <div class="form-group checkbox-group">
          <label class="checkbox">
            <input type="checkbox" bind:checked={formData.agree} />
            <span>Согласен на обработку персональных данных *</span>
          </label>
        </div>
        
        <button type="submit" class="btn btn-submit">📨 Отправить заявку (сохранить в базе)</button>
      </form>
    {/if}
  </section>
</main>

<!-- ПОДВАЛ -->
<footer class="footer">
  <div class="footer-content">
    <div class="footer-section">
      <h3>Кото-Мир</h3>
      <p>Профессиональный питомник породистых кошек</p>
      <p><small>Все данные хранятся в защищенном облачном хранилище</small></p>
    </div>
    
    <div class="footer-section">
      <h4>Контакты</h4>
      <p>📍 Москва, ул. Котячья, 15</p>
      <p>📞 +7 (999) 123-45-67</p>
      <p>✉️ info@koto-mir.ru</p>
    </div>
    
    <div class="footer-section">
      <h4>Мы в соцсетях</h4>
      <div class="social-links">
        <a href="https://vk.com" target="_blank" rel="noopener noreferrer" class="social-link">📘 VK</a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="social-link">📷 Instagram</a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" class="social-link">📹 YouTube</a>
        <a href="https://t.me" target="_blank" rel="noopener noreferrer" class="social-link">💬 Telegram</a>
      </div>
    </div>
    
    <div class="footer-section">
      <h4>Часы работы</h4>
      <p>Пн-Пт: 10:00 - 20:00</p>
      <p>Сб-Вс: 11:00 - 18:00</p>
    </div>
  </div>
  
  <div class="footer-bottom">
    <p>© 2024 Кото-Мир. Все права защищены.</p>
    <p><small>База данных: Vercel Blob Storage</small></p>
  </div>
</footer>

<style>
  /* ОБЩИЕ СТИЛИ */
  :global(body) {
    margin: 0;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%);
    min-height: 100vh;
  }
  
  /* ШАПКА */
  .header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 1rem 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
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
    font-size: 1.8rem;
    font-weight: bold;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
  }
  
  .username {
    font-weight: 500;
    margin-right: 1rem;
  }
  
  /* КНОПКИ */
  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    font-family: inherit;
  }
  
  .btn-login, .btn-logout {
    background: white;
    color: #667eea;
  }
  
  .btn-login:hover, .btn-logout:hover {
    background: #f7f7f7;
    transform: translateY(-2px);
  }
  
  .btn-add-review {
    background: #48bb78;
    color: white;
    font-size: 0.9rem;
  }
  
  .btn-add-review:hover {
    background: #38a169;
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
    transition: all 0.3s ease;
  }
  
  .cart-btn:hover {
    background: #ff5252;
    transform: translateY(-2px);
  }
  
  .cart-count {
    background: white;
    color: #ff6b6b;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    font-weight: bold;
  }
  
  /* МОДАЛЬНОЕ ОКНО */
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }
  
  .modal {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    position: relative;
    color: #333;
  }
  
  .modal h2 {
    margin-top: 0;
    color: #667eea;
  }
  
  .modal .form-group {
    margin-bottom: 1rem;
  }
  
  .modal .form-group label {
    display: block;
    margin-bottom: 0.25rem;
    color: #4a5568;
  }
  
  .modal input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    box-sizing: border-box;
  }
  
  .error-message {
    color: #ff6b6b;
    font-size: 0.9rem;
    margin: 0.5rem 0;
  }
  
  .btn-primary {
    background: #667eea;
    color: white;
  }
  
  .btn-primary:hover {
    background: #5a67d8;
  }
  
  .btn-link {
    background: none;
    color: #667eea;
    text-decoration: underline;
    width: 100%;
    text-align: center;
    padding: 0.5rem;
    margin-top: 1rem;
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
  
  /* ОСНОВНОЙ КОНТЕНТ */
  .main-content {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 0 1rem;
  }
  
  /* СЕКЦИИ */
  section {
    background: white;
    border-radius: 8px;
    padding: 2rem;
    margin-bottom: 2rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    color: #4a5568;
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.5rem;
  }
  
  /* Доступные котики */
  .available-cats {
    margin-top: 1.5rem;
    padding: 1rem;
    background: #f7fafc;
    border-radius: 8px;
  }
  
  .cats-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .cat-badge {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 1rem;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    min-width: 120px;
  }
  
  .cat-breed {
    font-weight: 500;
    color: #4a5568;
  }
  
  .cat-price {
    font-size: 0.9rem;
    color: #667eea;
    font-weight: bold;
  }
  
  /* ГАЛЕРЕЯ */
  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .gallery-item {
    text-align: center;
  }
  
  .image-placeholder {
    width: 100%;
    height: 150px;
    background: linear-gradient(45deg, #a0aec0, #cbd5e0);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    margin-bottom: 0.5rem;
  }
  
  /* ОТЗЫВЫ */
  .reviews-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  
  .reviews {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
  }
  
  .review-card {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 1rem;
  }
  
  .review-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
  }
  
  .avatar {
    font-size: 2rem;
  }
  
  .cat-name {
    color: #667eea;
    font-weight: 500;
    margin: 0;
  }
  
  .review-date {
    color: #a0aec0;
    font-size: 0.8rem;
  }
  
  .review-text {
    color: #4a5568;
    font-style: italic;
    margin: 0;
  }
  
  /* ФОРМА */
  .consultation-form {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .form-group {
    margin-bottom: 1rem;
  }
  
  .consultation-form label {
    display: block;
    margin-bottom: 0.5rem;
    color: #4a5568;
    font-weight: 500;
  }
  
  .consultation-form input, 
  .consultation-form select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #cbd5e0;
    border-radius: 4px;
    box-sizing: border-box;
  }
  
  .captcha-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .captcha {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .captcha-code {
    background: #f7fafc;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    font-family: monospace;
    font-size: 1.2rem;
    letter-spacing: 2px;
    border: 1px dashed #cbd5e0;
  }
  
  .btn-refresh {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.2rem;
  }
  
  .checkbox-group {
    margin: 1.5rem 0;
  }
  
  .checkbox {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
  }
  
  .btn-submit {
    background: #48bb78;
    color: white;
    padding: 0.75rem 2rem;
    font-size: 1rem;
    width: 100%;
  }
  
  .btn-submit:hover {
    background: #38a169;
  }
  
  .success-message {
    text-align: center;
    padding: 2rem;
    background: #c6f6d5;
    border-radius: 8px;
    color: #22543d;
  }
  
  /* ПОДВАЛ */
  .footer {
    background: #2d3748;
    color: white;
    padding: 2rem;
  }
  
  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
  }
  
  .footer-section h3,
  .footer-section h4 {
    color: white;
    margin-top: 0;
  }
  
  .footer-section p {
    margin: 0.5rem 0;
    color: #cbd5e0;
  }
  
  .social-links {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .social-link {
    color: #cbd5e0;
    text-decoration: none;
    transition: color 0.3s ease;
  }
  
  .social-link:hover {
    color: white;
  }
  
  .footer-bottom {
    text-align: center;
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #4a5568;
    color: #a0aec0;
  }
  
  /* АДАПТИВНОСТЬ */
  @media (max-width: 768px) {
    .header-container {
      flex-direction: column;
      gap: 1rem;
    }
    
    .reviews-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }
  }
</style>
