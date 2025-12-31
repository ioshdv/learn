const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const users = require('../models/User');

const SECRET = 'supersecretkey';
const REFRESH_SECRET = 'refreshsecretkey';

const login = async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email);
    if(!user) return res.status(400).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) return res.status(400).json({ error: 'Invalid password' });

    const token = jwt.sign({ email: user.email }, SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ email: user.email }, REFRESH_SECRET, { expiresIn: '7d' });

    res.json({ token, refreshToken });
};

const register = async (req, res) => {
    const { email, password } = req.body;
    if(users.find(u => u.email === email)) return res.status(400).json({ error: 'User exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ email, password: hashedPassword });

    res.json({ message: 'User registered' });
};

const refresh = (req, res) => {
    const { refreshToken } = req.body;
    if(!refreshToken) return res.status(401).json({ error: 'No token provided' });

    try {
        const payload = jwt.verify(refreshToken, REFRESH_SECRET);
        const token = jwt.sign({ email: payload.email }, SECRET, { expiresIn: '15m' });
        res.json({ token });
    } catch(err) {
        res.status(401).json({ error: 'Invalid token' });
    }
};

module.exports = { login, register, refresh };
