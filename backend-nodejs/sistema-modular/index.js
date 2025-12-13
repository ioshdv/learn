const GestorTareas = require('./services/gestor-tareas');

async function main() {
  const gestor = new GestorTareas();
  await gestor.inicializar();

  // Crear tareas
  gestor.crearTarea('Aprender Node.js', 'Completar tutoriales', 'alta');
  gestor.crearTarea('Practicar módulos', 'Crear sistema modular', 'media');
  gestor.crearTarea('Hacer ejercicio', '30 minutos de cardio', 'baja');

  await gestor.guardar();

  console.log('\n📊 Estadísticas actuales:');
  console.log(gestor.obtenerEstadisticas());

  // Exportar tareas
  await gestor.exportar('json', 'tareas_export.json');
  await gestor.exportar('csv', 'tareas_export.csv');

  console.log('\n🎯 Sistema modular completado exitosamente!');
}

main().catch(err => console.error('❌ Error:', err.message));
