
const express = require('express');
const router = express.Router();
const db = require('./data/db');

// Normaliza y convierte precios ingresados con formato local (e.g. "1.234,56")
function parsePrice(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return 0;
  const trimmed = value.trim();
  if (trimmed === '') return 0;
  // Si contiene coma, asumimos que la coma es separador decimal
  const hasComma = trimmed.includes(',');
  const normalized = hasComma
    ? trimmed.replace(/\./g, '').replace(',', '.')
    : trimmed;
  const num = Number(normalized);
  if (!Number.isFinite(num)) return 0;
  return num;
}

function parseStock(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return n;
}

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
  const priceNum = parsePrice(price);
  const stockNum = parseStock(stock);
  const created = db.create({ name, sku, category: category || 'General', price: priceNum, stock: stockNum });
  res.status(201).json(created);
});

router.put('/:id', (req, res) => {
  const id = Number(req.params.id);
  const payload = req.body || {};
  if ('price' in payload) payload.price = parsePrice(payload.price);
  if ('stock' in payload) payload.stock = parseStock(payload.stock);
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
