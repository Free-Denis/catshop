<!-- src/routes/cart/+page.svelte -->
<script>
  import { onMount, afterUpdate } from 'svelte';
  
  let currentUser = null;
  let cartItems = [];
  let total = 0;
  let loading = true;
  
  // Функция для отрисовки миниатюры котика
  function renderCatThumbnail(cat, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Создаем SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '80');
    svg.setAttribute('height', '80');
    svg.setAttribute('viewBox', '0 0 340 300');
    
    // Простая отрисовка по параметрам
    const breed = cat.breed;
    const furColor = cat.furColor || '#bfbfbf';
    const eyeColor = cat.eyeColor || '#a7862a';
    const fat = cat.fat || 0.5;
    
    // Тело (зависит от полноты)
    const body = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    const bodyRX = 30 + 15 * fat;
    const bodyRY = 40 - 10 * fat;
    body.setAttribute('cx', '50');
    body.setAttribute('cy', '60');
    body.setAttribute('rx', bodyRX);
    body.setAttribute('ry', bodyRY);
    body.setAttribute('fill', furColor);
    body.setAttribute('stroke', '#333');
    body.setAttribute('stroke-width', '0.5');
    
    // Голова
    const head = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    head.setAttribute('cx', '50');
    head.setAttribute('cy', '30');
    head.setAttribute('rx', '25');
    head.setAttribute('ry', '20');
    head.setAttribute('fill', furColor);
    head.setAttribute('stroke', '#333');
    head.setAttribute('stroke-width', '0.5');
    
    // Глаза
    const eyeL = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    eyeL.setAttribute('cx', '40');
    eyeL.setAttribute('cy', '32');
    eyeL.setAttribute('r', '4');
    eyeL.setAttribute('fill', eyeColor);
    
    const eyeR = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    eyeR.setAttribute('cx', '60');
    eyeR.setAttribute('cy', '32');
    eyeR.setAttribute('r', '4');
    eyeR.setAttribute('fill', eyeColor);
    
    // Уши (зависит от породы)
    if (breed === 'siamese' || breed === 'mainecoon') {
      // Заостренные уши
      const earL = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      earL.setAttribute('points', '35,15 25,25 45,25');
      earL.setAttribute('fill', furColor);
      earL.setAttribute('stroke', '#333');
      earL.setAttribute('stroke-width', '0.5');
      
      const earR = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      earR.setAttribute('points', '65,15 55,25 75,25');
      earR.setAttribute('fill', furColor);
      earR.setAttribute('stroke', '#333');
      earR.setAttribute('stroke-width', '0.5');
      
      svg.appendChild(earL);
      svg.appendChild(earR);
    } else {
      // Круглые уши (британские)
      const earL = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      earL.setAttribute('cx', '35');
      earL.setAttribute('cy', '20');
      earL.setAttribute('r', '8');
      earL.setAttribute('fill', furColor);
      earL.setAttribute('stroke', '#333');
      earL.setAttribute('stroke-width', '0.5');
      
      const earR = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      earR.setAttribute('cx', '65');
      earR.setAttribute('cy', '20');
      earR.setAttribute('r', '8');
      earR.setAttribute('fill', furColor);
      earR.setAttribute('stroke', '#333');
      earR.setAttribute('stroke-width', '0.5');
      
      svg.appendChild(earL);
      svg.appendChild(earR);
    }
    
    // Хвост (зависит от породы)
    const tail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    let tailPath;
    
    if (breed === 'siamese') {
      tailPath = 'M 70 55 Q 90 40 95 65';
    } else if (breed === 'mainecoon') {
      tailPath = 'M 70 55 Q 90 30 100 70 Q 110 40 120 65';
    } else {
      tailPath = 'M 70 55 Q 85 50 90 65';
    }
    
    tail.setAttribute('d', tailPath);
    tail.setAttribute('fill', 'none');
    tail.setAttribute('stroke', furColor);
    tail.setAttribute('stroke-width', '6');
    tail.setAttribute('stroke-linecap', 'round');
    
    // Добавляем элементы
    svg.appendChild(body);
    svg.appendChild(tail);
    svg.appendChild(head);
    svg.appendChild(eyeL);
    svg.appendChild(eyeR);
    
    container.appendChild(svg);
  }
  
  // Загружаем корзину пользователя
  async function loadCart() {
    if (!currentUser) return;
    
    loading = true;
    try {
      // Пробуем загрузить из API или используем временные данные
      const response = await fetch(`/api/cart/get?username=${currentUser.username}`);
      if (response && response.ok) {
        const data = await response.json();
        cartItems = data.cart || [];
        total = data.total || 0;
      } else {
        // Если API недоступно, используем тестовые данные
        cartItems = [
          {
            id: '1',
            breed: 'british',
            furColor: '#bfbfbf',
            eyeColor: '#a7862a',
            eyes: 'Золотистые',
            fur: 'Короткая',
            thickness: 3,
            price: 20000,
            fat: 0.5
          },
          {
            id: '2', 
            breed: 'siamese',
            furColor: '#f2c27d',
            eyeColor: '#3a5ba0',
            eyes: 'Голубые',
            fur: 'Короткая',
            thickness: 2,
            price: 18000,
            fat: 0.3
          }
        ];
        total = cartItems.reduce((sum, item) => sum + item.price, 0);
      }
    } catch (error) {
      console.log('Используем тестовые данные:', error);
      // Тестовые данные при ошибке
      cartItems = [
        {
          id: '1',
          breed: 'british',
          furColor: '#bfbfbf',
          eyeColor: '#a7862a',
          eyes: 'Золотистые',
          fur: 'Короткая',
          thickness: 3,
          price: 20000,
          fat: 0.5
        }
      ];
      total = cartItems.reduce((sum, item) => sum + item.price, 0);
    }
    loading = false;
    
    // Отрисовываем миниатюры после загрузки
    setTimeout(() => {
      cartItems.forEach((item, index) => {
        renderCatThumbnail(item, `cat-thumb-${index}`);
      });
    }, 100);
  }
  
  // Удаление из корзины
  async function removeFromCart(catId) {
    try {
      const response = await fetch('/api/cart/remove', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username,
          catId
        })
      });
      
      if (response.ok) {
        // Удаляем локально
        cartItems = cartItems.filter(item => item.id !== catId);
        total = cartItems.reduce((sum, item) => sum + item.price, 0);
      } else {
        const data = await response.json();
        alert('Ошибка: ' + data.error);
      }
    } catch (error) {
      alert('Ошибка сети при удалении');
    }
  }
  
  // Оформление заказа
  async function checkout() {
    if (cartItems.length === 0) {
      alert('Корзина пуста');
      return;
    }
    
    try {
      const response = await fetch('/api/order/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: currentUser.username
        })
      });
      
      if (response.ok) {
        alert('Заказ успешно оформлен! Статус котиков изменен на "заказан".');
        cartItems = [];
        total = 0;
      } else {
        const data = await response.json();
        alert('Ошибка: ' + data.error);
      }
    } catch (error) {
      alert('Ошибка сети при оформлении заказа');
    }
  }
  
  // Получение названия породы
  function getBreedName(breedId) {
    const breeds = {
      'british': 'Британская',
      'siamese': 'Сиамская', 
      'mainecoon': 'Мейн-кун'
    };
    return breeds[breedId] || 'Неизвестно';
  }
  
  // Инициализация
  onMount(() => {
    // Получаем пользователя
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      currentUser = JSON.parse(savedUser);
      loadCart();
    } else {
      loading = false;
    }
  });
  
  // Обновляем миниатюры при изменении данных
  afterUpdate(() => {
    if (cartItems.length > 0) {
      cartItems.forEach((item, index) => {
        renderCatThumbnail(item, `cat-thumb-${index}`);
      });
    }
  });
