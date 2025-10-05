const request = require('supertest');
const express = require('express');
const path = require('path');
const cors = require('cors');

const authRouter = require('./routes_auth');
const productsRouter = require('./routes_products');
const { authRequired } = require('./auth_middleware');
const db = require('./data/db');

function makeFullApp() {
  const app = express();
  
  app.use(cors());
  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));
  
  app.use('/api/auth', authRouter);
  
  app.use('/api/products', productsRouter);
  
  app.get('/api/reports/stock/summary', (req, res) => {
    res.json(db.stockSummary());
  });
  
  return app;
}

describe('Integration Tests - Full App', () => {
  beforeEach(() => {
    db.clear();
    const users = require('./data/users');
    users.clear();
  });

  describe('Authentication Flow', () => {
    test('should complete full auth flow: register -> login -> access protected resource', async () => {
      const app = makeFullApp();
      
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'testpass' });
      
      expect(registerRes.status).toBe(201);
      expect(registerRes.body).toHaveProperty('id');
      
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'testpass' });
      
      expect(loginRes.status).toBe(200);
      expect(loginRes.body).toHaveProperty('token');
      
      const token = loginRes.body.token;
      
      const usersRes = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${token}`);
      
      expect(usersRes.status).toBe(200);
      expect(Array.isArray(usersRes.body)).toBe(true);
    });
  });

  describe('Products and Reports Integration', () => {
    test('should create products and generate accurate reports', async () => {
      const app = makeFullApp();
      
      const product1 = await request(app)
        .post('/api/products')
        .send({
          name: 'Laptop',
          sku: 'LAP-001',
          category: 'Electronics',
          price: 1000,
          stock: 2
        });
      
      const product2 = await request(app)
        .post('/api/products')
        .send({
          name: 'Mouse',
          sku: 'MOU-001',
          category: 'Accessories',
          price: 25,
          stock: 10
        });
      
      const product3 = await request(app)
        .post('/api/products')
        .send({
          name: 'Keyboard',
          sku: 'KEY-001',
          category: 'Accessories',
          price: 75,
          stock: 5
        });
      
      expect(product1.status).toBe(201);
      expect(product2.status).toBe(201);
      expect(product3.status).toBe(201);
      
      const productsRes = await request(app).get('/api/products');
      expect(productsRes.status).toBe(200);
      expect(productsRes.body).toHaveLength(3);
      
      const reportRes = await request(app).get('/api/reports/stock/summary');
      expect(reportRes.status).toBe(200);
      expect(reportRes.body.byCategory).toEqual({
        'Electronics': 2,
        'Accessories': 15
      });
      expect(reportRes.body.totalValue).toBe(2625);
    });

    test('should handle product lifecycle: create -> update -> delete -> verify report', async () => {
      const app = makeFullApp();
      
      const createRes = await request(app)
        .post('/api/products')
        .send({
          name: 'Test Product',
          sku: 'TEST-001',
          category: 'Test',
          price: 100,
          stock: 5
        });
      
      expect(createRes.status).toBe(201);
      const productId = createRes.body.id;
      
      let reportRes = await request(app).get('/api/reports/stock/summary');
      expect(reportRes.body.byCategory).toEqual({ 'Test': 5 });
      expect(reportRes.body.totalValue).toBe(500);
      
      const updateRes = await request(app)
        .put(`/api/products/${productId}`)
        .send({ price: 150, stock: 3 });
      
      expect(updateRes.status).toBe(200);
      
      reportRes = await request(app).get('/api/reports/stock/summary');
      expect(reportRes.body.byCategory).toEqual({ 'Test': 3 });
      expect(reportRes.body.totalValue).toBe(450);
      
      const deleteRes = await request(app).delete(`/api/products/${productId}`);
      expect(deleteRes.status).toBe(204);
      
      reportRes = await request(app).get('/api/reports/stock/summary');
      expect(reportRes.body.byCategory).toEqual({});
      expect(reportRes.body.totalValue).toBe(0);
    });
  });

  describe('Error Handling Integration', () => {
    test('should handle invalid endpoints gracefully', async () => {
      const app = makeFullApp();
      
      const res = await request(app).get('/api/nonexistent');
      expect(res.status).toBe(404);
      
      const res2 = await request(app).delete('/api/products');
      expect(res2.status).toBe(404);
    });

    test('should handle malformed JSON gracefully', async () => {
      const app = makeFullApp();
      
      const res = await request(app)
        .post('/api/products')
        .set('Content-Type', 'application/json')
        .send('{"name": "test", "sku": "T-001"');
      
      expect(res.status).toBe(400);
    });
  });

  describe('CORS and Static Files', () => {
    test('should serve static files', async () => {
      const app = makeFullApp();
      
      const res = await request(app).get('/index.html');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toMatch(/text\/html/);
    });

    test('should include CORS headers', async () => {
      const app = makeFullApp();
      
      const res = await request(app)
        .options('/api/products')
        .set('Origin', 'http://localhost:3000');
      
      expect(res.headers).toHaveProperty('access-control-allow-origin');
    });
  });
});
