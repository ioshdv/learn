const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');

// Importación de Middlewares
const rateLimiter = require('./middlewares/rateLimiter');
const { validateSchema, userSchema } = require('./middlewares/validator');
const cache = require('./middlewares/cache');
const i18n = require('./middlewares/i18n');

const app = express();

// Middlewares de Terceros y Globales
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(i18n); // Internacionalización global

// Datos
let usuarios = [];

// Rutas Aplicando Middlewares Específicos
app.get('/api/usuarios', 
  rateLimiter(10, 60000), 
  cache(30), // Caché de 30 segundos
  (req, res) => {
    res.json({ 
      mensaje: req.t('WELCOME'), 
      data: usuarios 
    });
});

app.post('/api/usuarios', 
  rateLimiter(5, 60000), 
  validateSchema(userSchema), 
  (req, res) => {
    const nuevoUsuario = { id: usuarios.length + 1, ...req.body };
    usuarios.push(nuevoUsuario);
    res.status(201).json({
      mensaje: req.t('USER_CREATED'),
      usuario: nuevoUsuario
    });
});

// Manejo de 404
app.use((req, res) => {
  res.status(404).json({ error: req.t('NOT_FOUND') });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});