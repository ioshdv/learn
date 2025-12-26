const logger = require('../utils/logger');

const tareasService = require('./tareas.service');

/**
 * GET /stats
 * Devuelve estadísticas agregadas de las tareas
 */
function obtenerEstadisticas(req, res) {
  // Acceso controlado a las tareas
  const tareas = tareasService.__getTareas();

  const total = tareas.length;
  const completadas = tareas.filter(t => t.completada).length;
  const pendientes = total - completadas;

  const porcentajeCompletadas =
    total === 0 ? 0 : ((completadas / total) * 100).toFixed(2);

  logger.info('Consulta de estadísticas');

  res.json({
    total,
    completadas,
    pendientes,
    porcentajeCompletadas
  });
}

module.exports = {
  obtenerEstadisticas
};
