const express = require('express');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');

const { objectToXML, webhooks, notifyWebhooks } = require('./src/utils/helpers');
const { apiLimiter, SECRET_KEY } = require('./src/middleware/auth');
const openapiConfig = require('./src/docs/openapi');
const logger = require('./src/utils/logger');

const app = express();

/**
 * REQUISITO: Logging de operaciones (Morgan + Winston)
 */
app.use(morgan('combined', { 
  stream: { write: (message) => logger.info(message.trim()) } 
}));

app.use(express.json());
app.use(apiLimiter);

let productos = [
  { id: 1, nombre: 'Laptop', precio: 1000, categoria: 'Electrónica' }
];
let siguienteId = { val: 2 };

// Content Negotiation
const sendResponse = (res, data, statusCode = 200, format = 'json') => {
  res.status(statusCode);
  if (format === 'xml') {
    res.set('Content-Type', 'application/xml');
    return res.send(objectToXML(data));
  }
  return res.json(data);
};

app.use((req, res, next) => {
  const accept = req.headers.accept || '';
  req.requestedFormat = (req.query.format === 'xml' || accept.includes('xml')) ? 'xml' : 'json';
  next();
});

// Autenticación para obtener JWT
app.post('/login', (req, res) => {
  const { username } = req.body;
  if (username === 'admin') {
    const token = jwt.sign({ username, role: 'admin' }, SECRET_KEY, { expiresIn: '1h' });
    return res.json({ token });
  }
  res.status(401).json({ error: 'Credenciales inválidas' });
});

// Suscripción a Webhooks
app.post('/webhooks/subscribe', (req, res) => {
  const { url } = req.body;
  if (url) webhooks.push(url);
  res.status(201).json({ status: 'Suscrito' });
});

/**
 * REQUISITO: Documentación OpenAPI Automática
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiConfig));

// Carga de Rutas Versionadas
const v1Routes = require('./src/routes/v1.routes')(productos, sendResponse);
const v2Routes = require('./src/routes/v2.routes')(productos, siguienteId, sendResponse, notifyWebhooks);

app.use('/api/v1', v1Routes);
app.use('/api/v2', v2Routes);

const PORT = 3000;
app.listen(PORT, () => {
  logger.info(`Servidor iniciado en puerto ${PORT}`);
  console.log(`🚀 API: http://localhost:${PORT}`);
  console.log(`📖 Docs: http://localhost:${PORT}/api-docs`);
});