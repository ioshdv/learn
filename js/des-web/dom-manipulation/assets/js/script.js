// Elementos del DOM
const contenedor = document.querySelector('.contenedor');
const formAgregar = document.getElementById('form-agregar');
const inputTarea = document.getElementById('input-tarea');
const inputCategoria = document.getElementById('input-categoria');
const listaTareas = document.getElementById('lista-tareas');
const emptyState = document.querySelector('.empty-state');

// Búsqueda y Filtros
const inputBusqueda = document.getElementById('input-busqueda');
const selectCategoriaFiltro = document.getElementById('select-categoria');
const filtroBtnsContainer = document.querySelector('.filtros');
let filtroActual = 'todas'; // Estado para filtro de completadas/pendientes
let terminoBusqueda = ''; // Estado para búsqueda
let categoriaFiltro = ''; // Estado para filtro de categoría

// Botones de Acción
const btnToggleTheme = document.getElementById('btn-toggle-theme');
const btnExportJson = document.getElementById('btn-export-json');
const btnExportCsv = document.getElementById('btn-export-csv');

// Estadísticas
const stats = {
  total: document.getElementById('total-tareas'),
  completadas: document.getElementById('tareas-completadas'),
  pendientes: document.getElementById('tareas-pendientes')
};

// Almacenamiento y Estado
let tareas = JSON.parse(localStorage.getItem('tareas')) || [];

// --- Funciones de Persistencia ---

/**
 * Guarda el array de tareas en localStorage y el tema actual.
 */
function guardarEstado() {
  localStorage.setItem('tareas', JSON.stringify(tareas));
  // También guardar el estado del tema
  localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
}

/**
 * Carga el estado inicial de la lista.
 */
function cargarEstadoInicial() {
  // Cargar tema
  const savedTheme = localStorage.getItem('theme') || 'light';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
    btnToggleTheme.querySelector('i').className = 'fas fa-sun';
  } else {
    document.body.classList.remove('dark-mode');
    btnToggleTheme.querySelector('i').className = 'fas fa-moon';
  }

  // Inicializar la vista
  actualizarEstadisticas();
  renderTareas();
}

// --- Funciones de Utilidad ---

/**
 * Actualiza los contadores de Total, Completadas y Pendientes.
 */
function actualizarEstadisticas() {
  const total = tareas.length;
  const completadas = tareas.filter(t => t.completada).length;
  const pendientes = total - completadas;

  stats.total.textContent = total;
  stats.completadas.textContent = completadas;
  stats.pendientes.textContent = pendientes;

  // Usa delegation en el contenedor de filtros para no buscar este botón aquí
  const btnLimpiar = document.getElementById('btn-limpiar-completadas');
  btnLimpiar.style.display = completadas > 0 ? 'block' : 'none';
}

/**
 * Crea el HTML de un elemento de tarea.
 * @param {object} tarea - El objeto tarea.
 * @returns {string} - El string HTML para el elemento de la tarea.
 */
function crearHTMLTarea(tarea) {
  const isCompleted = tarea.completada ? 'completed' : '';
  const tagClass = `categoria-${tarea.categoria}`;

  // Se añaden los atributos draggable="true" y data-id para Drag and Drop
  return `
    <div class="tarea ${isCompleted}" data-id="${tarea.id}" draggable="true">
      <input type="checkbox" class="checkbox" ${tarea.completada ? 'checked' : ''}>
      <span class="tag-categoria ${tagClass}">${tarea.categoria}</span>
      <span class="texto-tarea">${tarea.texto}</span>
      
      <input type="text" class="editor" value="${tarea.texto}" maxlength="100">
      <select class="select-editor-categoria" style="display: none;">
        <option value="Personal" ${tarea.categoria === 'Personal' ? 'selected' : ''}>Personal</option>
        <option value="Trabajo" ${tarea.categoria === 'Trabajo' ? 'selected' : ''}>Trabajo</option>
        <option value="Estudio" ${tarea.categoria === 'Estudio' ? 'selected' : ''}>Estudio</option>
        <option value="Otro" ${tarea.categoria === 'Otro' ? 'selected' : ''}>Otro</option>
      </select>
      
      <div class="acciones">
        <button class="btn btn-small btn-primary btn-editar">Editar</button>
        <button class="btn btn-small btn-danger btn-eliminar">Eliminar</button>
      </div>
    </div>
  `;
}

/**
 * Aplica los filtros actuales (estado, búsqueda, categoría) y renderiza el DOM.
 * EVITA manipulación innecesaria: solo actualiza el innerHTML si es necesario.
 */
