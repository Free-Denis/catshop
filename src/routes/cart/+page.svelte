<script>
  import { onMount, afterUpdate } from 'svelte';

  let currentUser = null;
  let cartItems = [];
  let total = 0;
  let loading = true;

  // Toast-уведомление
  function showToast(message, type = 'success', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  // Функция отрисовки миниатюры котика
  function renderCatThumbnail(cat, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '80');
    svg.setAttribute('height', '80');
    svg.setAttribute('viewBox', '0 0 340 300');

    const breed = cat.breed;
    const furColor = cat.furColor || '#bfbfbf';
    const eyeColor = cat.eyeColor || '#a7862a';
    const fat = cat.fat || 0.5;

    // Тело
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

    // Уши
    if (breed === 'siamese' || breed === 'mainecoon') {
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

    // Хвост
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

    // Сборка
    svg.appendChild(body);
    svg.appendChild(tail);
    svg.appendChild(head);
    svg.appendChild(eyeL);
    svg.appendChild(eyeR);

    container.appendChild(svg);
  }

  // Локальное хранение
  function getUserCart(username) {
    const data = localStorage.getItem(`cart_${username}`);
    return data ? JSON.parse(data) : [];
  }

  function saveUserCart(username, cart) {
    localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
  }

  // Загрузка корзины
  async function loadCart() {
    loading = true;
    if (currentUser) {
      cartItems = getUserCart(currentUser.username);
      total = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
    }
    loading = false;

    // Отрисовка миниатюр после загрузки
    setTimeout(() => {
      cartItems.forEach((item, i) => renderCatThumbnail(item, `cat-thumb-${i}`));
    }, 100);
  }

  // Удаление из корзины
  function removeFromCart(catId) {
    cartItems = cartItems.filter(item => item.id !== catId);
    total = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
    saveUserCart(currentUser.username, cartItems);
    showToast('Котик удалён из корзины', 'success');
  }

  // Оформление заказа
  function checkout() {
    if (cartItems.length === 0) {
      showToast('Корзина пуста', 'error');
      return;
    }

    if (confirm('Оформить заказ? После этого корзина будет очищена.')) {
      cartItems = [];
      total = 0;
      saveUserCart(currentUser.username, []);
      showToast('Заказ успешно оформлен!', 'success');
    }
  }

  // Название породы
  function getBreedName(breedId) {
    const breeds = {
      british: 'Британская',
      siamese: 'Сиамская',
      mainecoon: 'Мейн-кун'
    };
    return breeds[breedId] || 'Неизвестно';
  }

  // Инициализация
  onMount(() => {
    const saved = localStorage.getItem('current_user');
    if (saved) {
      try {
        currentUser = JSON.parse(saved);
        loadCart();
      } catch (e) {
        localStorage.removeItem('current_user');
        loading = false;
      }
    } else {
      loading = false;
    }
  });

  // Переотрисовка миниатюр при обновлении
  afterUpdate(() => {
    cartItems.forEach((item, i) => renderCatThumbnail(item, `cat-thumb-${i}`));
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
    <div class="loading"><p>Загрузка корзины...</p></div>
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
    <div class="cart-items">
      {#each cartItems as item, index}
        <div class="cart-item">
          <div class="item-preview">
            <div class="cat-thumbnail" id="cat-thumb-{index}"></div>
          </div>

          <div class="item-details">
            <h3>Котик #{index + 1}</h3>
            <div class="details-grid">
              <div class="detail"><span class="label">Порода:</span><span class="value">{getBreedName(item.breed)}</span></div>
              <div class="detail"><span class="label">Шерсть:</span><span class="value">{item.fur || '—'}</span></div>
              <div class="detail"><span class="label">Цвет глаз:</span><span class="value">{item.eyes || '—'}</span><div class="color-preview" style="background-color: {item.eyeColor || '#000'}"></div></div>
              <div class="detail"><span class="label">Цвет шерсти:</span><div class="color-preview" style="background-color: {item.furColor || '#000'}"></div></div>
              <div class="detail"><span class="label">Полнота:</span><span class="value">{Math.round((item.fat || 0.5) * 100)}%</span></div>
              <div class="detail"><span class="label">Толщина шерсти:</span><span class="value">{item.thickness || 3}/5</span></div>
            </div>
          </div>

          <div class="item-price">
            <div class="price-amount">{(item.price || 0).toLocaleString()} ₽</div>
            <button class="btn btn-remove" on:click={() => removeFromCart(item.id)}>✕</button>
          </div>
        </div>
      {/each}
    </div>

    <div class="cart-summary">
      <div class="summary-row"><span>Количество котиков:</span><strong>{cartItems.length}</strong></div>
      <div class="summary-row"><span>Сумма заказа:</span><strong class="total-price">{total.toLocaleString()} ₽</strong></div>

      <div class="checkout-section">
        <button class="btn btn-checkout" on:click={checkout}>🐾 Оформить заказ</button>
        <p class="checkout-note">При оформлении заказа корзина будет очищена</p>
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

  .loading {
    text-align: center;
    padding: 3rem;
    color: #718096;
  }

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
    align-items: start;
  }

  .cart-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  }

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

  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .btn-primary {
    background: #667eea;
    color: white;
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
  }

  .btn-remove:hover {
    background: #f56565;
  }

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

  /* Toast уведомления */
  .toast {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 1000;
    animation: slideIn 0.4s ease;
    transition: opacity 0.3s ease;
  }

  .toast.success {
    background: #48bb78;
  }

  .toast.error {
    background: #f56565;
  }

  .toast.fade-out {
    opacity: 0;
  }

  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }

  @media (max-width: 768px) {
    .cart-item {
      grid-template-columns: 1fr;
      gap: 1rem;
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
