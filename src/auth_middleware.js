const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-CHANGE-ME';

function authRequired(req, res, next) {
  const header = req.headers['authorization'] || '';
  const [bearer, token] = header.split(' ');
  if (bearer !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token requerido' });
  }
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Preserve the original JWT payload so tests can access fields like `sub`, `username`, `role`, etc.
    req.user = payload;
    next();
  } catch (_) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = { authRequired };
