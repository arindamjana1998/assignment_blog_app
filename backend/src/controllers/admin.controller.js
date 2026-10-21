import AdminService from '../services/admin.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { MESSAGES } from '../constants/messages.js';

export class AdminController {
  /**
   * System Overview & Metrics
   * GET /api/v1/admin/dashboard
   */
  static async getDashboard(req, res) {
    const metrics = await AdminService.getDashboardMetrics();
    return ApiResponse.success(res, MESSAGES.DASHBOARD_METRICS_RETRIEVED, metrics);
  }

  /**
   * List all users
   * GET /api/v1/admin/users
   */
  static async getUsers(req, res) {
    const { users, pagination } = await AdminService.getUsers(req.query);
    return ApiResponse.paginated(res, 'Users retrieved successfully', users, pagination);
  }

  /**
   * Get single user with activity statistics
   * GET /api/v1/admin/users/:id
   */
  static async getUserById(req, res) {
    const result = await AdminService.getUserById(req.params.id);
    return ApiResponse.success(res, 'User details retrieved successfully', result);
  }

  /**
   * Update user status or role
   * PATCH /api/v1/admin/users/:id
   */
  static async updateUser(req, res) {
    const user = await AdminService.updateUser(req.params.id, req.body, req.user._id);
    return ApiResponse.success(res, MESSAGES.USER_UPDATED, { user });
  }

  /**
   * Delete or deactivate user
   * DELETE /api/v1/admin/users/:id
   */
  static async deleteUser(req, res) {
    await AdminService.deleteUser(req.params.id, req.user._id);
    return ApiResponse.success(res, MESSAGES.USER_DELETED, null);
  }

  /**
   * List all posts including soft-deleted posts
   * GET /api/v1/admin/posts
   */
  static async getPosts(req, res) {
    const { posts, pagination } = await AdminService.getPosts(req.query);
    return ApiResponse.paginated(res, 'Admin posts retrieved successfully', posts, pagination);
  }

  /**
   * Update or restore post
   * PATCH /api/v1/admin/posts/:id
   */
  static async updatePost(req, res) {
    const post = await AdminService.updatePost(req.params.id, req.body);
    return ApiResponse.success(res, MESSAGES.POST_UPDATED, { post });
  }

  /**
   * Hard delete post
   * DELETE /api/v1/admin/posts/:id
   */
  static async deletePost(req, res) {
    await AdminService.deletePost(req.params.id);
    return ApiResponse.success(res, 'Post permanently deleted', null);
  }

  /**
   * List all comments system-wide
   * GET /api/v1/admin/comments
   */
  static async getComments(req, res) {
    const { comments, pagination } = await AdminService.getComments(req.query);
    return ApiResponse.paginated(res, 'Admin comments retrieved successfully', comments, pagination);
  }

  /**
   * Hard delete comment
   * DELETE /api/v1/admin/comments/:id
   */
  static async deleteComment(req, res) {
    await AdminService.deleteComment(req.params.id);
    return ApiResponse.success(res, 'Comment permanently deleted', null);
  }

  /**
   * Update comment content as admin
   * PATCH /api/v1/admin/comments/:id
   */
  static async updateComment(req, res) {
    const comment = await AdminService.updateComment(req.params.id, req.body.content);
    return ApiResponse.success(res, MESSAGES.COMMENT_UPDATED, { comment });
  }

  /**
   * List paginated user activity logs
   * GET /api/v1/admin/activity-logs
   */
  static async getActivityLogs(req, res) {
    const { logs, pagination } = await AdminService.getActivityLogs(req.query);
    return ApiResponse.paginated(res, 'Activity logs retrieved successfully', logs, pagination);
  }
}

export default AdminController;
