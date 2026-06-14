// ═══════════════════════════════════════════════════════════
//  PETAL SHOP — Shared App JS
//  Theme System | Cart | Auth | Particles | Toast
// ═══════════════════════════════════════════════════════════

// ── Theme System ───────────────────────────────────────────
const THEMES  = ['cherry', 'rainy', 'sunny'];
const THEME_LABELS = { cherry: '🌸', rainy: '🌧️', sunny: '☀️' };
const THEME_PARTICLES = {
  cherry: ['🌸','🌺','🌷','✿','🌿','🪻','🌻'],
  rainy:  ['💧','🌧','💦','·','⚡','🌈'],
  sunny:  ['☀️','✨','🌟','💛']
};
let currentThemeIdx = parseInt(localStorage.getItem('themeIdx') || '0');

function applyTheme(idx, save = true) {
  currentThemeIdx = ((idx % 3) + 3) % 3;
  const theme = THEMES[currentThemeIdx];
  document.documentElement.setAttribute('data-theme', theme);
  if (save) localStorage.setItem('themeIdx', currentThemeIdx);
  document.querySelectorAll('.theme-btn').forEach((b, i) => {
    b.classList.toggle('active', i === currentThemeIdx);
  });
  spawnParticles(theme);
}

function nextTheme() { applyTheme(currentThemeIdx + 1); }

// Auto-cycle every 30 seconds
let themeCycle;
function startThemeCycle() {
  clearInterval(themeCycle);
  themeCycle = setInterval(() => applyTheme(currentThemeIdx + 1), 30000);
}

// ── Particles ──────────────────────────────────────────────
function spawnParticles(theme) {
  const container = document.getElementById('particles');
  if (!container) return;
  container.innerHTML = '';
  const symbols = THEME_PARTICLES[theme];
  const count   = theme === 'rainy' ? 25 : 15;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    p.textContent = sym;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${Math.random() * 12 + 8}px;
      animation-duration: ${Math.random() * 8 + 5}s;
      animation-delay: ${Math.random() * 10}s;
      opacity: ${Math.random() * 0.4 + 0.2};
    `;
    container.appendChild(p);
  }
}

// ── Toast ──────────────────────────────────────────────────
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Auth ───────────────────────────────────────────────────
const Auth = {
  getToken: ()  => localStorage.getItem('ps_token'),
  getUser:  ()  => JSON.parse(localStorage.getItem('ps_user') || 'null'),
  setAuth:  (token, user) => {
    localStorage.setItem('ps_token', token);
    localStorage.setItem('ps_user', JSON.stringify(user));
  },
  clear:    () => { localStorage.removeItem('ps_token'); localStorage.removeItem('ps_user'); },
  isLoggedIn: () => !!localStorage.getItem('ps_token'),
  headers:  () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('ps_token')}`
  })
};

// ── Cart (local mirror + server sync) ─────────────────────
const Cart = {
  async get() {
    const res = await fetch('/api/cart');
    return res.json();
  },
  async add(productId, quantity = 1) {
    await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    });
    Cart.updateBadge();
    showToast('Added to cart! 🛒');
  },
  async update(productId, quantity) {
    await fetch('/api/cart/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    });
    Cart.updateBadge();
  },
  async remove(productId) {
    await fetch(`/api/cart/remove/${productId}`, { method: 'DELETE' });
    Cart.updateBadge();
  },
  async clear() {
    await fetch('/api/cart/clear', { method: 'DELETE' });
    Cart.updateBadge();
  },
  async updateBadge() {
    try {
      const items = await Cart.get();
      const total = items.reduce((s, i) => s + i.quantity, 0);
      document.querySelectorAll('.cart-count').forEach(el => {
        el.textContent = total;
        el.classList.toggle('show', total > 0);
      });
    } catch {}
  }
};

// ── Navbar render ──────────────────────────────────────────
function renderNavbar() {
  const user = Auth.getUser();
  const nav  = document.getElementById('navbar');
  if (!nav) return;
  nav.innerHTML = `
    <a href="/" class="nav-logo">🌸 Petal Shop</a>
    <div class="nav-links">
      <a href="/shop">Shop</a>
      ${user
        ? `<a href="/orders">Orders</a>
           <span style="color:var(--text2);font-size:13px">Hi, ${user.name.split(' ')[0]}</span>
           <a href="#" onclick="logout()" style="color:var(--text3)">Logout</a>`
        : `<a href="/auth">Login</a>`}
      <a href="/cart" class="cart-icon">🛒<span class="cart-count" id="cart-badge"></span></a>
      <div class="theme-switcher">
        <button class="theme-btn" onclick="setTheme(0)" title="Cherry Blossom">🌸</button>
        <button class="theme-btn" onclick="setTheme(1)" title="Rainy">🌧️</button>
        <button class="theme-btn" onclick="setTheme(2)" title="Sunny">☀️</button>
      </div>
    </div>
  `;
  Cart.updateBadge();
  // Highlight active link
  const path = window.location.pathname;
  nav.querySelectorAll('a').forEach(a => {
    if (a.getAttribute('href') === path) a.classList.add('active');
  });
}

function setTheme(idx) {
  applyTheme(idx);
  startThemeCycle();
}

async function logout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  Auth.clear();
  window.location.href = '/';
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(currentThemeIdx, false);
  startThemeCycle();
  renderNavbar();
});