</script>

<main class="cart-page">
  <div class="cart-header">
    <h1>🛒 Ваша корзина</h1>
    {#if currentUser}
      <span class="username">Пользователь: {currentUser.username}</span>
    {/if}
  </div>
  
  {#if loading}
    <div class="loading">
      <p>Загрузка корзины...</p>
    </div>
  {:else if !currentUser}
    <div class="auth-required">
      <h2>Требуется авторизация</h2>
      <p>Для просмотра корзины необходимо войти в систему</p>
      <a href="/" class="btn btn-primary">Войти на главной</a>
    </div>
  {:else if cartItems.length === 0}
    <div class="empty-cart">
      <h2>Корзина пуста 🐱</h2>
      <p>Соберите своего котика в конструкторе на главной странице!</p>
      <a href="/" class="btn btn-primary">К конструктору</a>
    </div>
  {:else}
    <!-- Список котиков -->
    <div class="cart-items">
      {#each cartItems as item, index}
        <div class="cart-item">
          <div class="item-preview">
            <div class="cat-thumbnail" id="cat-thumb-{index}">
              <!-- SVG будет отрисован здесь -->
            </div>
          </div>
          
          <div class="item-details">
            <h3>Котик #{index + 1}</h3>
            <div class="details-grid">
              <div class="detail">
                <span class="label">Порода:</span>
                <span class="value">{getBreedName(item.breed)}</span>
              </div>
              <div class="detail">
                <span class="label">Шерсть:</span>
                <span class="value">{item.fur}</span>
              </div>
              <div class="detail">
                <span class="label">Цвет глаз:</span>
                <span class="value">{item.eyes}</span>
                <div class="color-preview" style="background-color: {item.eyeColor}"></div>
              </div>
              <div class="detail">
                <span class="label">Цвет шерсти:</span>
                <div class="color-preview" style="background-color: {item.furColor}"></div>
              </div>
              <div class="detail">
                <span class="label">Полнота:</span>
                <span class="value">{Math.round(item.fat * 100)}%</span>
              </div>
              <div class="detail">
                <span class="label">Толщина шерсти:</span>
                <span class="value">{item.thickness}/5</span>
              </div>
            </div>
          </div>
          
          <div class="item-price">
            <div class="price-amount">{item.price.toLocaleString()} ₽</div>
            <button 
              class="btn btn-remove" 
              on:click={() => removeFromCart(item.id)}
              title="Удалить из корзины"
            >
              ✕
            </button>
          </div>
        </div>
      {/each}
    </div>
    
    <!-- Итого -->
    <div class="cart-summary">
      <div class="summary-row">
        <span>Количество котиков:</span>
        <strong>{cartItems.length}</strong>
      </div>
      <div class="summary-row">
        <span>Сумма заказа:</span>
        <strong class="total-price">{total.toLocaleString()} ₽</strong>
      </div>
      
      <!-- Кнопка оформления заказа -->
      <div class="checkout-section">
        <button class="btn btn-checkout" on:click={checkout}>
          🐾 Оформить заказ
        </button>
        <p class="checkout-note">
          При оформлении заказа статус котиков изменится на "заказан"
        </p>
      </div>
    </div>
  {/if}
</main>

<style>
  .cart-page {
    max-width: 900px;
    margin: 2rem auto;
    padding: 0 1rem;
    min-height: 70vh;
  }
  
  .cart-header {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #e2e8f0;
  }
  
  .cart-header h1 {
    color: #4a5568;
    margin: 0 0 0.5rem 0;
    font-size: 2.5rem;
  }
  
  .username {
    color: #718096;
    font-size: 0.9rem;
  }
  
  /* Загрузка */
  .loading {
    text-align: center;
    padding: 3rem;
    color: #718096;
  }
  
  /* Авторизация */
  .auth-required, .empty-cart {
    text-align: center;
    padding: 3rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .auth-required h2, .empty-cart h2 {
    color: #4a5568;
    margin-bottom: 1rem;
  }
  
  /* Список котиков */
  .cart-items {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    margin-bottom: 3rem;
  }
  
  .cart-item {
    display: grid;
    grid-template-columns: 100px 1fr auto;
    gap: 1.5rem;
    padding: 1.5rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    transition: transform 0.2s, box-shadow 0.2s;
    align-items: start;
  }
  
  .cart-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }
  
  /* Миниатюра */
  .item-preview {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .cat-thumbnail {
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    border: 2px solid #e2e8f0;
    background: #f7fafc;
  }
  
  .cat-thumbnail svg {
    width: 100%;
    height: 100%;
    display: block;
  }
  
  /* Детали */
  .item-details h3 {
    margin: 0 0 1rem 0;
    color: #2d3748;
  }
  
  .details-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
  
  .detail {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .label {
    color: #718096;
    font-size: 0.9rem;
    min-width: 120px;
  }
  
  .value {
    color: #4a5568;
    font-weight: 500;
  }
  
  .color-preview {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 1px solid #cbd5e0;
  }
  
  /* Цена и удаление */
  .item-price {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 1rem;
  }
  
  .price-amount {
    font-size: 1.5rem;
    font-weight: bold;
    color: #2d3748;
  }
  
  /* Кнопки */
  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    font-family: inherit;
  }
  
  .btn-primary {
    background: #667eea;
    color: white;
  }
  
  .btn-primary:hover {
    background: #5a67d8;
  }
  
  .btn-remove {
    width: 36px;
    height: 36px;
    background: #fc8181;
    color: white;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }
  
  .btn-remove:hover {
    background: #f56565;
  }
  
  /* Итого */
  .cart-summary {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .summary-row:last-child {
    border-bottom: none;
  }
  
  .total-price {
    font-size: 1.8rem;
    color: #2d3748;
  }
  
  /* Оформление заказа */
  .checkout-section {
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 2px solid #e2e8f0;
    text-align: center;
  }
  
  .btn-checkout {
    background: linear-gradient(135deg, #48bb78 0%, #38a169 100%);
    color: white;
    padding: 1rem 2rem;
    font-size: 1.1rem;
    font-weight: bold;
    width: 100%;
    max-width: 300px;
  }
  
  .btn-checkout:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(72, 187, 120, 0.3);
  }
  
  .checkout-note {
    margin-top: 1rem;
    color: #718096;
    font-size: 0.9rem;
  }
  
  /* Адаптивность */
  @media (max-width: 768px) {
    .cart-item {
      grid-template-columns: 1fr;
      gap: 1rem;
    }
    
    .item-preview {
      justify-content: flex-start;
    }
    
    .item-price {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }
    
    .details-grid {
      grid-template-columns: 1fr;
    }
    
    .label {
      min-width: 140px;
    }
  }
</style>