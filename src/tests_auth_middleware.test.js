const request = require('supertest');
const express = require('express');
const { authRequired } = require('./auth_middleware');
const jwt = require('jsonwebtoken');

function makeApp() {
  const app = express();
  app.use(express.json());
  
  app.get('/protected', authRequired, (req, res) => {
    res.json({ message: 'Access granted', user: req.user });
  });
  
  return app;
}

describe('Auth Middleware', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-CHANGE-ME';

  describe('authRequired middleware', () => {
    test('should allow access with valid token', async () => {
      const app = makeApp();
      const token = jwt.sign({ sub: 1, username: 'testuser' }, JWT_SECRET, { expiresIn: '1h' });
      
      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('message', 'Access granted');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('sub', 1);
      expect(res.body.user).toHaveProperty('username', 'testuser');
    });

    test('should reject request without Authorization header', async () => {
      const app = makeApp();
      
      const res = await request(app).get('/protected');
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Token requerido');
    });

    test('should reject request with empty Authorization header', async () => {
      const app = makeApp();
      
      const res = await request(app)
        .get('/protected')
        .set('Authorization', '');
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Token requerido');
    });

    test('should reject request without Bearer prefix', async () => {
      const app = makeApp();
      const token = jwt.sign({ sub: 1, username: 'testuser' }, JWT_SECRET, { expiresIn: '1h' });
      
      const res = await request(app)
        .get('/protected')
        .set('Authorization', token);
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Token requerido');
    });

    test('should reject request with invalid token format', async () => {
      const app = makeApp();
      
      const res = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer invalid-token-format');
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Token inválido o expirado');
    });

    test('should reject request with expired token', async () => {
      const app = makeApp();
      const token = jwt.sign({ sub: 1, username: 'testuser' }, JWT_SECRET, { expiresIn: '-1h' });
      
      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Token inválido o expirado');
    });

    test('should reject request with token signed with wrong secret', async () => {
      const app = makeApp();
      const token = jwt.sign({ sub: 1, username: 'testuser' }, 'wrong-secret', { expiresIn: '1h' });
      
      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Token inválido o expirado');
    });

    test('should handle malformed JWT token', async () => {
      const app = makeApp();
      
      const res = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer not.a.valid.jwt');
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Token inválido o expirado');
    });

    test('should handle empty token after Bearer', async () => {
      const app = makeApp();
      
      const res = await request(app)
        .get('/protected')
        .set('Authorization', 'Bearer ');
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Token requerido');
    });

    test('should preserve user data in request object', async () => {
      const app = makeApp();
      const userData = { sub: 123, username: 'testuser', role: 'admin' };
      const token = jwt.sign(userData, JWT_SECRET, { expiresIn: '1h' });
      
      const res = await request(app)
        .get('/protected')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject(userData);
    });
  });
});
