const express = require('express');
const router  = express.Router();
const db      = require('../db');
const jwt     = require('jsonwebtoken');
const SECRET  = process.env.JWT_SECRET || 'petal-jwt-secret';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Login required' });
  try { req.user = jwt.verify(token, SECRET); next(); }
  catch { res.status(401).json({ error: 'Invalid token' }); }
}

// Place order
router.post('/place', authMiddleware, (req, res) => {
  const { address, items, total } = req.body;
  if (!items || !items.length) return res.status(400).json({ error: 'No items' });

  const order = db.prepare(
    'INSERT INTO orders (user_id, total, status, address) VALUES (?, ?, ?, ?)'
  ).run(req.user.id, total, 'confirmed', address);

  const insertItem = db.prepare(
    'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)'
  );
  items.forEach(item => insertItem.run(order.lastInsertRowid, item.productId, item.quantity, item.price));

  // Clear cart
  req.session.cart = [];

  res.json({ ok: true, orderId: order.lastInsertRowid });
});

// My orders
router.get('/mine', authMiddleware, (req, res) => {
  const orders = db.prepare(
    'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
  ).all(req.user.id);

  const enriched = orders.map(order => {
    const items = db.prepare(`
      SELECT oi.*, p.name, p.image FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order.id);
    return { ...order, items };
  });
  res.json(enriched);
});

module.exports = router;