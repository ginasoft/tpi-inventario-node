const request = require('supertest');
const express = require('express');
const authRouter = require('./routes_auth');
const users = require('./data/users');

function makeApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/auth', authRouter);
  return app;
}

describe('Auth API', () => {
  beforeEach(() => {
    // Limpiar usuarios antes de cada test
    users.clear();
  });

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const app = makeApp();
      const userData = { username: 'testuser', password: 'testpass' };
      
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('username', 'testuser');
      // Nota: El endpoint actual devuelve la password, esto debería cambiarse en producción
    });

    test('should return 400 when username is missing', async () => {
      const app = makeApp();
      const res = await request(app)
        .post('/api/auth/register')
        .send({ password: 'testpass' });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'username y password son requeridos');
    });

    test('should return 400 when password is missing', async () => {
      const app = makeApp();
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser' });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'username y password son requeridos');
    });

    test('should return 409 when user already exists', async () => {
      const app = makeApp();
      const userData = { username: 'testuser', password: 'testpass' };
      
      // Crear usuario primero
      await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      // Intentar crear el mismo usuario
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData);
      
      expect(res.status).toBe(409);
      expect(res.body).toHaveProperty('error', 'Usuario ya existe');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Crear usuario de prueba
      const app = makeApp();
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'testpass' });
    });

    test('should login successfully with valid credentials', async () => {
      const app = makeApp();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'testpass' });
      
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(typeof res.body.token).toBe('string');
    });

    test('should return 400 when username is missing', async () => {
      const app = makeApp();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: 'testpass' });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'username y password son requeridos');
    });

    test('should return 400 when password is missing', async () => {
      const app = makeApp();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser' });
      
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'username y password son requeridos');
    });

    test('should return 401 with invalid username', async () => {
      const app = makeApp();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'nonexistent', password: 'testpass' });
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
    });

    test('should return 401 with invalid password', async () => {
      const app = makeApp();
      const res = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'wrongpass' });
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error', 'Credenciales inválidas');
    });
  });

  describe('GET /api/auth/users', () => {
    let authToken;

    beforeEach(async () => {
      // Crear usuario y obtener token
      const app = makeApp();
      await request(app)
        .post('/api/auth/register')
        .send({ username: 'testuser', password: 'testpass' });
      
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ username: 'testuser', password: 'testpass' });
      
      authToken = loginRes.body.token;
    });

    test('should return users list with valid token', async () => {
      const app = makeApp();
      const res = await request(app)
        .get('/api/auth/users')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
    });

    test('should return 401 without token', async () => {
      const app = makeApp();
      const res = await request(app)
        .get('/api/auth/users');
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    test('should return 401 with invalid token', async () => {
      const app = makeApp();
      const res = await request(app)
        .get('/api/auth/users')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });
});
