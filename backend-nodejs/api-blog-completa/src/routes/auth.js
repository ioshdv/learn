const router = require('express').Router();
const storage = require('../config/database');
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const data = storage.get();

    // Verificación de seguridad para asegurar que la propiedad users exista
    if (!data.users) {
        return res.status(500).json({ error: 'Error en la base de datos: Tabla de usuarios no encontrada' });
    }

    const user = data.users.find(u => u.username === username && u.password === password);

    if (!user) return res.status(401).json({ error: 'Credenciales inválidas' });

    // CLAVE UNIFICADA: 'SECRET_KEY_EXPERT'
    const token = jwt.sign(
        { username: user.username, role: user.role }, 
        'SECRET_KEY_EXPERT', 
        { expiresIn: '24h' }
    );

    res.json({ token });
});

module.exports = router;