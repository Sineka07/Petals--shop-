const express = require('express');
const router  = express.Router();
const db      = require('../db');

// Get cart
router.get('/', (req, res) => {
  const cart = req.session.cart || [];
  // Enrich with product info
  const enriched = cart.map(item => {
    const p = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
    return p ? { ...item, product: p } : null;
  }).filter(Boolean);
  res.json(enriched);
});

// Add to cart
router.post('/add', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!req.session.cart) req.session.cart = [];
  const existing = req.session.cart.find(i => i.productId === productId);
  if (existing) existing.quantity += quantity;
  else req.session.cart.push({ productId, quantity });
  res.json({ ok: true, cart: req.session.cart });
});

// Update quantity
router.put('/update', (req, res) => {
  const { productId, quantity } = req.body;
  if (!req.session.cart) return res.json({ ok: true });
  if (quantity <= 0) {
    req.session.cart = req.session.cart.filter(i => i.productId !== productId);
  } else {
    const item = req.session.cart.find(i => i.productId === productId);
    if (item) item.quantity = quantity;
  }
  res.json({ ok: true, cart: req.session.cart });
});

// Remove item
router.delete('/remove/:productId', (req, res) => {
  const id = parseInt(req.params.productId);
  if (req.session.cart) req.session.cart = req.session.cart.filter(i => i.productId !== id);
  res.json({ ok: true });
});

// Clear cart
router.delete('/clear', (req, res) => {
  req.session.cart = [];
  res.json({ ok: true });
});

module.exports = router;
