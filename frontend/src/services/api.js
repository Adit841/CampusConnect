import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor — attaches the Bearer token if one is stored.
 *
 * TODO (Aman – auth module): Replace localStorage token reading with the
 * token provided by the real AuthContext / token-refresh mechanism.
 * The chat module stores tokens under the key 'cc_token'.
 * Ensure the auth module uses the same key, or update this interceptor.
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('cc_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Response interceptor — stub for 401 handling.
 * TODO (Aman – auth module): Add token-refresh logic here when ready.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or missing — auth module should handle redirect/refresh.
      console.warn('[api] 401 Unauthorized — user may need to log in again.');
    }
    return Promise.reject(error);
  }
);

export default api;
