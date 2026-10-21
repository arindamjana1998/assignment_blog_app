import api from './api';

export const postService = {
  /**
   * Fetch paginated public posts
   * @param {object} params - { page, limit, search, author, sort, order }
   * @returns {Promise<{ data: Post[], pagination: object }>}
   */
  async getPosts(params = {}) {
    const response = await api.get('/posts', { params });
    return response.data;
  },

  /**
   * Fetch a single post by its URL slug
   * @param {string} slug
   * @returns {Promise<object>}
   */
  async getPostBySlug(slug) {
    const response = await api.get(`/posts/slug/${slug}`);
    return response.data;
  },

  /**
   * Fetch a single post by its MongoDB ObjectId
   * @param {string} id
   * @returns {Promise<object>}
   */
  async getPostById(id) {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  /**
   * Create a new post
   * @param {object} payload - { title, content }
   * @returns {Promise<object>}
   */
  async createPost(payload) {
    const response = await api.post('/posts', payload);
    return response.data;
  },

  /**
   * Update an existing post
   * @param {string} id
   * @param {object} payload - { title, content }
   * @returns {Promise<object>}
   */
  async updatePost(id, payload) {
    const response = await api.patch(`/posts/${id}`, payload);
    return response.data;
  },

  /**
   * Soft-delete a post
   * @param {string} id
   * @returns {Promise<object>}
   */
  async deletePost(id) {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },
};

export default postService;
