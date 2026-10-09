import axios from 'axios';

export const TOKEN_STORAGE_KEY = 'cc_token';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach current Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Ignore storage access errors (e.g. strict privacy modes)
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: handle 401 Unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const requestUrl = error.config?.url || '';
      // Don't intercept 401 from login or register endpoints so forms can show invalid credentials error
      const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');

      if (!isAuthEndpoint) {
        try {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch {
          // Ignore storage errors
        }
        delete api.defaults.headers.common.Authorization;

        if (typeof window !== 'undefined') {
          // Notify AuthContext to clear in-memory state
          window.dispatchEvent(new CustomEvent('campusconnect:unauthorized'));

          // Only redirect if user is not already on a public authentication page
          const currentPath = window.location.pathname;
          if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;

