const express = require('express');
const path = require('path');
const cors = require('cors');
const compression = require('compression');

const app = express();

app.use(cors());
app.use(express.json());

app.use(compression());

const publicDir = path.join(__dirname, '..', 'dist', 'public');

app.use(express.static(publicDir, {
  etag: true,
  maxAge: '365d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

const authRouter = require('./routes_auth');
app.use('/api/auth', authRouter);

const productsRouter = require('./routes_products');
const { authRequired } = require('./auth_middleware');
app.use('/api/products', productsRouter);

const db = require('./data/db');
app.get('/api/reports/stock/summary', (req, res) => {
  res.json(db.stockSummary());
});

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
