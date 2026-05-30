const express = require('express');
const router  = express.Router();
const db      = require('../db');

// All products (with optional category filter & search)
router.get('/', (req, res) => {
  const { category, search, sort } = req.query;
  let sql    = 'SELECT * FROM products WHERE 1=1';
  const params = [];
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (search)   { sql += ' AND (name LIKE ? OR description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  if (sort === 'price_asc')  sql += ' ORDER BY price ASC';
  else if (sort === 'price_desc') sql += ' ORDER BY price DESC';
  else sql += ' ORDER BY id ASC';
  res.json(db.prepare(sql).all(...params));
});

// Single product
router.get('/:id', (req, res) => {
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!p) return res.status(404).json({ error: 'Not found' });
  res.json(p);
});

// Categories list
router.get('/meta/categories', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM products').all();
  res.json(rows.map(r => r.category));
});

module.exports = router;