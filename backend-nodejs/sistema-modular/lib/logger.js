class Logger {
  constructor() {
    this.mensajes = [];
  }

  log(accion, detalle = '') {
    const timestamp = new Date().toISOString();
    const mensaje = `[${timestamp}] ${accion} ${detalle}`;
    console.log(mensaje);
    this.mensajes.push(mensaje);
  }

  obtenerHistorial() {
    return [...this.mensajes];
  }
}

module.exports = new Logger(); // Singleton
