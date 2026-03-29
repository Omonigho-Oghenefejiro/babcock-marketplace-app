import axios from 'axios';

// Use localhost in tests/dev, production Railway URL in production
const isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test' || typeof import !== 'undefined' && (import.meta?.env?.MODE === 'test' || import.meta?.env?.VITEST);

const DEFAULT_API_BASE_URL = isTest || import.meta.env.DEV
  ? 'http://localhost:5000/api'
  : 'https://babcock-marketplace-app-production.up.railway.app/api';

const normalizeApiBaseUrl = (raw: string | undefined) => {
  const trimmed = String(raw || '').trim();
  
  // If not provided or empty, use default
  if (!trimmed) {
    return DEFAULT_API_BASE_URL;
  }
  
  // If explicitly provided, normalize it
  let value = trimmed;
  if (!/^https?:\/\//i.test(value)) {
    value = `https://${value.replace(/^\/+/, '')}`;
  }
  value = value.replace(/\/+$/, '');
  
  // Only add /api if it doesn't already end with /api or a version pattern like /v1
  if (!/\/api$/i.test(value) && !/\/v\d+$/i.test(value)) {
    value = `${value}/api`;
  }
  return value;
};

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_BASE_URL);

const getAccessToken = () => sessionStorage.getItem('token') || localStorage.getItem('token');
const getRefreshToken = () => sessionStorage.getItem('refreshToken') || localStorage.getItem('refreshToken');

const storeTokens = (accessToken: string, refreshToken?: string) => {
  sessionStorage.setItem('token', accessToken);
  localStorage.removeItem('token');

  if (refreshToken) {
    sessionStorage.setItem('refreshToken', refreshToken);
    localStorage.removeItem('refreshToken');
  }
};

const clearTokens = () => {
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as any;
    const status = error?.response?.status;
    const requestUrl = String(originalRequest?.url || '');

    if (status !== 401 || originalRequest?._retry || requestUrl.includes('/auth/refresh-token')) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      return Promise.reject(error);
    }

    try {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = axios
          .post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken }, { headers: { 'Content-Type': 'application/json' } })
          .then(({ data }) => {
            if (!data?.token) {
              return null;
            }
            storeTokens(data.token, data.refreshToken);
            return data.token as string;
          })
          .catch(() => {
            clearTokens();
            return null;
          })
          .finally(() => {
            refreshPromise = null;
          });
      }

      const nextAccessToken = await refreshPromise;
      if (!nextAccessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      clearTokens();
      return Promise.reject(refreshError);
    }
  }
);

export default api;
