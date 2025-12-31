import axios from 'axios';

const API_URL = '/api/productos';
const cache = new Map();

export const productService = {
  // Implementación de Caching
  getProductos: async (forceRefresh = false) => {
    if (!forceRefresh && cache.has('lista_productos')) {
      console.log("[Cache] Retornando datos desde memoria");
      return cache.get('lista_productos');
    }

    // Implementación de Métricas de Rendimiento
    const start = performance.now();
    
    try {
      const response = await axios.get(API_URL);
      const end = performance.now();
      
      console.log(`[Métricas] Tiempo de respuesta del servidor: ${(end - start).toFixed(2)}ms`);
      
      cache.set('lista_productos', response.data);
      return response.data;
    } catch (error) {
      console.error("Error en la petición", error);
      throw error;
    }
  },

  createProducto: async (formData) => {
    const start = performance.now();
    const response = await axios.post(API_URL, formData);
    const end = performance.now();
    
    console.log(`[Métricas] Tiempo de subida y creación: ${(end - start).toFixed(2)}ms`);
    
    // Invalidar cache tras crear uno nuevo
    cache.delete('lista_productos');
    return response.data;
  }
};