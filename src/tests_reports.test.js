const request = require('supertest');
const express = require('express');
const db = require('./data/db');

function makeApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/reports/stock/summary', (req, res) => {
    res.json(db.stockSummary());
  });

  return app;
}

describe('Reports API', () => {
  beforeEach(() => {
    db.clear();
  });

  describe('GET /api/reports/stock/summary', () => {
    test('debe devolver resumen vacío cuando no hay productos', async () => {
      const app = makeApp();
      const res = await request(app).get('/api/reports/stock/summary');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('byCategory');
      expect(res.body).toHaveProperty('totalValue');
      expect(res.body.byCategory).toEqual({});
      expect(res.body.totalValue).toBe(0);
    });

    test('debe devolver resumen con un producto', async () => {
      const app = makeApp();

      db.create({
        name: 'Producto de Prueba',
        sku: 'T-001',
        category: 'Computo',
        price: 100,
        stock: 5
      });

      const res = await request(app).get('/api/reports/stock/summary');

      expect(res.status).toBe(200);
      expect(res.body.byCategory).toEqual({ 'Computo': 5 });
      expect(res.body.totalValue).toBe(500);
    });

    test('debe sumar productos en la misma categoría', async () => {
      const app = makeApp();

      db.create({
        name: 'Producto 1',
        sku: 'P-001',
        category: 'Accesorios',
        price: 100,
        stock: 3
      });

      db.create({
        name: 'Producto 2',
        sku: 'P-002',
        category: 'Accesorios',
        price: 200,
        stock: 2
      });

      const res = await request(app).get('/api/reports/stock/summary');

      expect(res.status).toBe(200);
      expect(res.body.byCategory).toEqual({ 'Accesorios': 5 });
      expect(res.body.totalValue).toBe(700);
    });

    test('debe manejar múltiples categorías', async () => {
      const app = makeApp();

      db.create({
        name: 'Notebook 14"',
        sku: 'NB-14-001',
        category: 'Computo',
        price: 1000,
        stock: 2
      });

      db.create({
        name: 'Mouse Inalámbrico',
        sku: 'MS-WL-010',
        category: 'Accesorios',
        price: 25,
        stock: 10
      });

      db.create({
        name: 'Teclado Mecánico',
        sku: 'KB-MECH-77',
        category: 'Accesorios',
        price: 75,
        stock: 5
      });

      const res = await request(app).get('/api/reports/stock/summary');

      expect(res.status).toBe(200);
      expect(res.body.byCategory).toEqual({
        'Computo': 2,
        'Accesorios': 15
      });
      expect(res.body.totalValue).toBe(2625); 
    });

    test('debe ignorar productos con stock cero', async () => {
      const app = makeApp();

      db.create({
        name: 'Sin Stock',
        sku: 'SS-001',
        category: 'Computo',
        price: 100,
        stock: 0
      });

      db.create({
        name: 'Con Stock',
        sku: 'CS-001',
        category: 'Computo',
        price: 200,
        stock: 3
      });

      const res = await request(app).get('/api/reports/stock/summary');

      expect(res.status).toBe(200);
      expect(res.body.byCategory).toEqual({ 'Computo': 3 });
      expect(res.body.totalValue).toBe(600);
    });

    test('debe manejar productos con precio cero', async () => {
      const app = makeApp();

      db.create({
        name: 'Gratis',
        sku: 'GR-001',
        category: 'Promos',
        price: 0,
        stock: 5
      });

      db.create({
        name: 'Con Costo',
        sku: 'CC-001',
        category: 'Promos',
        price: 50,
        stock: 2
      });

      const res = await request(app).get('/api/reports/stock/summary');

      expect(res.status).toBe(200);
      expect(res.body.byCategory).toEqual({ 'Promos': 7 });
      expect(res.body.totalValue).toBe(100); 
    });

    test('debe manejar correctamente precios decimales', async () => {
      const app = makeApp();
    
      db.create({
        name: 'Cable USB-C',
        sku: 'C-001',
        category: 'Accesorios',
        price: 9.99,
        stock: 3
      });
    
      db.create({
        name: 'Auriculares Bluetooth',
        sku: 'E-001',
        category: 'Accesorios',
        price: 199.99,
        stock: 1
      });
    
      const res = await request(app).get('/api/reports/stock/summary');
    
      expect(res.status).toBe(200);
      expect(res.body.byCategory).toEqual({ 'Accesorios': 4 }); 
      expect(res.body.totalValue).toBeCloseTo(229.96, 2);
    });
    
  });
});
