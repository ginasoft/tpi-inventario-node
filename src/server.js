const express = require('express');
const path = require('path');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const authRouter = require('./routes_auth');
app.use('/api/auth', authRouter);

const productsRouter = require('./routes_products');
const { authRequired } = require('./auth_middleware');
app.use('/api/products', /*authRequired,*/ productsRouter);

const db = require('./data/db');
app.get('/api/reports/stock/summary', /*authRequired,*/ (req, res) => {
  res.json(db.stockSummary());
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
