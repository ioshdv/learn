const Tarea = require('../models/tarea');
const Almacenamiento = require('../lib/almacenamiento');
const { validarTarea } = require('../lib/validacion');
const logger = require('../lib/logger');
const { exportarJSON, exportarCSV } = require('../lib/exportador');

class GestorTareas {
  constructor() {
    this.almacenamiento = new Almacenamiento('tareas.json');
    this.tareas = new Map();
  }

  async inicializar() {
    const datos = await this.almacenamiento.cargar();
    if (datos.tareas) {
      datos.tareas.forEach(tareaData => {
        const tarea = new Tarea(
          tareaData.id,
          tareaData.titulo,
          tareaData.descripcion,
          tareaData.prioridad
        );
        if (tareaData.completada) tarea.completar();
        this.tareas.set(tarea.id, tarea);
      });
    }
    logger.log('Inicialización', `Cargadas ${this.tareas.size} tareas`);
  }

  async guardar() {
    const tareasArray = Array.from(this.tareas.values()).map(t => t.obtenerInformacion());
    this.almacenamiento.actualizarDatos({ tareas: tareasArray });
    await this.almacenamiento.guardar();
    logger.log('Guardar', `Se guardaron ${tareasArray.length} tareas`);
  }

  crearTarea(titulo, descripcion = '', prioridad = 'media') {
    const id = Date.now().toString();
    const tarea = new Tarea(id, titulo, descripcion, prioridad);
    validarTarea(tarea);
    this.tareas.set(id, tarea);
    logger.log('Crear Tarea', `${titulo} (${prioridad})`);
    return tarea;
  }

  obtenerTarea(id) {
    return this.tareas.get(id);
  }

  obtenerTodasTareas(filtro = {}) {
    let tareas = Array.from(this.tareas.values());
    if (filtro.completada !== undefined) {
      tareas = tareas.filter(t => t.completada === filtro.completada);
    }
    if (filtro.prioridad) {
      tareas = tareas.filter(t => t.prioridad === filtro.prioridad);
    }
    return tareas;
  }

  async completarTarea(id) {
    const tarea = this.tareas.get(id);
    if (!tarea) throw new Error(`Tarea con ID ${id} no encontrada`);
    tarea.completar();
    await this.guardar();
    logger.log('Completar Tarea', `${tarea.titulo}`);
    return tarea;
  }

  async actualizarTarea(id, datos) {
    const tarea = this.tareas.get(id);
    if (!tarea) throw new Error(`Tarea con ID ${id} no encontrada`);
    tarea.actualizar(datos);
    await this.guardar();
    logger.log('Actualizar Tarea', `${tarea.titulo}`);
    return tarea;
  }

  async eliminarTarea(id) {
    const tarea = this.tareas.get(id);
    if (!tarea) throw new Error(`Tarea con ID ${id} no encontrada`);
    this.tareas.delete(id);
    await this.guardar();
    logger.log('Eliminar Tarea', `${tarea.titulo}`);
    return tarea;
  }

  obtenerEstadisticas() {
    const tareas = Array.from(this.tareas.values());
    const total = tareas.length;
    const completadas = tareas.filter(t => t.completada).length;
    const pendientes = total - completadas;
    const porPrioridad = tareas.reduce((acc, tarea) => {
      acc[tarea.prioridad] = (acc[tarea.prioridad] || 0) + 1;
      return acc;
    }, {});
    return { total, completadas, pendientes, porPrioridad };
  }

  async exportar(formato = 'json', nombreArchivo) {
    const tareasArray = Array.from(this.tareas.values()).map(t => t.obtenerInformacion());
    if (formato === 'json') return exportarJSON(tareasArray, nombreArchivo);
    if (formato === 'csv') return exportarCSV(tareasArray, nombreArchivo);
    throw new Error('Formato de exportación no soportado');
  }
}

module.exports = GestorTareas;
