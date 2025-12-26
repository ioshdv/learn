const express = require('express');
const router = express.Router();
const tareasService = require('../services/tareas.service');
const { tareaSchema } = require('../validations/tarea.schema');

const validar = (req, res, next) => {
  const { error } = tareaSchema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  next();
};

router.get('/stats', tareasService.obtenerEstadisticas);
router.get('/export/csv', tareasService.exportarTareasCSV);
router.get('/', tareasService.obtenerTareas);
router.get('/:id', tareasService.obtenerTareaPorId);
router.post('/', validar, tareasService.crearTarea);
router.put('/:id', validar, tareasService.actualizarTarea);
router.patch('/:id', validar, tareasService.actualizarTarea);
router.delete('/:id', tareasService.eliminarTarea);

module.exports = router;