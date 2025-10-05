const request = require('supertest');
const express = require('express');
const db = require('./data/db');

function makeApp() {
  const app = express();
  app.use(express.json());
  
  // Simular el endpoint de reportes como está en server.js
  app.get('/api/reports/stock/summary', (req, res) => {
    res.json(db.stockSummary());
  });
  
  return app;
}

describe('Reports API', () => {
  beforeEach(() => {
    // Limpiar base de datos antes de cada test
    db.clear();
  });

  describe('GET /api/reports/stock/summary', () => {
    test('should return empty summary when no products exist', async () => {
      const app = makeApp();
      const res = await request(app).get('/api/reports/stock/summary');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('byCategory');
      expect(res.body).toHaveProperty('totalValue');
      expect(res.body.byCategory).toEqual({});
      expect(res.body.totalValue).toBe(0);
    });

    test('should return summary with single product', async () => {
      const app = makeApp();
      
      // Crear un producto
      const product = db.create({
        name: 'Test Product',
        sku: 'T-001',
        category: 'Electronics',
        price: 100,
        stock: 5
      });

      const res = await request(app).get('/api/reports/stock/summary');
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('byCategory');
      expect(res.body).toHaveProperty('totalValue');
      expect(res.body.byCategory).toEqual({ 'Electronics': 5 });
      expect(res.body.totalValue).toBe(500); // 5 * 100
    });

    test('should return summary with multiple products in same category', async () => {
      const app = makeApp();
      
      // Crear productos en la misma categoría
      db.create({
        name: 'Product 1',
        sku: 'P-001',
        category: 'Electronics',
        price: 100,
        stock: 3
      });
      
      db.create({
        name: 'Product 2',
        sku: 'P-002',
        category: 'Electronics',
        price: 200,
        stock: 2
      });

      const res = await request(app).get('/api/reports/stock/summary');
      
      expect(res.status).toBe(200);
      expect(res.body.byCategory).toEqual({ 'Electronics': 5 }); // 3 + 2
      expect(res.body.totalValue).toBe(700); // (3*100) + (2*200)
    });

    test('should return summary with multiple categories', async () => {
      const app = makeApp();
      
      // Crear productos en diferentes categorías
      db.create({
        name: 'Laptop',
        sku: 'L-001',
        category: 'Electronics',
        price: 1000,
        stock: 2
      });
      
      db.create({
        name: 'Mouse',
        sku: 'M-001',
        category: 'Accessories',
        price: 25,
        stock: 10
      });
      
      db.create({
        name: 'Keyboard',
        sku: 'K-001',
        category: 'Accessories',
        price: 75,
        stock: 5
      });

      const res = await request(app).get('/api/reports/stock/summary');
      
      expect(res.status).toBe(200);
      expect(res.body.byCategory).toEqual({
        'Electronics': 2,
        'Accessories': 15
      });
      expect(res.body.totalValue).toBe(2625); // (2*1000) + (10*25) + (5*75) = 2000 + 250 + 375
    });

    test('should handle products with zero stock', async () => {
      const app = makeApp();
      
      // Crear productos con stock cero
      db.create({
        name: 'Out of Stock',
        sku: 'OOS-001',
        category: 'Electronics',
        price: 100,
        stock: 0
      });
      
      db.create({
        name: 'Available',
        sku: 'AV-001',
        category: 'Electronics',
        price: 200,
        stock: 3
      });

      const res = await request(app).get('/api/reports/stock/summary');
      
      expect(res.status).toBe(200);
      expect(res.body.byCategory).toEqual({ 'Electronics': 3 }); // Solo cuenta stock > 0
      expect(res.body.totalValue).toBe(600); // Solo 3 * 200
    });

    test('should handle products with zero price', async () => {
      const app = makeApp();
      
      // Crear productos con precio cero
      db.create({
        name: 'Free Product',
        sku: 'FREE-001',
        category: 'Freebies',
        price: 0,
        stock: 5
      });
      
      db.create({
        name: 'Paid Product',
        sku: 'PAID-001',
        category: 'Freebies',
        price: 50,
        stock: 2
      });

      const res = await request(app).get('/api/reports/stock/summary');
      
      expect(res.status).toBe(200);
      expect(res.body.byCategory).toEqual({ 'Freebies': 7 }); // 5 + 2
      expect(res.body.totalValue).toBe(100); // Solo 2 * 50
    });

    test('should handle decimal prices correctly', async () => {
      const app = makeApp();
      
      // Crear productos con precios decimales
      db.create({
        name: 'Cheap Item',
        sku: 'C-001',
        category: 'Misc',
        price: 9.99,
        stock: 3
      });
      
      db.create({
        name: 'Expensive Item',
        sku: 'E-001',
        category: 'Misc',
        price: 199.99,
        stock: 1
      });

      const res = await request(app).get('/api/reports/stock/summary');
      
      expect(res.status).toBe(200);
      expect(res.body.byCategory).toEqual({ 'Misc': 4 }); // 3 + 1
      expect(res.body.totalValue).toBeCloseTo(229.97, 1); // (3*9.99) + (1*199.99) - usando toBeCloseTo para manejar precisión decimal
    });
  });
});
