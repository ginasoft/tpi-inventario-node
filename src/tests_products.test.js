
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
  beforeEach(() => {
    // Limpiar base de datos antes de cada test
    db.clear();
  });

  describe('GET /api/products', () => {
    test('should return array of products', async () => {
      const app = makeApp();
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    test('should return empty array when no products exist', async () => {
      const app = makeApp();
      const res = await request(app).get('/api/products');
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('GET /api/products/:id', () => {
    test('should return product by id', async () => {
      const app = makeApp();
      // Crear producto primero
      const createRes = await request(app).post('/api/products').send({
        name: 'Test Product', sku: 'T-001', category: 'Test', price: 100, stock: 5
      });
      const productId = createRes.body.id;

      const res = await request(app).get(`/api/products/${productId}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', productId);
      expect(res.body).toHaveProperty('name', 'Test Product');
    });

    test('should return 404 for non-existent product', async () => {
      const app = makeApp();
      const res = await request(app).get('/api/products/999');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not found');
    });

    test('should return 404 for invalid id', async () => {
      const app = makeApp();
      const res = await request(app).get('/api/products/invalid');
      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not found');
    });
  });

  describe('POST /api/products', () => {
    test('should create product with all fields', async () => {
      const app = makeApp();
      const productData = {
        name: 'Test Product',
        sku: 'T-001',
        category: 'Test Category',
        price: 150.50,
        stock: 10
      };

      const res = await request(app)
        .post('/api/products')
        .send(productData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', productData.name);
      expect(res.body).toHaveProperty('sku', productData.sku);
      expect(res.body).toHaveProperty('category', productData.category);
      expect(res.body).toHaveProperty('price', productData.price);
      expect(res.body).toHaveProperty('stock', productData.stock);
    });

    test('should create product with minimal required fields', async () => {
      const app = makeApp();
      const productData = {
        name: 'Minimal Product',
        sku: 'M-001'
      };

      const res = await request(app)
        .post('/api/products')
        .send(productData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('name', productData.name);
      expect(res.body).toHaveProperty('sku', productData.sku);
      expect(res.body).toHaveProperty('category', 'General');
      expect(res.body).toHaveProperty('price', 0);
      expect(res.body).toHaveProperty('stock', 0);
    });

    test('should return 400 when name is missing', async () => {
      const app = makeApp();
      const res = await request(app)
        .post('/api/products')
        .send({ sku: 'T-001' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'name and sku are required');
    });

    test('should return 400 when sku is missing', async () => {
      const app = makeApp();
      const res = await request(app)
        .post('/api/products')
        .send({ name: 'Test Product' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'name and sku are required');
    });

    test('should handle numeric conversion for price and stock', async () => {
      const app = makeApp();
      const productData = {
        name: 'Test Product',
        sku: 'T-001',
        price: '99.99',
        stock: '5'
      };

      const res = await request(app)
        .post('/api/products')
        .send(productData);

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('price', 99.99);
      expect(res.body).toHaveProperty('stock', 5);
    });
  });

  describe('PUT /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const app = makeApp();
      const createRes = await request(app).post('/api/products').send({
        name: 'Original Product',
        sku: 'O-001',
        category: 'Original',
        price: 100,
        stock: 5
      });
      productId = createRes.body.id;
    });

    test('should update product with partial data', async () => {
      const app = makeApp();
      const updateData = { name: 'Updated Product', price: 150 };

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', productId);
      expect(res.body).toHaveProperty('name', 'Updated Product');
      expect(res.body).toHaveProperty('price', 150);
      expect(res.body).toHaveProperty('sku', 'O-001'); // No cambió
    });

    test('should update all fields', async () => {
      const app = makeApp();
      const updateData = {
        name: 'Fully Updated',
        sku: 'FU-001',
        category: 'Updated Category',
        price: 200,
        stock: 10
      };

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id', productId);
      expect(res.body).toHaveProperty('name', updateData.name);
      expect(res.body).toHaveProperty('sku', updateData.sku);
      expect(res.body).toHaveProperty('category', updateData.category);
      expect(res.body).toHaveProperty('price', updateData.price);
      expect(res.body).toHaveProperty('stock', updateData.stock);
    });

    test('should return 404 for non-existent product', async () => {
      const app = makeApp();
      const res = await request(app)
        .put('/api/products/999')
        .send({ name: 'Updated' });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not found');
    });

    test('should handle numeric conversion for price and stock', async () => {
      const app = makeApp();
      const updateData = { price: '199.99', stock: '15' };

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .send(updateData);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('price', 199.99);
      expect(res.body).toHaveProperty('stock', 15);
    });
  });

  describe('DELETE /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const app = makeApp();
      const createRes = await request(app).post('/api/products').send({
        name: 'To Delete',
        sku: 'TD-001',
        category: 'Test',
        price: 50,
        stock: 3
      });
      productId = createRes.body.id;
    });

    test('should delete product successfully', async () => {
      const app = makeApp();
      const res = await request(app).delete(`/api/products/${productId}`);

      expect(res.status).toBe(204);
      expect(res.body).toEqual({});
    });

    test('should return 404 for non-existent product', async () => {
      const app = makeApp();
      const res = await request(app).delete('/api/products/999');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not found');
    });

    test('should return 404 for invalid id', async () => {
      const app = makeApp();
      const res = await request(app).delete('/api/products/invalid');

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty('error', 'Not found');
    });
  });
});
