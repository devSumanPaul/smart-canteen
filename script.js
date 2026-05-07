/* =====================
   SMART CANTEEN — JS
===================== */

// ─── CART STATE ───────────────────────────
let cart = {};

// ─── THEME TOGGLE ─────────────────────────
const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');

// Load saved theme
const savedTheme = localStorage.getItem('sc-theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

themeToggle.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('sc-theme', next);

  // Ripple effect on toggle
  themeToggle.style.transform = 'scale(0.9)';
  setTimeout(() => { themeToggle.style.transform = ''; }, 200);
});

// ─── FILTER TABS ──────────────────────────
const filterTabs = document.querySelectorAll('.filter-tab');
const menuCards = document.querySelectorAll('.menu-card');
const emptyState = document.getElementById('emptyState');

let activeFilter = 'all';
let searchTerm = '';

filterTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    filterTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeFilter = tab.dataset.filter;
    applyFilters();

    // Bounce animation
    tab.animate([
      { transform: 'scale(0.92)' },
      { transform: 'scale(1.05)' },
      { transform: 'scale(1)' }
    ], { duration: 300, easing: 'ease' });
  });
});

// ─── SEARCH ───────────────────────────────
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');

searchInput.addEventListener('input', () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  clearSearch.classList.toggle('visible', searchTerm.length > 0);
  applyFilters();
});

clearSearch.addEventListener('click', () => {
  searchInput.value = '';
  searchTerm = '';
  clearSearch.classList.remove('visible');
  applyFilters();
  searchInput.focus();
});

// ─── FILTER LOGIC ─────────────────────────
function applyFilters() {
  let visibleCount = 0;

  menuCards.forEach((card, i) => {
    const category = card.dataset.category;
    const name = card.dataset.name.toLowerCase();

    const matchFilter = activeFilter === 'all' || category === activeFilter;
    const matchSearch = name.includes(searchTerm);

    if (matchFilter && matchSearch) {
      card.classList.remove('hidden');
      // Staggered re-entrance
      card.style.animationDelay = `${visibleCount * 0.05}s`;
      card.style.animation = 'none';
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          card.style.animation = '';
        });
      });
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });

  emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
}

// ─── CART FUNCTIONS ───────────────────────
function addToCart(btn, name, price) {
  // Bounce animation on button
  btn.animate([
    { transform: 'scale(0.85)' },
    { transform: 'scale(1.2)' },
    { transform: 'scale(1)' }
  ], { duration: 350, easing: 'ease' });

  if (cart[name]) {
    cart[name].qty++;
  } else {
    cart[name] = { price, qty: 1 };
  }

  updateCartUI();
  showToast(`🛒 ${name} added!`);
}

function updateCartUI() {
  const cartCountEl = document.getElementById('cartCount');
  const cartItemsEl = document.getElementById('cartItems');
  const cartFooter = document.getElementById('cartFooter');
  const cartTotal = document.getElementById('cartTotal');

  const totalItems = Object.values(cart).reduce((s, i) => s + i.qty, 0);
  const totalPrice = Object.entries(cart).reduce((s, [, v]) => s + v.price * v.qty, 0);

  // Count badge
  cartCountEl.textContent = totalItems;
  cartCountEl.classList.toggle('visible', totalItems > 0);

  // Bounce cart icon
  const cartBtn = document.getElementById('cartBtn');
  cartBtn.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.3) rotate(-10deg)' },
    { transform: 'scale(1) rotate(0deg)' }
  ], { duration: 400, easing: 'ease' });

  // Cart items list
  if (totalItems === 0) {
    cartItemsEl.innerHTML = `
      <div class="cart-empty-state">
        <span>🛒</span>
        <p>Your cart is empty</p>
      </div>`;
    cartFooter.style.display = 'none';
    return;
  }

  cartFooter.style.display = 'block';
  cartTotal.textContent = `₹${totalPrice}`;

  cartItemsEl.innerHTML = '';
  Object.entries(cart).forEach(([name, { price, qty }]) => {
    const item = document.createElement('div');
    item.className = 'cart-item';
    item.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-name">${name}</div>
        <div class="cart-item-price">₹${price} × ${qty} = ₹${price * qty}</div>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn" onclick="changeQty('${name}', -1)">−</button>
        <span class="qty-count">${qty}</span>
        <button class="qty-btn" onclick="changeQty('${name}', 1)">+</button>
      </div>`;
    cartItemsEl.appendChild(item);
  });
}

function changeQty(name, delta) {
  if (!cart[name]) return;
  cart[name].qty += delta;
  if (cart[name].qty <= 0) delete cart[name];
  updateCartUI();
}

// ─── CART SIDEBAR OPEN / CLOSE ───────────
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCart');

cartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

function openCart() {
  cartSidebar.classList.add('open');
  cartOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  cartSidebar.classList.remove('open');
  cartOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeCart();
});

// ─── CHECKOUT ─────────────────────────────
function checkout() {
  const total = Object.entries(cart).reduce((s, [, v]) => s + v.price * v.qty, 0);
  if (total === 0) return;

  // Celebration animation
  const btn = document.querySelector('.checkout-btn');
  btn.textContent = '✅ Order Placed!';
  btn.style.background = '#2ecc71';
  btn.style.pointerEvents = 'none';

  confettiBurst();
  showToast(`🎉 Order of ₹${total} placed successfully!`);

  setTimeout(() => {
    cart = {};
    updateCartUI();
    closeCart();
    btn.textContent = 'Place Order 🚀';
    btn.style.background = '';
    btn.style.pointerEvents = '';
  }, 2000);
}

// ─── TOAST ────────────────────────────────
let toastTimer;
const toastEl = document.getElementById('toast');

function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2500);
}

// ─── CONFETTI ─────────────────────────────
function confettiBurst() {
  const colors = ['#ff6b00', '#ffd600', '#2ecc71', '#00c3ff', '#ff4757'];
  for (let i = 0; i < 60; i++) {
    const dot = document.createElement('div');
    const size = Math.random() * 10 + 5;
    dot.style.cssText = `
      position: fixed;
      left: ${Math.random() * 100}vw;
      top: 60%;
      width: ${size}px;
      height: ${size}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '3px'};
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      z-index: 9999;
      pointer-events: none;
    `;
    document.body.appendChild(dot);
    dot.animate([
      { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
      { transform: `translateY(-${Math.random() * 400 + 200}px) translateX(${(Math.random() - 0.5) * 300}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
    ], {
      duration: Math.random() * 1000 + 800,
      easing: 'ease-out',
      fill: 'forwards'
    }).onfinish = () => dot.remove();
  }
}

// ─── CARD HOVER TILT (subtle 3D) ──────────
menuCards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    card.style.transform = `translateY(-8px) scale(1.01) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'all 0.4s cubic-bezier(0.23, 1, 0.32, 1)';
  });

  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.1s ease, box-shadow 0.4s, border-color 0.4s';
  });
});

// ─── INIT ──────────────────────────────────
updateCartUI();
