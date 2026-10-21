/**
 * Centralized Application Configuration & Environment Variables
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const FRONTEND_URL =
  import.meta.env.VITE_FRONTEND_URL ||
  (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

// Backend root (origin) for direct OAuth triggers
export const BACKEND_ROOT_URL = API_BASE_URL.replace(/\/api\/v1\/?$/, '');

export const ROLES = Object.freeze({
  USER: 'user',
  ADMIN: 'admin',
});

export default {
  API_BASE_URL,
  FRONTEND_URL,
  BACKEND_ROOT_URL,
  ROLES,
};
