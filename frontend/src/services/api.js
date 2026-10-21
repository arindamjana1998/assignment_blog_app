import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';

let inMemoryToken = null;
let isRefreshing = false;
let failedQueue = [];

// Callback invoked when refresh token fails permanently (triggering logout in AuthContext)
let onUnauthenticatedCallback = null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
};

export const getAuthToken = () => inMemoryToken;

export const setOnUnauthenticated = (callback) => {
  onUnauthenticatedCallback = callback;
};

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Sends and receives HttpOnly refresh cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: Attach Access Token
api.interceptors.request.use(
  (config) => {
    if (inMemoryToken && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${inMemoryToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Silent Token Refresh Queue on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Guard: Ignore if no config or request was already retried
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Do not attempt refresh on auth endpoints (login, register, refresh itself)
    const isAuthRoute =
      originalRequest.url.includes('/auth/login') ||
      originalRequest.url.includes('/auth/register') ||
      originalRequest.url.includes('/auth/refresh');

    if (error.response?.status === 401 && !isAuthRoute) {
      if (isRefreshing) {
        // Queue this request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt silent rotation using HttpOnly cookie
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data?.data?.accessToken;
        if (!newAccessToken) {
          throw new Error('Refresh response missing access token');
        }

        setAuthToken(newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAuthToken(null);

        if (typeof onUnauthenticatedCallback === 'function') {
          onUnauthenticatedCallback();
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
