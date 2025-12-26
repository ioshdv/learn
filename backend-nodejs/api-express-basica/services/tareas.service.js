const { Parser } = require('json2csv');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

let tareas = [
  { id: 1, titulo: 'Aprender Express', descripcion: 'Completar tutorial', completada: false, fechaCreacion: "2025-12-20T10:00:00Z" },
  { id: 2, titulo: 'Crear API', descripcion: 'Implementar endpoints REST', completada: true, fechaCreacion: "2025-12-21T11:00:00Z" },
  { id: 3, titulo: 'Testing', descripcion: 'Probar con Postman', completada: false, fechaCreacion: "2025-12-22T12:00:00Z" }
];
let siguienteId = 4;

const encontrarTarea = (id) => tareas.find(t => t.id === Number(id));

function obtenerEstadisticas(req, res) {
  const stats = {
    total: tareas.length,
    completadas: tareas.filter(t => t.completada).length,
    pendientes: tareas.filter(t => !t.completada).length,
    fechaConsulta: new Date().toISOString()
  };
  logger.info('Consulta de estadísticas');
  res.json(stats);
}

function obtenerTareas(req, res) {
  let resultados = [...tareas];
  const { completada, q, desde } = req.query;

  if (completada !== undefined) {
    resultados = resultados.filter(t => t.completada === (completada === 'true'));
  }

  if (q) {
    const termino = q.toLowerCase();
    resultados = resultados.filter(t =>
      t.titulo.toLowerCase().includes(termino) || t.descripcion.toLowerCase().includes(termino)
    );
  }

  if (desde) {
    resultados = resultados.filter(t => new Date(t.fechaCreacion) >= new Date(desde));
  }

  logger.info(`Listado de tareas: ${resultados.length} encontradas`);
  res.json({ total: resultados.length, tareas: resultados });
}

function crearTarea(req, res) {
  const nuevaTarea = {
    id: siguienteId++,
    ...req.body,
    completada: req.body.completada || false,
    fechaCreacion: new Date().toISOString()
  };
  tareas.push(nuevaTarea);
  logger.info(`Tarea creada ID: ${nuevaTarea.id}`);
  res.status(201).json(nuevaTarea);
}

function exportarTareasCSV(req, res) {
  try {
    const parser = new Parser();
    const csv = parser.parse(tareas);
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);
    const filePath = path.join(logsDir, 'tareas.csv');
    fs.writeFileSync(filePath, csv);
    logger.info('Exportación CSV realizada exitosamente');
    res.header('Content-Type', 'text/csv').attachment('tareas.csv').send(csv);
  } catch (err) {
    logger.error(`Error en exportación: ${err.message}`);
    res.status(500).json({ error: 'Fallo al exportar datos' });
  }
}

function obtenerTareaPorId(req, res) {
  const tarea = encontrarTarea(req.params.id);
  if (!tarea) return res.status(404).json({ error: 'No existe la tarea' });
  res.json(tarea);
}

function actualizarTarea(req, res) {
  const tarea = encontrarTarea(req.params.id);
  if (!tarea) return res.status(404).json({ error: 'No existe la tarea' });
  const { id, ...datos } = req.body;
  Object.assign(tarea, datos, { fechaActualizacion: new Date().toISOString() });
  logger.info(`Tarea actualizada ID: ${tarea.id}`);
  res.json(tarea);
}

function eliminarTarea(req, res) {
  const index = tareas.findIndex(t => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'No existe la tarea' });
  const [eliminada] = tareas.splice(index, 1);
  logger.info(`Tarea eliminada ID: ${eliminada.id}`);
  res.json(eliminada);
}

module.exports = {
  obtenerTareas, obtenerTareaPorId, crearTarea,
  actualizarTarea, eliminarTarea, exportarTareasCSV, obtenerEstadisticas
};