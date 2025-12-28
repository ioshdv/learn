const jwt = require('jsonwebtoken');

exports.authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No se proporcionó un token' });
    }
    const token = authHeader.split(' ')[1];
    try {
        // AQUÍ ESTABA EL FALLO: Ahora usa 'SECRET_KEY_EXPERT'
        const decoded = jwt.verify(token, 'SECRET_KEY_EXPERT');
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Token inválido' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: 'No tienes permiso para esta acción' });
        }
        next();
    };
};