// ====================================================
// 1. CLASE PRINCIPAL: DashboardProductividad
// ====================================================

class DashboardProductividad {
  constructor() {
    // 1.1. Inicialización del Estado
    this.tareas = this.cargarTareas();
    // Estadísticas persistentes
    this.sesionesCompletadas = parseInt(localStorage.getItem('sesionesCompletadas')) || 0;
    this.tiempoEnfocado = parseInt(localStorage.getItem('tiempoEnfocado')) || 0; // Tiempo en minutos
    this.modoOscuro = localStorage.getItem('modoOscuro') === 'true';

    // Estado del temporizador Pomodoro
    this.TEMPORIZADOR_TRABAJO = 25 * 60; // 25 minutos en segundos
    this.TEMPORIZADOR_DESCANSO = 5 * 60; // 5 minutos en segundos

    this.temporizador = {
      activo: false,
      tiempoRestante: this.TEMPORIZADOR_TRABAJO,
      modo: 'trabajo', // 'trabajo' o 'descanso'
      intervalo: null,
      progresoTotal: this.TEMPORIZADOR_TRABAJO,
    };

    // Filtro de tareas actual
    this.filtroActual = 'todas';

    // 1.2. Inicialización
    this.inicializar();
  }

  inicializar() {
    this.configurarEventListeners();
    this.actualizarInterfaz();
    this.aplicarModoOscuro();
    this.actualizarDisplayTemporizador(); // Muestra el valor inicial
    this.actualizarProgresoTemporizador(); // Muestra el círculo inicial
  }

  // ====================================================
  // 2. MÉTODOS DE GESTIÓN DE TAREAS
  // ====================================================

  agregarTarea(tarea) {
    if (!tarea.titulo || tarea.titulo.trim() === '') {
        // Manejo de error y validación
        this.mostrarNotificacion('El título de la tarea es obligatorio.', 'error');
        return null;
    }
    
    const nuevaTarea = {
      id: Date.now(),
      titulo: tarea.titulo,
      descripcion: tarea.descripcion || '',
      prioridad: tarea.prioridad || 'media',
      fechaLimite: tarea.fechaLimite || null,
      completada: false,
      fechaCreacion: new Date().toISOString()
    };

    this.tareas.push(nuevaTarea);
    this.guardarTareas();
    this.actualizarListaTareas(this.filtroActual);
    this.actualizarEstadisticas();
    this.mostrarNotificacion('Tarea creada con éxito.', 'exito');
    return nuevaTarea;
  }

  completarTarea(id) {
    const tarea = this.tareas.find(t => t.id === id);
    if (tarea && !tarea.completada) {
      tarea.completada = true;
      tarea.fechaCompletada = new Date().toISOString();
      
      // Animación de salida antes de re-renderizar
      const elemento = document.getElementById(`tarea-${id}`);
      if (elemento) {
        elemento.classList.add('eliminando');
        setTimeout(() => {
          this.guardarTareas();
          this.actualizarListaTareas(this.filtroActual);
          this.actualizarEstadisticas();
          this.mostrarNotificacion('¡Tarea completada!', 'exito');
        }, 500); // Espera a que termine la animación CSS
      }
      return true;
    }
    return false;
  }
  
