import { http } from "./http";

export const api = {
  // auth/user
  me: () => http.get("/api/users/me").then(r => r.data),

  // projects
  getProjects: () => http.get("/api/projects").then(r => r.data),
  createProject: (payload) => http.post("/api/projects", payload).then(r => r.data),
  updateProject: (id, payload) => http.put(`/api/projects/${id}`, payload).then(r => r.data),
  deleteProject: (id) => http.delete(`/api/projects/${id}`).then(r => r.data),

  // tasks
  getTasks: (params = {}) => http.get("/api/tasks", { params }).then(r => r.data),
  createTask: (payload) => http.post("/api/tasks", payload).then(r => r.data),
  updateTask: (id, payload) => http.put(`/api/tasks/${id}`, payload).then(r => r.data),
  deleteTask: (id) => http.delete(`/api/tasks/${id}`).then(r => r.data),

  // attachments
  uploadTaskAttachment: (taskId, file) => {
    const form = new FormData();
    form.append("file", file);
    return http
      .post(`/api/tasks/${taskId}/attachments`, form, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      .then(r => r.data);
  },

  // avatar ✅ FIX: backend usa /api/users/avatar
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append("file", file);
    return http
      .post("/api/users/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      .then(r => r.data);
  }
};
