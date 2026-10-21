import CommentService from '../services/comment.service.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { MESSAGES } from '../constants/messages.js';

export class CommentController {
  /**
   * Create comment for a post
   * POST /api/v1/posts/:postId/comments
   */
  static async createComment(req, res) {
    const comment = await CommentService.createComment({
      postId: req.params.postId,
      authorId: req.user._id,
      content: req.body.content,
    });

    return ApiResponse.created(res, MESSAGES.COMMENT_CREATED, { comment });
  }

  /**
   * List paginated comments for a post
   * GET /api/v1/posts/:postId/comments
   */
  static async getCommentsByPost(req, res) {
    const { comments, pagination } = await CommentService.getCommentsByPost(
      req.params.postId,
      req.query
    );

    return ApiResponse.paginated(res, MESSAGES.COMMENTS_RETRIEVED, comments, pagination);
  }

  /**
   * Update comment content
   * PATCH /api/v1/comments/:id
   */
  static async updateComment(req, res) {
    const comment = await CommentService.updateComment(
      req.params.id,
      req.body.content,
      req.user
    );

    return ApiResponse.success(res, MESSAGES.COMMENT_UPDATED, { comment });
  }

  /**
   * Delete comment
   * DELETE /api/v1/comments/:id
   */
  static async deleteComment(req, res) {
    await CommentService.deleteComment(req.params.id, req.user);
    return ApiResponse.success(res, MESSAGES.COMMENT_DELETED, null);
  }
}

export default CommentController;