function renderTareas() {
  // 1. Aplicar filtros y búsqueda
  const tareasFiltradas = tareas.filter(t => {
    // Filtro por Completadas/Pendientes/Todas
    const filtroEstado = filtroActual === 'todas' ||
      (filtroActual === 'completadas' && t.completada) ||
      (filtroActual === 'pendientes' && !t.completada);

    // Filtro por Categoría
    const filtroCategoria = categoriaFiltro === '' || t.categoria === categoriaFiltro;

    // Búsqueda en tiempo real
    const busqueda = terminoBusqueda === '' || t.texto.toLowerCase().includes(terminoBusqueda.toLowerCase());

    return filtroEstado && filtroCategoria && busqueda;
  });

  // 2. Generar el HTML
  if (tareasFiltradas.length === 0) {
    // Si no hay tareas, mostrar empty state.
    listaTareas.innerHTML = '';
    listaTareas.appendChild(emptyState);
    return;
  }

  // 3. Renderizar (Manipulación del DOM)
  const nuevoHTML = tareasFiltradas.map(crearHTMLTarea).join('');

  // Optimización de rendimiento: Solo actualiza el DOM si el contenido es diferente.
  // Esto previene redibujados innecesarios durante la búsqueda en tiempo real.
  if (listaTareas.innerHTML !== nuevoHTML) {
    listaTareas.innerHTML = nuevoHTML;
  }
}

// --- Implementación de Funcionalidades Extendidas ---

// --- 1. Modo Oscuro/Claro (Dark/Light Mode) ---

btnToggleTheme.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const isDarkMode = document.body.classList.contains('dark-mode');
  btnToggleTheme.querySelector('i').className = isDarkMode ? 'fas fa-sun' : 'fas fa-moon';
  guardarEstado();
});

// --- 2. Búsqueda en Tiempo Real y Filtro de Categoría ---

inputBusqueda.addEventListener('input', (e) => {
  terminoBusqueda = e.target.value.trim();
  renderTareas(); // Re-renderiza la lista con el nuevo término
});

selectCategoriaFiltro.addEventListener('change', (e) => {
  categoriaFiltro = e.target.value;
  renderTareas(); // Re-renderiza la lista con el nuevo filtro
});

// --- 3. Delegación de Eventos (Event Delegation) ---

listaTareas.addEventListener('click', (e) => {
  const tareaElement = e.target.closest('.tarea');
  if (!tareaElement) return; // No es un elemento de tarea

  const tareaId = parseInt(tareaElement.dataset.id);
  const tareaIndex = tareas.findIndex(t => t.id === tareaId);
  if (tareaIndex === -1) return;

  const tarea = tareas[tareaIndex];

  // A. Delegación para el Checkbox (Completar/Descompletar)
  if (e.target.classList.contains('checkbox')) {
    tarea.completada = e.target.checked;
    tareaElement.classList.toggle('completed', tarea.completada);
    guardarEstado();
    actualizarEstadisticas();
    renderTareas(); // Re-renderiza para aplicar el filtro de estado si es necesario
    return;
  }

  // B. Delegación para Editar
  if (e.target.classList.contains('btn-editar')) {
    const isEditing = tareaElement.classList.contains('editando');
    const editorInput = tareaElement.querySelector('.editor');
    const editorSelect = tareaElement.querySelector('.select-editor-categoria');

    if (isEditing) {
      // Guardar cambios
      const nuevoTexto = editorInput.value.trim();
      const nuevaCategoria = editorSelect.value;
      if (nuevoTexto) {
        tarea.texto = nuevoTexto;
        tarea.categoria = nuevaCategoria;
        guardarEstado();
        // Optimización: Actualizar solo el HTML dentro del elemento de tarea
        tareaElement.querySelector('.texto-tarea').textContent = nuevoTexto;
        const tag = tareaElement.querySelector('.tag-categoria');
        tag.textContent = nuevaCategoria;
        tag.className = `tag-categoria categoria-${nuevaCategoria}`;
      }
      tareaElement.classList.remove('editando');
      e.target.textContent = 'Editar';
    } else {
      // Entrar en modo edición
      editorInput.value = tarea.texto; // Asegura que el valor sea el actual
      editorSelect.value = tarea.categoria; // Asegura que el valor sea el actual
      tareaElement.classList.add('editando');
      editorInput.focus();
      editorInput.select();
      e.target.textContent = 'Guardar';
    }
    return;
  }

  // C. Delegación para Eliminar
  if (e.target.classList.contains('btn-eliminar')) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
      tareaElement.classList.add('removing');
      setTimeout(() => {
        tareas.splice(tareaIndex, 1);
        guardarEstado();
        actualizarEstadisticas();
        renderTareas(); // Re-renderiza para actualizar el empty state
      }, 300);
    }
    return;
  }
});

// Event delegation para el botón de Limpiar Completadas
filtroBtnsContainer.addEventListener('click', (e) => {
  if (e.target.id === 'btn-limpiar-completadas') {
    if (confirm('¿Estás seguro de que quieres eliminar todas las tareas completadas?')) {
      tareas = tareas.filter(t => !t.completada);
      guardarEstado();
      actualizarEstadisticas();
      renderTareas();
    }
    return;
  }

  // Event delegation para los botones de filtro de estado
  if (e.target.classList.contains('filtro-btn')) {
    // Remover 'active' de todos los botones de filtro
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('active'));
    // Agregar 'active' al botón clickeado
    e.target.classList.add('active');
    filtroActual = e.target.dataset.filtro;
    renderTareas();
    return;
  }
});


