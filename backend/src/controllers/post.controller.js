import PostService from '../services/post.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { MESSAGES } from '../constants/messages.js';

export class PostController {
  /**
   * Create post
   * POST /api/v1/posts
   */
  static async createPost(req, res) {
    const post = await PostService.createPost({
      title: req.body.title,
      content: req.body.content,
      authorId: req.user._id,
    });

    return ApiResponse.created(res, MESSAGES.POST_CREATED, { post });
  }

  /**
   * List public posts with pagination, search, sorting
   * GET /api/v1/posts
   */
  static async getPosts(req, res) {
    const { posts, pagination } = await PostService.getPosts(req.query);
    return ApiResponse.paginated(res, MESSAGES.POSTS_RETRIEVED, posts, pagination);
  }

  /**
   * Get post by ID
   * GET /api/v1/posts/:id
   */
  static async getPostById(req, res) {
    const post = await PostService.getPostById(req.params.id, req.user);
    return ApiResponse.success(res, MESSAGES.POST_RETRIEVED, { post });
  }

  /**
   * Get post by slug
   * GET /api/v1/posts/slug/:slug
   */
  static async getPostBySlug(req, res) {
    const post = await PostService.getPostBySlug(req.params.slug);
    return ApiResponse.success(res, MESSAGES.POST_RETRIEVED, { post });
  }

  /**
   * Update post
   * PATCH /api/v1/posts/:id
   */
  static async updatePost(req, res) {
    const post = await PostService.updatePost(req.params.id, req.body, req.user);
    return ApiResponse.success(res, MESSAGES.POST_UPDATED, { post });
  }

  /**
   * Delete post (soft deletion)
   * DELETE /api/v1/posts/:id
   */
  static async deletePost(req, res) {
    await PostService.deletePost(req.params.id, req.user);
    return ApiResponse.success(res, MESSAGES.POST_DELETED, null);
  }
}

export default PostController;
