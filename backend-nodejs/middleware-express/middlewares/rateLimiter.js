const requests = new Map();

const rateLimiter = (limit, windowMs) => (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  
  if (!requests.has(ip)) requests.set(ip, []);
  const timestamps = requests.get(ip).filter(t => now - t < windowMs);
  
  if (timestamps.length >= limit) {
    return res.status(429).json({ error: 'Demasiadas peticiones. Intente más tarde.' });
  }
  
  timestamps.push(now);
  requests.set(ip, timestamps);
  next();
};

module.exports = rateLimiter;