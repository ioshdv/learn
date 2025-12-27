const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');

/**
 * Rutas Versión 2 (Moderna)
 * @param {Array} productos - Estado global
 * @param {Object} siguienteId - Referencia al contador de IDs
 * @param {Function} sendResponse - Helper de respuesta
 * @param {Function} notifyWebhooks - Función de notificación
 */
module.exports = (productos, siguienteId, sendResponse, notifyWebhooks) => {

  // GET /api/v2/productos - Lista con metadatos
  router.get('/productos', (req, res) => {
    sendResponse(res, {
      version: 'v2.0',
      total: productos.length,
      data: productos
    }, 200, req.requestedFormat);
  });

  // POST /api/v2/productos - Protegido y con Webhooks
  router.post('/productos', authenticateJWT, async (req, res) => {
    const { nombre, precio, categoria, stock } = req.body;

    if (!nombre || precio === undefined) {
      return sendResponse(res, { error: 'Nombre y precio requeridos' }, 400, req.requestedFormat);
    }

    const nuevoProducto = {
      id: siguienteId.val++,
      nombre,
      precio: parseFloat(precio),
      categoria: categoria || 'General',
      stock: stock || 0,
      metadata: {
        created_by: req.user.username, // Extraído del JWT
        created_at: new Date().toISOString()
      }
    };

    productos.push(nuevoProducto);

    // Disparo asíncrono de Webhooks
    if (notifyWebhooks) {
      await notifyWebhooks('PRODUCT_CREATED', nuevoProducto);
    }

    sendResponse(res, {
      status: 'success',
      item: nuevoProducto
    }, 201, req.requestedFormat);
  });

  return router;
};