  // Delegación de eventos para manejar click en el botón de eliminar
  manejarEventoTarea(e) {
      // Event delegation: Verifica si el click fue en un checkbox
      if (e.target.classList.contains('checkbox-tarea')) {
          // El ID está en el elemento padre, que tiene el dataset 'tareaId'
          const id = parseInt(e.target.closest('.item-tarea').dataset.tareaId);
          if (e.target.checked) {
              this.completarTarea(id);
          }
      } 
      // Event delegation: Verifica si el click fue en el botón de eliminar
      else if (e.target.closest('.btn-eliminar')) {
          const btn = e.target.closest('.btn-eliminar');
          const id = parseInt(btn.closest('.item-tarea').dataset.tareaId);
          if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
              this.eliminarTarea(id);
          }
      }
  }

  eliminarTarea(id) {
    // Animación de salida antes de eliminar del estado
    const elemento = document.getElementById(`tarea-${id}`);
    if (elemento) {
      elemento.classList.add('eliminando');
      setTimeout(() => {
        this.tareas = this.tareas.filter(t => t.id !== id);
        this.guardarTareas();
        this.actualizarListaTareas(this.filtroActual);
        this.actualizarEstadisticas();
        this.mostrarNotificacion('Tarea eliminada.', 'info');
      }, 500); // Espera a que termine la animación CSS
    }
  }

  // ====================================================
  // 3. MÉTODOS DE TEMPORIZADOR POMODORO
  // ====================================================
  
  getProgresoCirculo() {
      const perimetro = 2 * Math.PI * 45; // Radio 45 del SVG
      const porcentaje = this.temporizador.tiempoRestante / this.temporizador.progresoTotal;
      return perimetro * porcentaje;
  }
  
  actualizarProgresoTemporizador() {
      const circulo = document.getElementById('pomodoro-progreso');
      const perimetro = 2 * Math.PI * 45;
      
      // La longitud del trazo es el perímetro total
      circulo.style.strokeDasharray = perimetro;
      
      // El desplazamiento del trazo (stroke-dashoffset) define la cantidad visible.
      circulo.style.strokeDashoffset = perimetro - this.getProgresoCirculo();
      
      // Cambiar color para el modo descanso (feedback visual)
      circulo.style.stroke = this.temporizador.modo === 'descanso' ? '#ff8f00' : 'var(--color-primario)';
  }

  iniciarTemporizador() {
    if (this.temporizador.activo) return;

    this.temporizador.activo = true;
    this.actualizarBotonesTemporizador();
    this.mostrarNotificacion(`Iniciando modo ${this.temporizador.modo}.`, 'info');

    this.temporizador.intervalo = setInterval(() => {
      this.temporizador.tiempoRestante--;

      if (this.temporizador.tiempoRestante <= 0) {
        this.completarSesion();
      } else {
        this.actualizarDisplayTemporizador();
        this.actualizarProgresoTemporizador();
      }
    }, 1000);
  }

  pausarTemporizador() {
    if (!this.temporizador.activo) return;
    this.temporizador.activo = false;
    clearInterval(this.temporizador.intervalo);
    this.actualizarBotonesTemporizador();
    this.mostrarNotificacion(`Temporizador pausado.`, 'info');
  }

  cambiarModoTemporizador(modo) {
    if (this.temporizador.modo === modo) return;

    // Pausar si estaba activo
    if (this.temporizador.activo) {
        this.pausarTemporizador();
    }
    
    this.temporizador.modo = modo;
    this.temporizador.tiempoRestante = modo === 'trabajo' ? this.TEMPORIZADOR_TRABAJO : this.TEMPORIZADOR_DESCANSO;
    this.temporizador.progresoTotal = this.temporizador.tiempoRestante;
    
    this.actualizarDisplayTemporizador();
    this.actualizarBotonesModo();
    this.actualizarProgresoTemporizador();
  }

  completarSesion() {
    this.pausarTemporizador();

    if (this.temporizador.modo === 'trabajo') {
      this.sesionesCompletadas++;
      // Sumar tiempo enfocado: 25 minutos
      this.tiempoEnfocado += Math.floor(this.TEMPORIZADOR_TRABAJO / 60); 
      localStorage.setItem('sesionesCompletadas', this.sesionesCompletadas);
      localStorage.setItem('tiempoEnfocado', this.tiempoEnfocado);

      this.mostrarNotificacion('¡Sesión de TRABAJO completada! Tómate un descanso de 5 minutos.', 'exito');

      // Cambiar automáticamente a descanso
      setTimeout(() => {
        this.cambiarModoTemporizador('descanso');
        this.iniciarTemporizador(); // Inicia el descanso automáticamente
      }, 1000);
    } else { // Modo descanso completado
      this.mostrarNotificacion('¡Descanso terminado! Es hora de volver al trabajo.', 'info');
      setTimeout(() => {
        this.cambiarModoTemporizador('trabajo');
      }, 1000);
    }

    this.actualizarInterfaz();
  }

  // ====================================================
  // 4. MÉTODOS DE UTILIDAD Y PERSISTENCIA
  // ====================================================

  // Persistencia
  cargarTareas() {
    const tareasGuardadas = localStorage.getItem('tareas');
    return tareasGuardadas ? JSON.parse(tareasGuardadas) : [];
  }

  guardarTareas() {
    localStorage.setItem('tareas', JSON.stringify(this.tareas));
  }
  
  // Modo oscuro
  toggleModoOscuro() {
    this.modoOscuro = !this.modoOscuro;
    localStorage.setItem('modoOscuro', this.modoOscuro);
    this.aplicarModoOscuro();
    this.mostrarNotificacion(this.modoOscuro ? 'Modo Oscuro activado' : 'Modo Claro activado', 'info');
  }

  // ====================================================
  // 5. MÉTODOS DE ACTUALIZACIÓN DE INTERFAZ (DOM)
  // ====================================================

  actualizarInterfaz() {
    this.actualizarEstadisticas();
    this.actualizarListaTareas(this.filtroActual);
    this.actualizarTemporizador(); // Refresca botones y modos
  }

  actualizarEstadisticas() {
    const tareasCompletadas = this.tareas.filter(t => t.completada).length;
    
    // Formatear tiempo de minutos totales (ej: 90 -> 1h 30m)
    const horas = Math.floor(this.tiempoEnfocado / 60);
    const minutos = this.tiempoEnfocado % 60;
    const tiempoFormateado = `${horas > 0 ? horas + 'h ' : ''}${minutos}m`;

    document.getElementById('tareas-completadas').textContent = tareasCompletadas;
    document.getElementById('tiempo-enfocado').textContent = tiempoFormateado;
    // La racha se deja en 0, ya que su lógica es más compleja y excede el ejercicio simple
    document.getElementById('racha-actual').textContent = 0; 
    document.getElementById('sesiones-hoy').textContent = this.sesionesCompletadas;
  }

  actualizarListaTareas(filtro) {
    this.filtroActual = filtro;
    const listaTareas = document.getElementById('lista-tareas');
    listaTareas.innerHTML = '';

    let tareasFiltradas = this.tareas;

    switch(filtro) {
      case 'pendientes':
        tareasFiltradas = this.tareas.filter(t => !t.completada);
        break;
      case 'completadas':
        tareasFiltradas = this.tareas.filter(t => t.completada);
        break;
      // 'todas' no necesita filtro
    }

    if (tareasFiltradas.length === 0) {
      listaTareas.innerHTML = '<div class="empty-state"><p>🎯 No hay tareas en esta categoría.</p></div>';
      return;
    }

    // Ordenar tareas: No completadas primero, luego por prioridad (alta > media > baja)
    const tareasOrdenadas = tareasFiltradas.sort((a, b) => {
        // 1. Prioridad de Completado (Pendientes primero)
        if (a.completada !== b.completada) {
            return a.completada ? 1 : -1;
        }

        // 2. Prioridad de Tarea
        const ordenPrioridad = { 'alta': 3, 'media': 2, 'baja': 1 };
        return ordenPrioridad[b.prioridad] - ordenPrioridad[a.prioridad];
    });

    tareasOrdenadas.forEach(tarea => {
      const elementoTarea = crearElementoTarea(tarea);
      listaTareas.appendChild(elementoTarea);
    });
  }

  filtrarTareas(filtro) {
      this.actualizarListaTareas(filtro);
  }
  
  actualizarTemporizador() {
      this.actualizarBotonesTemporizador();
      this.actualizarBotonesModo();
  }

  actualizarDisplayTemporizador() {
    const minutos = Math.floor(this.temporizador.tiempoRestante / 60);
    const segundos = this.temporizador.tiempoRestante % 60;
    const tiempoFormateado = `${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;

    document.getElementById('tiempo-restante').textContent = tiempoFormateado;
    // Actualizar título del documento para feedback visual
    document.title = `(${tiempoFormateado}) 🚀 Dashboard`;
  }

  actualizarBotonesTemporizador() {
    const btnIniciar = document.getElementById('btn-iniciar');
    const btnPausar = document.getElementById('btn-pausar');

    btnIniciar.disabled = this.temporizador.activo;
    btnPausar.disabled = !this.temporizador.activo;
  }

  actualizarBotonesModo() {
    document.querySelectorAll('[data-modo]').forEach(btn => {
      // Toggle la clase 'modo-activo'
      const esActivo = btn.dataset.modo === this.temporizador.modo;
      btn.classList.toggle('modo-activo', esActivo);
      // Actualizar ARIA para accesibilidad
      btn.setAttribute('aria-checked', esActivo);
    });
  }

  aplicarModoOscuro() {
    document.body.classList.toggle('modo-oscuro', this.modoOscuro);
    const btn = document.getElementById('btn-modo-oscuro');
    btn.textContent = this.modoOscuro ? '☀️' : '🌙';
    btn.setAttribute('aria-label', this.modoOscuro ? 'Cambiar a modo claro (Ctrl+D)' : 'Cambiar a modo oscuro (Ctrl+D)');
    // Asegura que el progreso del pomodoro se actualice con el nuevo color si cambia
    this.actualizarProgresoTemporizador(); 
  }

  // ====================================================
  // 6. EVENT LISTENERS y SHORTCUTS
  // ====================================================

  configurarEventListeners() {
    // 6.1. Modo Oscuro
    document.getElementById('btn-modo-oscuro').addEventListener('click', () => {
      this.toggleModoOscuro();
    });
    
    // 6.2. Gestión de Tareas (Event Delegation para elementos dinámicos)
    // El listener se coloca en el contenedor padre estático
    document.getElementById('lista-tareas').addEventListener('click', (e) => this.manejarEventoTarea(e));

    // 6.3. Modal y Formulario de Tareas
    this.configurarModalListeners();
    
    // 6.4. Filtros de Tareas
    document.querySelectorAll('.filtros-tareas button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.filtros-tareas button').forEach(b => b.classList.remove('filtro-activo'));
        btn.classList.add('filtro-activo');
        this.filtrarTareas(btn.dataset.filtro);
      });
    });

    // 6.5. Controles y Modos del Temporizador
    document.getElementById('btn-iniciar').addEventListener('click', () => this.iniciarTemporizador());
    document.getElementById('btn-pausar').addEventListener('click', () => this.pausarTemporizador());
    document.getElementById('btn-reiniciar').addEventListener('click', () => {
      this.pausarTemporizador();
      this.temporizador.tiempoRestante = this.temporizador.modo === 'trabajo' ? this.TEMPORIZADOR_TRABAJO : this.TEMPORIZADOR_DESCANSO;
      this.actualizarDisplayTemporizador();
      this.actualizarProgresoTemporizador();
    });

    document.querySelectorAll('[data-modo]').forEach(btn => {
      btn.addEventListener('click', () => this.cambiarModoTemporizador(btn.dataset.modo));
    });

    // 6.6. Shortcuts de teclado (Ctrl/Cmd + N y D)
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey) { // Ctrl en Windows/Linux, Cmd en Mac
        switch(e.key) {
          case 'n': // Ctrl/Cmd + N para nueva tarea
            e.preventDefault();
            document.getElementById('btn-agregar-tarea').click();
            break;
          case 'd': // Ctrl/Cmd + D para modo oscuro
            e.preventDefault();
            this.toggleModoOscuro();
            break;
        }
      }
    });
  }

  configurarModalListeners() {
      const btnAgregarTarea = document.getElementById('btn-agregar-tarea');
      const modal = document.getElementById('modal-tarea');
      const btnCerrarModal = document.getElementById('btn-cerrar-modal');
      const btnCancelar = document.getElementById('btn-cancelar');
      const formularioTarea = document.querySelector('.formulario-tarea');
      const tituloInput = document.getElementById('titulo-tarea');
      const errorTitulo = document.getElementById('error-titulo');

      const cerrarModal = () => {
          modal.classList.remove('visible');
          modal.setAttribute('aria-hidden', 'true');
          formularioTarea.reset();
          // Limpiar validación
          tituloInput.classList.remove('invalido');
          errorTitulo.textContent = '';
      };
      
      const abrirModal = () => {
          modal.classList.add('visible');
          modal.setAttribute('aria-hidden', 'false');
          tituloInput.focus(); // Enfocar el primer campo para accesibilidad
      };

      btnAgregarTarea.addEventListener('click', abrirModal);

      [btnCerrarModal, btnCancelar].forEach(btn => {
          btn.addEventListener('click', cerrarModal);
      });

      // Cerrar modal haciendo click fuera
      modal.addEventListener('click', (e) => {
          if (e.target === modal) {
              cerrarModal();
          }
      });
      
      // Validación en tiempo real (feedback visual)
      tituloInput.addEventListener('input', () => {
          if (tituloInput.value.trim().length === 0) {
              tituloInput.classList.add('invalido');
              errorTitulo.textContent = 'El título no puede estar vacío.';
          } else {
              tituloInput.classList.remove('invalido');
              errorTitulo.textContent = '';
          }
      });


      // Submit formulario tarea
      formularioTarea.addEventListener('submit', (e) => {
          e.preventDefault();

          const titulo = tituloInput.value.trim();
          const descripcion = document.getElementById('descripcion-tarea').value.trim();
          const prioridad = document.getElementById('prioridad-tarea').value;
          const fechaLimite = document.getElementById('fecha-limite').value;

          // Validación final
          if (titulo) {
              this.agregarTarea({
                  titulo,
                  descripcion,
                  prioridad,
                  fechaLimite: fechaLimite || null
              });
              cerrarModal();
          } else {
              // Si falla la validación al hacer submit
              tituloInput.classList.add('invalido');
              errorTitulo.textContent = 'El título no puede estar vacío.';
              tituloInput.focus();
          }
      });
  }

  // Feedback visual: Notificaciones
  mostrarNotificacion(mensaje, tipo = 'info') {
      const contenedor = document.getElementById('contenedor-notificaciones');
      const notificacion = document.createElement('div');
      notificacion.className = `notificacion notificacion-${tipo}`;
      notificacion.textContent = mensaje;

      // Estilos CSS dinámicos (mejora visual)
      switch (tipo) {
          case 'exito':
              notificacion.style.backgroundColor = '#28a745';
              break;
          case 'error':
              notificacion.style.backgroundColor = '#dc3545';
              break;
          case 'info':
          default:
              notificacion.style.backgroundColor = '#007bff';
              break;
      }

      contenedor.appendChild(notificacion);

      // Animar entrada
      setTimeout(() => notificacion.classList.add('visible'), 100);

      // Remover después de 3 segundos
      setTimeout(() => {
          notificacion.classList.remove('visible');
          // Esperar la animación de salida para remover del DOM
          setTimeout(() => notificacion.remove(), 300);
      }, 4000);
  }
}

// ====================================================
// 7. FUNCIONES DE UTILIDAD FUERA DE LA CLASE
//    (Separación de Responsabilidades: DOM Helpers)
// ====================================================

function crearElementoTarea(tarea) {
  const div = document.createElement('div');
  div.className = `item-tarea ${tarea.completada ? 'completada' : ''}`;
  div.setAttribute('role', 'listitem');
  div.setAttribute('id', `tarea-${tarea.id}`); // ID para animaciones de eliminación
  div.dataset.tareaId = tarea.id; // Almacena el ID para event delegation

  const prioridadClase = `prioridad-${tarea.prioridad}`;
  const iconoPrioridad = {
    alta: '🔴',
    media: '🟡',
    baja: '🟢'
  };

  const prioridadTexto = tarea.prioridad.charAt(0).toUpperCase() + tarea.prioridad.slice(1);
  
  // Usar una función para el HTML para mantener el código más limpio
  div.innerHTML = `
    <div class="contenido-tarea">
      <input type="checkbox" class="checkbox-tarea" ${tarea.completada ? 'checked' : ''} aria-label="Marcar tarea como completada">
      <div class="detalles-tarea">
        <h4 class="titulo-tarea">${tarea.titulo}</h4>
        ${tarea.descripcion ? `<p class="descripcion-tarea">${tarea.descripcion}</p>` : ''}
        <div class="meta-tarea">
          <span class="prioridad ${prioridadClase}" aria-label="Prioridad: ${prioridadTexto}">${iconoPrioridad[tarea.prioridad]} ${prioridadTexto}</span>
          ${tarea.fechaLimite ? `<span class="fecha-limite" aria-label="Fecha límite: ${formatearFecha(tarea.fechaLimite)}">📅 ${formatearFecha(tarea.fechaLimite)}</span>` : ''}
        </div>
      </div>
    </div>
    <button class="btn-eliminar" aria-label="Eliminar tarea">🗑️</button>
  `;

  // NOTA: Los event listeners del checkbox y el botón de eliminar NO se añaden aquí,
  // se manejan centralmente en el padre 'lista-tareas' (Event Delegation)
  // para mejorar el rendimiento y el manejo de elementos dinámicos.

  return div;
}

function formatearFecha(fechaString) {
  const fecha = new Date(fechaString + 'T00:00:00'); // Asegura que se interprete como local
  // Evitar problemas de zona horaria forzando la visualización de la fecha
  return fecha.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short'
  });
}


// ====================================================
// 8. INICIALIZACIÓN DE LA APLICACIÓN
// ====================================================

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar la aplicación después de que el DOM esté completamente cargado
    window.dashboard = new DashboardProductividad();
});