const express = require('express');
const { query, validationResult } = require('express-validator');
const { AppError, ValidationError } = require('./errores');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// REQUERIMIENTO: SISTEMA DE LOGS
const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
app.use((req, res, next) => {
  const logEntry = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
  logStream.write(logEntry);
  next();
});

// DATA STORE
let tareas = [
  { id: 1, titulo: 'Aprender Express', completada: true, usuarioId: 1, categoria: 'estudio', fecha: '2025-12-25' },
  { id: 2, titulo: 'Configurar Router', completada: true, usuarioId: 1, categoria: 'trabajo', fecha: '2025-12-25' },
  { id: 3, titulo: 'Logs de Sistema', completada: false, usuarioId: 1, categoria: 'infra', fecha: '2025-12-26' }
];

// MIDDLEWARE DE VALIDACIÓN (CORREGIDO PARA BLOQUEAR FLUJO)
const validarErrores = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Se envía el error al middleware de errores centralizado y se detiene el flujo
    return next(new ValidationError('Datos de consulta inválidos', errors.array()));
  }
  next();
};

// MIDDLEWARE DE AUTENTICACIÓN
const autenticar = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || auth !== 'Bearer admin-token') {
    return next(new AppError('No autorizado', 401));
  }
  req.usuario = { userId: 1 };
  next();
};

// ROUTERS MODULARES
const tareasRouter = express.Router();
const statsRouter = express.Router();

tareasRouter.use(autenticar);
statsRouter.use(autenticar);

// REQUERIMIENTO: BÚSQUEDA AVANZADA (AND/OR) Y CATEGORÍAS
tareasRouter.get('/', [
  query('q').optional().trim(),
  query('cat').optional().trim(),
  query('op').optional().isIn(['and', 'or']).withMessage('Operador debe ser and u or')
], 
validarErrores, 
(req, res) => {
  const { q, cat, op = 'and' } = req.query;
  let resu = tareas.filter(t => t.usuarioId === req.usuario.userId);

  if (q || cat) {
    resu = resu.filter(t => {
      const matchQ = q ? t.titulo.toLowerCase().includes(q.toLowerCase()) : (op === 'and');
      const matchCat = cat ? t.categoria === cat : (op === 'and');
      
      return op === 'and' ? (matchQ && matchCat) : (matchQ || matchCat);
    });
  }
  res.json(resu);
});

// REQUERIMIENTO: ESTADÍSTICAS
statsRouter.get('/productividad', (req, res) => {
  const completadas = tareas.filter(t => t.usuarioId === req.usuario.userId && t.completada);
  const porDia = completadas.reduce((acc, t) => {
    acc[t.fecha] = (acc[t.fecha] || 0) + 1;
    return acc;
  }, {});
  
  res.json({
    usuarioId: req.usuario.userId,
    totalCompletadas: completadas.length,
    productividadDiaria: porDia
  });
});

app.use('/api/tareas', tareasRouter);
app.use('/api/stats', statsRouter);

// MANEJO DE ERRORES CENTRALIZADO (DEBE IR AL FINAL)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message,
    detalles: err.details || null
  });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 API activa en puerto ${PORT}`));