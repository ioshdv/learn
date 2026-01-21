const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

function generateTokens(user) {
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
}

// REGISTER
router.post('/register', async (req, res) => {
  const { email, password, nombre } = req.body;

  if (!email || !password || !nombre) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  if (typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ error: 'Password too short' });
  }

  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email ya registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      email,
      password: hashedPassword,
      nombre,
      role: 'user',
      activo: true
    });

    const tokens = generateTokens(user);
    await user.update({ refreshToken: tokens.refreshToken });

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        role: user.role
      },
      ...tokens
    });
  } catch (error) {
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const tokens = generateTokens(user);
  await user.update({ refreshToken: tokens.refreshToken });

  return res.json({
    user: {
      id: user.id,
      email: user.email,
      nombre: user.nombre,
      role: user.role
    },
    ...tokens
  });
});

// REFRESH TOKEN
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Missing refreshToken' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findByPk(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Token inválido' });
    }

    const tokens = generateTokens(user);
    await user.update({ refreshToken: tokens.refreshToken });

    return res.json(tokens);
  } catch {
    return res.status(401).json({ error: 'Token inválido' });
  }
});

module.exports = router;
