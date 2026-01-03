const redis = require('redis');
const nodemailer = require('nodemailer');
const multer = require('multer');
const path = require('path');

// 1. Configuración de Redis Cache
const cache = redis.createClient({ 
    url: process.env.REDIS_URL || 'redis://localhost:6379' 
});

cache.on('error', (err) => console.error('Redis Client Error', err));

// Conexión inmediata a Redis
(async () => {
    try {
        await cache.connect();
        console.log('✅ Conectado a Redis');
    } catch (err) {
        console.error('❌ No se pudo conectar a Redis:', err.message);
    }
})();

// 2. Configuración de Nodemailer (Sistema de correos)
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// 3. Configuración de Multer (Subida de imágenes)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // La carpeta 'uploads' debe existir en la raíz
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Nombre de archivo único: timestamp + extensión original
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'prod-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('El archivo no es una imagen'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // Límite 2MB
});

module.exports = { 
    cache, 
    transporter, 
    upload 
};
