const express = require('express');
const router = express.Router();

/**
 * Rutas Versión 1 (Legacy)
 * @param {Array} productos - Estado global
 * @param {Function} sendResponse - Helper de respuesta
 */
module.exports = (productos, sendResponse) => {

  // GET /api/v1/productos
  router.get('/productos', (req, res) => {
    // V1 devuelve el array simple sin metadatos extra
    sendResponse(res, productos, 200, req.requestedFormat);
  });

  // POST /api/v1/productos (Sin seguridad JWT)
  router.post('/productos', (req, res) => {
    const { nombre, precio } = req.body;
    if (!nombre || !precio) {
      return sendResponse(res, { error: 'Faltan campos' }, 400, req.requestedFormat);
    }
    const nuevo = { id: Date.now(), nombre, precio, categoria: 'General' };
    productos.push(nuevo);
    sendResponse(res, nuevo, 201, req.requestedFormat);
  });

  return router;
};