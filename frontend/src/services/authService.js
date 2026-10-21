import api from './api';

export const authService = {
  /**
   * Register a new user
   * @param {object} payload - { name, email, password }
   * @returns {Promise<object>}
   */
  async register(payload) {
    const response = await api.post('/auth/register', payload);
    return response.data;
  },

  /**
   * User login with credentials
   * @param {object} payload - { email, password }
   * @returns {Promise<object>}
   */
  async login(payload) {
    const response = await api.post('/auth/login', payload);
    return response.data;
  },

  /**
   * Silent refresh token rotation
   * @returns {Promise<object>}
   */
  async refreshToken() {
    const response = await api.post('/auth/refresh');
    return response.data;
  },

  /**
   * Invalidate active session and clear cookie
   * @param {object} [payload] - Optional session payload e.g. { email }
   * @returns {Promise<object>}
   */
  async logout(payload = {}) {
    const response = await api.post('/auth/logout', payload);
    return response.data;
  },


  /**
   * Fetch authenticated user profile
   * @returns {Promise<object>}
   */
  async getMe() {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export default authService;
