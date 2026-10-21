import api from './api';

export const userService = {
  /**
   * Get current user profile
   * @returns {Promise<object>}
   */
  async getProfile() {
    const response = await api.get('/users/me');
    return response.data;
  },

  /**
   * Update user profile (name, avatar, and optional password change)
   * @param {object} payload - { name, avatar, currentPassword, newPassword }
   * @returns {Promise<object>}
   */
  async updateProfile(payload) {
    const response = await api.patch('/users/me', payload);
    return response.data;
  },
};

export default userService;
