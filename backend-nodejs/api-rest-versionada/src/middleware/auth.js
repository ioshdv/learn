const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');

const SECRET_KEY = 'javascript_senior_secret_2024';

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, SECRET_KEY, (err, user) => {
      if (err) return res.status(403).json({ error: 'Token inválido o expirado' });
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ error: 'Token de acceso requerido' });
  }
};

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Límite de peticiones excedido' }
});

module.exports = { authenticateJWT, apiLimiter, SECRET_KEY };