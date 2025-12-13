function validarTarea(tarea) {
  if (!tarea.titulo || typeof tarea.titulo !== 'string') {
    throw new Error('El título de la tarea es obligatorio y debe ser un string');
  }
  const prioridadesValidas = ['baja', 'media', 'alta'];
  if (!prioridadesValidas.includes(tarea.prioridad)) {
    throw new Error(`Prioridad inválida. Debe ser: ${prioridadesValidas.join(', ')}`);
  }
  return true;
}

module.exports = {
  validarTarea
};
