
const request = require('supertest');
const express = require('express');
const productsRouter = require('./routes_products');
const db = require('./data/db');

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/products', productsRouter);
  return app;
}

describe('Products API', () => {
  test('GET /api/products returns array', async () => {
    const app = makeApp();
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('POST -> creates item', async () => {
    const app = makeApp();
    const res = await request(app).post('/api/products').send({
      name: 'Test prod', sku: 'T-001', category: 'Test', price: 100, stock: 2
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    db.remove(res.body.id);
  });
});
