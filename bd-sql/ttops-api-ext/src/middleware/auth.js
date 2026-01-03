const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            console.log('⚠️ Auth: No hay token en la petición');
            return res.status(401).json({ error: 'Token requerido' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_2026');
        req.user = decoded;
        console.log('🛡️ Auth: Token validado para usuario ID:', decoded.id);
        next();
    } catch (err) {
        console.log('❌ Auth: Error de validación ->', err.message);
        return res.status(403).json({ error: 'Token inválido o expirado' });
    }
};