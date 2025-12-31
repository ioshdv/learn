import { useState, useCallback } from "react";

/**
 * REQUERIMIENTO: Hook personalizado para gestionar peticiones HTTP.
 * Proporciona estados de carga (loading) y error de forma centralizada.
 */
export const useHttp = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Ejecuta una función asíncrona (servicio) gestionando sus estados.
   * @param {Function} callback - Función del servicio (ej: fetchPosts).
   * @param {any} params - Parámetros para la función del servicio.
   */
  const request = useCallback(async (callback, ...params) => {
    setLoading(true);
    setError(null);

    try {
      // Ejecutamos la petición pasando los parámetros
      const data = await callback(...params);
      return data;
    } catch (err) {
      // Capturamos el mensaje de error procesado por el interceptor de Axios
      const errorMessage = err.message || "Algo salió mal";
      setError(errorMessage);
      throw err; // Re-lanzamos para manejo específico en el componente si es necesario
    } finally {
      setLoading(false);
    }
  }, []);

  // Limpiar el estado de error manualmente si fuera necesario
  const clearError = () => setError(null);

  return {
    loading,
    error,
    request,
    clearError
  };
};