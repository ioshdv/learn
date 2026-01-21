import axios from "axios";

const baseURL =
  process.env.REACT_APP_API_URL || "http://localhost:3001";

export const http = axios.create({
  baseURL,
  timeout: 20000
});

function getAccessToken() {
  return localStorage.getItem("accessToken");
}
function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

http.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshing = false;
let queue = [];

function resolveQueue(error, token = null) {
  queue.forEach(p => (error ? p.reject(error) : p.resolve(token)));
  queue = [];
}

http.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (!original) return Promise.reject(err);

    // si no es 401 o ya reintentamos, devolver error
    if (err.response?.status !== 401 || original.__retried) {
      return Promise.reject(err);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return Promise.reject(err);
    }

    // cola si ya estamos refrescando
    if (refreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then(() => {
        original.__retried = true;
        const token = getAccessToken();
        original.headers.Authorization = `Bearer ${token}`;
        return http(original);
      });
    }

    refreshing = true;

    try {
      const resp = await axios.post(`${baseURL}/api/auth/refresh`, { refreshToken });
      localStorage.setItem("accessToken", resp.data.accessToken);
      localStorage.setItem("refreshToken", resp.data.refreshToken);

      resolveQueue(null, resp.data.accessToken);

      original.__retried = true;
      original.headers.Authorization = `Bearer ${resp.data.accessToken}`;
      return http(original);
    } catch (e) {
      resolveQueue(e, null);
      // tokens inválidos => limpiar sesión
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      return Promise.reject(e);
    } finally {
      refreshing = false;
    }
  }
);