// --- 4. Agregar Nueva Tarea ---

formAgregar.addEventListener('submit', (e) => {
  e.preventDefault();
  const texto = inputTarea.value.trim();
  const categoria = inputCategoria.value;

  if (texto) {
    const nuevaTarea = {
      id: Date.now(),
      texto: texto,
      completada: false,
      categoria: categoria, // Añadida la categoría
      fechaCreacion: new Date().toISOString()
    };
    tareas.push(nuevaTarea);
    inputTarea.value = '';
    
    // Optimizamos: solo guardamos y actualizamos stats
    guardarEstado();
    actualizarEstadisticas();

    // Renderizamos de nuevo para asegurar que el nuevo elemento se muestre si aplica con los filtros
    renderTareas();
  }
});

// --- 5. Funcionalidad de Arrastrar y Soltar (Drag and Drop) ---

let dragStartIndex;

// Delegation para eventos de Drag (Arrastrar)

listaTareas.addEventListener('dragstart', (e) => {
  if (e.target.classList.contains('tarea')) {
    e.target.classList.add('dragging');
    dragStartIndex = Array.from(listaTareas.children).indexOf(e.target);
    e.dataTransfer.setData('text/plain', dragStartIndex); // Datos a transferir (índice)
  }
});

listaTareas.addEventListener('dragend', (e) => {
  if (e.target.classList.contains('tarea')) {
    e.target.classList.remove('dragging');
  }
});

listaTareas.addEventListener('dragover', (e) => {
  e.preventDefault(); // Necesario para permitir el 'drop'
  const draggingElement = document.querySelector('.dragging');
  if (draggingElement) {
    const afterElement = obtenerElementoDespues(listaTareas, e.clientY);
    
    // Evitar manipulación innecesaria: solo mover si es un lugar diferente
    if (afterElement == null) {
      if (listaTareas.lastElementChild !== draggingElement) {
        listaTareas.appendChild(draggingElement);
      }
    } else {
      if (afterElement !== draggingElement.nextSibling) {
        listaTareas.insertBefore(draggingElement, afterElement);
      }
    }
  }
});

listaTareas.addEventListener('drop', (e) => {
  e.preventDefault();
  const draggedElement = document.querySelector('.dragging');
  if (!draggedElement) return;

  const dropIndex = Array.from(listaTareas.children).indexOf(draggedElement);
  
  // Reordenar el array de tareas (Modelo)
  const [removed] = tareas.splice(dragStartIndex, 1);
  tareas.splice(dropIndex, 0, removed);
  
  // El DOM ya fue reordenado en el evento dragover, solo falta guardar
  guardarEstado(); 
  draggedElement.classList.remove('dragging');
});

/**
 * Función auxiliar para determinar dónde insertar el elemento arrastrado.
 * @param {HTMLElement} contenedor - El contenedor de la lista.
 * @param {number} y - La posición Y del cursor.
 * @returns {HTMLElement|null} - El elemento después del cual se debe insertar, o null.
 */
function obtenerElementoDespues(contenedor, y) {
  const elementosArrastrables = [...contenedor.querySelectorAll('.tarea:not(.dragging)')];

  return elementosArrastrables.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    // Si la posición Y está por encima del centro del elemento y es el más cercano
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// --- 6. Persistencia en diferentes formatos (JSON, CSV) ---

/**
 * Descarga el contenido como un archivo.
 * @param {string} filename - Nombre del archivo.
 * @param {string} text - Contenido del archivo.
 * @param {string} mimeType - Tipo MIME.
 */
function downloadFile(filename, text, mimeType) {
  const element = document.createElement('a');
  element.setAttribute('href', `data:${mimeType};charset=utf-8,${encodeURIComponent(text)}`);
  element.setAttribute('download', filename);

  element.style.display = 'none';
  document.body.appendChild(element);

  element.click();

  document.body.removeChild(element);
}

btnExportJson.addEventListener('click', () => {
  const json = JSON.stringify(tareas, null, 2); // 2 espacios de indentación para mejor lectura
  downloadFile('tareas.json', json, 'application/json');
});

btnExportCsv.addEventListener('click', () => {
  // Encabezados del CSV
  const headers = ['id', 'texto', 'completada', 'categoria', 'fechaCreacion'];
  let csv = headers.join(',') + '\n';

  // Cuerpo del CSV
  tareas.forEach(tarea => {
    // Usamos una función simple para escapar comas en el texto si es necesario
    const escape = (value) => `"${String(value).replace(/"/g, '""')}"`;
    const row = [
      escape(tarea.id),
      escape(tarea.texto),
      tarea.completada,
      escape(tarea.categoria),
      tarea.fechaCreacion
    ].join(',');
    csv += row + '\n';
  });

  downloadFile('tareas.csv', csv, 'text/csv');
});


// --- Inicialización ---
cargarEstadoInicial();