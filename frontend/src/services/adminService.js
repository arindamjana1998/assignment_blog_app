import api from './api';

export const adminService = {
  /**
   * Fetch platform metrics
   * @returns {Promise<{ totalUsers: number, activeUsers: number, totalPosts: number, totalComments: number }>}
   */
  async getDashboardMetrics() {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  /**
   * Fetch paginated users list with search & filters
   * @param {object} params - { page, limit, search, role, isActive }
   * @returns {Promise<{ data: User[], pagination: object }>}
   */
  async getUsers(params = {}) {
    const response = await api.get('/admin/users', { params });
    return response.data;
  },

  /**
   * Fetch single user details and statistics
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getUserById(id) {
    const response = await api.get(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Update user role or account status
   * @param {string} id
   * @param {object} payload - { role?, isActive? }
   * @returns {Promise<object>}
   */
  async updateUser(id, payload) {
    const response = await api.patch(`/admin/users/${id}`, payload);
    return response.data;
  },

  /**
   * Delete user permanently
   * @param {string} id
   * @returns {Promise<object>}
   */
  async deleteUser(id) {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Fetch all posts (including soft-deleted) with filters
   * @param {object} params - { page, limit, search, author, isDeleted }
   * @returns {Promise<{ data: Post[], pagination: object }>}
   */
  async getPosts(params = {}) {
    const response = await api.get('/admin/posts', { params });
    return response.data;
  },

  /**
   * Update or restore post
   * @param {string} id
   * @param {object} payload - { title?, content?, isDeleted? }
   * @returns {Promise<object>}
   */
  async updatePost(id, payload) {
    const response = await api.patch(`/admin/posts/${id}`, payload);
    return response.data;
  },

  /**
   * Permanently hard-delete post with comment cascade
   * @param {string} id
   * @returns {Promise<object>}
   */
  async deletePost(id) {
    const response = await api.delete(`/admin/posts/${id}`);
    return response.data;
  },

  /**
   * Fetch all platform comments with filters
   * @param {object} params - { page, limit, post, author }
   * @returns {Promise<{ data: Comment[], pagination: object }>}
   */
  async getComments(params = {}) {
    const response = await api.get('/admin/comments', { params });
    return response.data;
  },

  /**
   * Permanently delete comment
   * @param {string} id
   * @returns {Promise<object>}
   */
  async deleteComment(id) {
    const response = await api.delete(`/admin/comments/${id}`);
    return response.data;
  },

  /**
   * Update comment content as admin
   * @param {string} id
   * @param {object} payload - { content }
   * @returns {Promise<object>}
   */
  async updateComment(id, payload) {
    const response = await api.patch(`/admin/comments/${id}`, payload);
    return response.data;
  },

  /**
   * Fetch paginated user activity audit logs
   * @param {object} params - { page, limit, event, search }
   * @returns {Promise<{ data: ActivityLog[], pagination: object }>}
   */
  async getActivityLogs(params = {}) {
    const response = await api.get('/admin/activity-logs', { params });
    return response.data;
  },
};

export default adminService;
