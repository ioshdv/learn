import apiClient from "../api/axiosInstance";

/**
 * REQUERIMIENTO: Obtener lista de publicaciones.
 * Se comunica con GET /api/posts
 */
export const fetchPosts = async () => {
  const response = await apiClient.get("/posts");
  return response.data;
};

/**
 * REQUERIMIENTO: Incrementar Likes.
 * Se comunica con POST /api/posts/:id/like
 * @param {number|string} id - ID de la publicación
 */
export const likePost = async (id) => {
  const response = await apiClient.post(`/posts/${id}/like`);
  return response.data;
};

/**
 * REQUERIMIENTO: Enviar datos del formulario al backend.
 * Se comunica con POST /api/posts/contact
 * @param {Object} contactData - { name, email, message }
 */
export const submitContact = async (contactData) => {
  const response = await apiClient.post("/posts/contact", contactData);
  return response.data;
};