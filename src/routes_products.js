
const express = require('express');
const router = express.Router();
const db = require('./data/db');

router.get('/', (req, res) => {
  res.json(db.getAll());
});

router.get('/:id', (req, res) => {
  const item = db.getById(Number(req.params.id));
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

router.post('/', (req, res) => {
  const { name, sku, category, price, stock } = req.body || {};
  if (!name || !sku) return res.status(400).json({ error: 'name and sku are required' });
  const priceNum = Number(price) || 0;
  const stockNum = Number(stock) || 0;
  const created = db.create({ name, sku, category: category || 'General', price: priceNum, stock: stockNum });
  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const payload = req.body || {};
  if ('price' in payload) payload.price = Number(payload.price);
  if ('stock' in payload) payload.stock = Number(payload.stock);
  const updated = db.update(id, payload);
  if (!updated) return res.status(404).json({ error: 'Not found' });
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const ok = db.remove(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: 'Not found' });
  res.status(204).send();
});

router.get('/../reports/stock/summary', (req, res) => {
  res.status(404).end();
});

module.exports = router;
