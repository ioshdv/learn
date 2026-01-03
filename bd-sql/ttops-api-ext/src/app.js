require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const multer = require('multer');
const redis = require('redis');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_key_2026';

// --- CONFIGURACIÓN DE RUTAS ---
const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// --- BASE DE DATOS Y CACHÉ ---
const pool = mysql.createPool({
    host: '127.0.0.1', user: 'root', password: '', database: 'ttops_node_db'
});

const cache = redis.createClient();
cache.connect().catch(() => console.log('⚠️ Redis Offline'));

// --- CONFIGURACIÓN DE EMAIL (CUENTA DINÁMICA) ---
let transporter;
nodemailer.createTestAccount((err, account) => {
    if (err) return console.error('Error Email Account', err);
    transporter = nodemailer.createTransport({
        host: account.smtp.host, port: account.smtp.port, secure: account.smtp.secure,
        auth: { user: account.user, pass: account.pass }
    });
    console.log('📧 Servidor de Email de prueba listo');
});

// --- MULTER ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Middleware de Autenticación
const auth = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'No token' });
    try {
        req.user = jwt.verify(token, JWT_SECRET);
        next();
    } catch (e) { res.status(403).json({ error: 'Token inválido' }); }
};

// --- RUTAS ---

app.post('/auth/register', async (req, res) => {
    try {
        const hash = await bcrypt.hash(req.body.password, 10);
        await pool.execute('INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)', [req.body.nombre, req.body.email, hash]);
        res.status(201).json({ message: 'Usuario registrado' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/auth/login', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT * FROM usuarios WHERE email = ?', [req.body.email]);
        if (rows[0] && await bcrypt.compare(req.body.password, rows[0].password)) {
            const token = jwt.sign({ id: rows[0].id, email: rows[0].email }, JWT_SECRET);
            return res.json({ token });
        }
        res.status(401).json({ error: 'Login fallido' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/productos', async (req, res) => {
    try {
        const cached = await cache.get('productos_list');
        if (cached) return res.json(JSON.parse(cached));
        const [rows] = await pool.execute('SELECT * FROM productos');
        await cache.setEx('productos_list', 60, JSON.stringify(rows));
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/productos', auth, upload.single('imagen'), async (req, res) => {
    try {
        const { nombre, precio } = req.body;
        const imagen = req.file ? req.file.filename : null;
        await pool.execute('INSERT INTO productos (nombre, precio, imagen) VALUES (?, ?, ?)', [nombre, precio, imagen]);
        await cache.del('productos_list');
        res.status(201).json({ message: 'Producto creado' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/productos/:id/resenas', auth, async (req, res) => {
    try {
        await pool.execute(
            'INSERT INTO reseñas (producto_id, usuario_id, calificacion, comentario) VALUES (?, ?, ?, ?)',
            [req.params.id, req.user.id, req.body.calificacion, req.body.comentario]
        );
        res.status(201).json({ message: 'Reseña guardada' });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/pedidos', auth, async (req, res) => {
    try {
        const { total } = req.body;
        const [result] = await pool.execute('INSERT INTO pedidos (usuario_id, total) VALUES (?, ?)', [req.user.id, total]);
        
        if (transporter) {
            let info = await transporter.sendMail({
                from: '"Tienda Backend" <no-reply@tienda.com>',
                to: req.user.email,
                subject: "Confirmación de Pedido",
                text: `Pedido #${result.insertId} procesado por $${total}`
            });
            console.log('🔗 URL de Email enviado:', nodemailer.getTestMessageUrl(info));
        }
        res.status(201).json({ message: 'Pedido procesado y email enviado' });
    } catch (e) { res.status(500).json({ error: 'Error al procesar pedido' }); }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 SERVIDOR FINAL LISTO EN PUERTO ${PORT}`);
});