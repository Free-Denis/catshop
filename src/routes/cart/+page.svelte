<!-- src/routes/cart/+page.svelte -->
<script>
  import { onMount, afterUpdate } from 'svelte';

  let currentUser = null;
  let cartItems = [];
  let total = 0;
  let loading = true;

  // === Те же функции отрисовки миниатюры (не менялись) ===
  function renderCatThumbnail(cat, containerId) {
    // ... ваш код отрисовки SVG (оставляем без изменений)
  }

  function getUserCart(username) {
    const data = localStorage.getItem(`cart_${username}`);
    return data ? JSON.parse(data) : [];
  }

  function saveUserCart(username, cart) {
    localStorage.setItem(`cart_${username}`, JSON.stringify(cart));
  }

  async function loadCart() {
    loading = true;
    if (currentUser) {
      cartItems = getUserCart(currentUser.username);
      total = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
    }
    loading = false;

    // Отрисовка миниатюр
    setTimeout(() => {
      cartItems.forEach((item, i) => renderCatThumbnail(item, `cat-thumb-${i}`));
    }, 100);
  }

  function removeFromCart(catId) {
    cartItems = cartItems.filter(item => item.id !== catId);
    total = cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
    saveUserCart(currentUser.username, cartItems);
  }

  function checkout() {
    if (cartItems.length === 0) {
      alert('Корзина пуста');
      return;
    }
    if (confirm('Оформить заказ? После этого корзина очистится.')) {
      // Просто очищаем корзину (имитация заказа)
      cartItems = [];
      total = 0;
      saveUserCart(currentUser.username, []);
      alert('Заказ успешно оформлен! Корзина очищена.');
    }
  }

  function getBreedName(breedId) {
    const breeds = {
      british: 'Британская',
      siamese: 'Сиамская',
      mainecoon: 'Мейн-кун'
    };
    return breeds[breedId] || 'Неизвестно';
  }

  onMount(() => {
    const saved = localStorage.getItem('current_user');
    if (saved) {
      currentUser = JSON.parse(saved);
      loadCart();
    } else {
      loading = false;
    }
  });

  afterUpdate(() => {
    if (cartItems.length > 0) {
      cartItems.forEach((item, i) => renderCatThumbnail(item, `cat-thumb-${i}`));
    }
  });
</script>

<!-- HTML и стили остаются почти без изменений -->
<!-- Только убрали обращения к API -->

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
      <p>Соберите своего котика в конструкторе!</p>
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
              <div class="detail"><span class="label">Цвет глаз:</span><span class="value">{item.eyes || '—'}</span><div class="color-preview" style="background-color: {item.eyeColor}"></div></div>
              <div class="detail"><span class="label">Цвет шерсти:</span><div class="color-preview" style="background-color: {item.furColor}"></div></div>
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
        <p class="checkout-note">После оформления корзина будет очищена (данные хранятся только в браузере)</p>
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
