// SISTEMA DE GESTIÓN DE TAREAS CON PATRONES: Singleton, Factory, Observer, Command, Strategy y Decorator

// ----------------------
// 1. SINGLETON: GestorTareas
// ----------------------
class GestorTareas {
  constructor() {
    if (GestorTareas.instancia) return GestorTareas.instancia;

    this.tareas = new Map();
    this.siguienteId = 1;
    this.observadores = new Set();

    // Command pattern: historial de operaciones
    this.historialComandos = [];
    this.historialRedo = [];

    GestorTareas.instancia = this;
  }

  // Observer Pattern
  suscribir(observador) { this.observadores.add(observador); }
  desuscribir(observador) { this.observadores.delete(observador); }
  notificar(evento, datos) {
    this.observadores.forEach(obs => {
      try { obs.notificar(evento, datos); } 
      catch (e) { console.error(e); }
    });
  }

  // ----------------------
  // Métodos para tareas
  // ----------------------
  agregarTarea(tarea) {
    this.tareas.set(tarea.id, tarea);
    this.notificar('tarea_creada', tarea);
  }

  obtenerTarea(id) { return this.tareas.get(id); }

  actualizarTarea(id, cambios) {
    const tarea = this.tareas.get(id);
    if (tarea) {
      Object.assign(tarea, cambios);
      this.notificar('tarea_actualizada', tarea);
    }
  }

  eliminarTarea(id) {
    const tarea = this.tareas.get(id);
    if (tarea) {
      this.tareas.delete(id);
      this.notificar('tarea_eliminada', tarea);
    }
  }

  obtenerTareas(filtroFn = null) {
    let lista = Array.from(this.tareas.values());
    if (filtroFn) lista = lista.filter(filtroFn);
    return lista;
  }

  obtenerEstadisticas() {
    const tareas = Array.from(this.tareas.values());
    return {
      total: tareas.length,
      completadas: tareas.filter(t => t.completada).length,
      pendientes: tareas.filter(t => !t.completada).length
    };
  }

  // ----------------------
  // COMMAND PATTERN: Undo / Redo
  // ----------------------
  ejecutarComando(comando) {
    comando.ejecutar();
    this.historialComandos.push(comando);
    this.historialRedo = []; // limpiar redo
  }

  deshacer() {
    const comando = this.historialComandos.pop();
    if (comando) {
      comando.deshacer();
      this.historialRedo.push(comando);
    }
  }

  rehacer() {
    const comando = this.historialRedo.pop();
    if (comando) {
      comando.ejecutar();
      this.historialComandos.push(comando);
    }
  }
}

// ----------------------
// 2. FACTORY: Crear tareas
// ----------------------
class FabricaTareas {
  crearTarea(tipo, datos) {
    switch (tipo.toLowerCase()) {
      case 'basica': return new TareaBasica(datos);
      case 'con-fecha-limite': return new TareaConFechaLimite(datos);
      default: throw new Error(`Tipo de tarea '${tipo}' no soportado`);
    }
  }
}

// ----------------------
// 3. CLASES DE TAREAS
// ----------------------
class TareaBasica {
  constructor({ id, titulo, descripcion = '' }) {
    this.id = id;
    this.titulo = titulo;
    this.descripcion = descripcion;
    this.completada = false;
    this.tipo = 'basica';
  }

  completar() { this.completada = true; }
}

class TareaConFechaLimite extends TareaBasica {
  constructor(datos) {
    super(datos);
    this.fechaLimite = datos.fechaLimite;
    this.tipo = 'con-fecha-limite';
  }

  estaVencida() {
    return new Date() > this.fechaLimite && !this.completada;
  }
}

// ----------------------
// 4. COMMAND PATTERN: Comandos de tarea
// ----------------------
class ComandoCompletarTarea {
  constructor(gestor, id) {
    this.gestor = gestor;
    this.id = id;
    this.estadoPrevio = null;
  }

  ejecutar() {
    const tarea = this.gestor.obtenerTarea(this.id);
    if (tarea) {
      this.estadoPrevio = tarea.completada;
      tarea.completada = true;
      this.gestor.notificar('tarea_completada', tarea);
    }
  }

  deshacer() {
    const tarea = this.gestor.obtenerTarea(this.id);
    if (tarea) {
      tarea.completada = this.estadoPrevio;
      this.gestor.notificar('tarea_completada_deshacer', tarea);
    }
  }
}

// ----------------------
// 5. STRATEGY PATTERN: Diferentes filtros de tareas
// ----------------------
class FiltroTareasStrategy {
  filtrar(tareas) { return tareas; } // default: sin filtro
}

class FiltroPorCompletadas extends FiltroTareasStrategy {
  filtrar(tareas) { return tareas.filter(t => t.completada); }
}

class FiltroPorPendientes extends FiltroTareasStrategy {
  filtrar(tareas) { return tareas.filter(t => !t.completada); }
}

// ----------------------
// 6. DECORATOR PATTERN: Extender tareas con funcionalidades
// ----------------------
class TareaDecorator {
  constructor(tarea) { this.tarea = tarea; }
  completar() { this.tarea.completada = true; }
}

class NotificacionEmailDecorator extends TareaDecorator {
  completar() {
    super.completar();
    console.log(`📧 Email: La tarea "${this.tarea.titulo}" ha sido completada`);
  }
}

class IntegracionCalendarioDecorator extends TareaDecorator {
  completar() {
    super.completar();
    console.log(`📅 Calendario: Evento para "${this.tarea.titulo}" actualizado`);
  }
}

// ----------------------
// 7. OBSERVERS
// ----------------------
class ObservadorConsola {
  notificar(evento, datos) {
    console.log(`[OBS] ${evento}: ${datos.titulo || datos.id}`);
  }
}

// ----------------------
// 8. DEMOSTRACIÓN
// ----------------------
console.log('🚀 DEMO: Sistema completo con patrones extendidos');

const gestor = new GestorTareas();
gestor.suscribir(new ObservadorConsola());

const fabrica = new FabricaTareas();
const tarea1 = fabrica.crearTarea('basica', { id: 1, titulo: 'Aprender JS' });
const tarea2 = fabrica.crearTarea('con-fecha-limite', { id: 2, titulo: 'Proyecto final', fechaLimite: new Date(Date.now() + 3*24*60*60*1000) });

gestor.agregarTarea(tarea1);
gestor.agregarTarea(tarea2);

// Decorators
const tarea1Decorada = new NotificacionEmailDecorator(tarea1);
const tarea2Decorada = new IntegracionCalendarioDecorator(tarea2);

// Command: completar tareas
gestor.ejecutarComando(new ComandoCompletarTarea(gestor, 1));
gestor.ejecutarComando(new ComandoCompletarTarea(gestor, 2));

console.log('\n🔄 Undo/Redo');
gestor.deshacer(); // deshace tarea2
gestor.rehacer();  // rehace tarea2

// Strategy: filtrar
console.log('\n📊 Filtrado con Strategy:');
const estrategiaPendientes = new FiltroPorPendientes();
console.log('Tareas pendientes:', estrategiaPendientes.filtrar(gestor.obtenerTareas()).map(t => t.titulo));
