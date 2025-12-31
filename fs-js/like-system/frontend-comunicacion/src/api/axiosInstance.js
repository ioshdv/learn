import axios from "axios";

/**
 * REQUERIMIENTO: Crear instancia de Axios con Base URL configurada.
 * Esto permite centralizar la dirección del backend (puerto 4000).
 */
const apiClient = axios.create({
  baseURL: "http://localhost:4000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * REQUERIMIENTO: Implementar interceptores.
 * Este interceptor de respuesta maneja errores globales (401, 404, 500) 
 * y errores de conexión.
 */
apiClient.interceptors.response.use(
  (response) => {
    // Si la respuesta es exitosa, la devolvemos tal cual
    return response;
  },
  (error) => {
    // Si no hay respuesta del servidor (error de red)
    if (!error.response) {
      return Promise.reject(new Error("No se puede conectar con el servidor. Verifique su conexión."));
    }

    // Extraer el mensaje de error enviado por el backend (definido en app.js)
    const message = error.response.data.error || "Ocurrió un error inesperado.";
    
    // Rechazamos la promesa con un objeto de error limpio
    return Promise.reject(new Error(message));
  }
);

export default apiClient;