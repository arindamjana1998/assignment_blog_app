import api from './api';

export const commentService = {
  /**
   * Fetch paginated comments for a post
   * @param {string} postId
   * @param {object} params - { page, limit }
   * @returns {Promise<{ data: Comment[], pagination: object }>}
   */
  async getCommentsByPost(postId, params = {}) {
    const response = await api.get(`/posts/${postId}/comments`, { params });
    return response.data;
  },

  /**
   * Add a comment to an active post
   * @param {string} postId
   * @param {object} payload - { content }
   * @returns {Promise<object>}
   */
  async createComment(postId, payload) {
    const response = await api.post(`/posts/${postId}/comments`, payload);
    return response.data;
  },

  /**
   * Update comment content
   * @param {string} commentId
   * @param {object} payload - { content }
   * @returns {Promise<object>}
   */
  async updateComment(commentId, payload) {
    const response = await api.patch(`/comments/${commentId}`, payload);
    return response.data;
  },

  /**
   * Delete comment
   * @param {string} commentId
   * @returns {Promise<object>}
   */
  async deleteComment(commentId) {
    const response = await api.delete(`/comments/${commentId}`);
    return response.data;
  },
};

export default commentService;
