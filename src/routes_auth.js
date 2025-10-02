const express = require('express');
const router = express.Router();
const users = require('./data/users');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-CHANGE-ME';
const EXPIRES = '4h';

router.post('/register', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username y password son requeridos' });

  if (users.findByUsername(username)) return res.status(409).json({ error: 'Usuario ya existe' });

  const created = users.create({ username, password });
  res.status(201).json(created);
});

router.post('/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) return res.status(400).json({ error: 'username y password son requeridos' });

  const user = users.findByUsername(username);
  if (!user || user.password !== password) return res.status(401).json({ error: 'Credenciales inválidas' });

  const token = jwt.sign({ sub: user.id, username }, JWT_SECRET, { expiresIn: EXPIRES });
  res.json({ token });
});

const { authRequired } = require('./auth_middleware');
router.get('/users', authRequired, (req, res) => {
  res.json(users.getAll());
});

module.exports = router;
