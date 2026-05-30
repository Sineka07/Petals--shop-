require('dotenv').config();
const express = require('express');
const path    = require('path');
const cors    = require('cors');
const session = require('express-session');

const app = express();

// ── Middleware ─────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(session({
  secret: process.env.SESSION_SECRET || 'petal-shop-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 }
}));

// ── Routes ─────────────────────────────────────────────────
app.use('/api/auth',     require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart',     require('./routes/cart'));
app.use('/api/orders',   require('./routes/orders'));

// ── Serve HTML pages ───────────────────────────────────────
const pub = path.join(__dirname, '../public');
app.get('/',            (_, res) => res.sendFile(pub + '/index.html'));
app.get('/shop',        (_, res) => res.sendFile(pub + '/shop.html'));
app.get('/product/:id', (_, res) => res.sendFile(pub + '/product.html'));
app.get('/cart',        (_, res) => res.sendFile(pub + '/cart.html'));
app.get('/checkout',    (_, res) => res.sendFile(pub + '/checkout.html'));
app.get('/orders',      (_, res) => res.sendFile(pub + '/orders.html'));
app.get('/auth',        (_, res) => res.sendFile(pub + '/auth.html'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`\n🌸 Petal Shop running at http://localhost:${PORT}\n`));
