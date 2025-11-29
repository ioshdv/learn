console.log("=== SISTEMA DE TAREAS (TODO LIST) CON CLOSURES ===\n");

// 1. Crear un todo list usando closure para mantener estado privado
function crearTodoList() {
  let tareas = []; // Estado privado

  return {
    // Agregar tareas con parámetros avanzados
    agregarTarea: (titulo, descripcion = "Sin descripción") => {
      const tarea = {
        id: tareas.length + 1,
        titulo,
        descripcion,
        completada: false,
        fechaCreacion: new Date().toLocaleString()
      };
      tareas.push(tarea);
      console.log(`✅ Tarea agregada: "${titulo}"`);
    },

    // Marcar tarea como completada
    completarTarea: (id) => {
      const tarea = tareas.find(t => t.id === id);
      if (tarea) {
        tarea.completada = true;
        console.log(`✔️ Tarea completada: "${tarea.titulo}"`);
      } else {
        console.log(`❌ Tarea con id ${id} no encontrada`);
      }
    },

    // Filtrar tareas por estado
    filtrarTareas: (completada) => {
      const filtradas = tareas.filter(t => t.completada === completada);
      console.log(`\n📋 Tareas ${completada ? "completadas" : "pendientes"}:`);
      filtradas.forEach(t => console.log(`- ${t.titulo} (${t.descripcion})`));
      return filtradas;
    },

    // Obtener estadísticas
    obtenerEstadisticas: () => {
      const total = tareas.length;
      const completadas = tareas.filter(t => t.completada).length;
      const pendientes = total - completadas;
      console.log(`\n📊 Estadísticas: Total: ${total}, Completadas: ${completadas}, Pendientes: ${pendientes}`);
      return { total, completadas, pendientes };
    },

    // Obtener todas las tareas (copia para proteger estado)
    obtenerTareas: () => [...tareas]
  };
}

// Uso del sistema de tareas
const miTodoList = crearTodoList();

miTodoList.agregarTarea("Estudiar closures", "Revisar ejemplos y ejercicios");
miTodoList.agregarTarea("Practicar arrow functions");
miTodoList.agregarTarea("Hacer ejercicio", "30 minutos de cardio");

miTodoList.completarTarea(2);

miTodoList.filtrarTareas(false); // pendientes
miTodoList.filtrarTareas(true);  // completadas

miTodoList.obtenerEstadisticas();
console.log("\nTodas las tareas:", miTodoList.obtenerTareas());
