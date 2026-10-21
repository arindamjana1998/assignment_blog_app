import Comment from '../models/comment.model.js';
import Post from '../models/post.model.js';
import { ApiError } from '../utils/apiError.js';
import { MESSAGES } from '../constants/messages.js';
import { ROLES } from '../constants/roles.js';

export class CommentService {
  /**
   * Add a comment to an active post
   *
   * @param {object} input - { postId, authorId, content }
   * @returns {Promise<Comment>}
   */
  static async createComment({ postId, authorId, content }) {
    // Foreign key integrity check: target post must exist and not be soft-deleted
    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      throw ApiError.notFound('Cannot add comment: Post does not exist or has been deleted');
    }

    const comment = await Comment.create({
      content: content.trim(),
      post: postId,
      author: authorId,
      isDeleted: false,
    });

    return await comment.populate('author', 'name avatar');
  }

  /**
   * Get paginated comments for a post
   *
   * @param {string} postId
   * @param {object} query - { page, limit }
   * @returns {Promise<{ comments: Comment[], pagination: object }>}
   */
  static async getCommentsByPost(postId, { page = 1, limit = 20 }) {
    // Verify target post exists
    const post = await Post.findOne({ _id: postId, isDeleted: false });
    if (!post) {
      throw ApiError.notFound(MESSAGES.POST_NOT_FOUND);
    }

    const filter = { post: postId, isDeleted: false };
    const skip = (page - 1) * limit;

    const [totalItems, comments] = await Promise.all([
      Comment.countDocuments(filter),
      Comment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name avatar')
        .lean(),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      comments,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  }

  /**
   * Update comment content (restricted to comment author or admin)
   *
   * @param {string} commentId
   * @param {string} newContent
   * @param {object} user - Authenticated user
   * @returns {Promise<Comment>}
   */
  static async updateComment(commentId, newContent, user) {
    const comment = await Comment.findById(commentId);

    if (!comment || comment.isDeleted) {
      throw ApiError.notFound(MESSAGES.COMMENT_NOT_FOUND);
    }

    const isOwner = comment.author.toString() === user._id.toString();
    const isAdmin = user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden(MESSAGES.FORBIDDEN);
    }

    comment.content = newContent.trim();
    await comment.save();

    return await comment.populate('author', 'name avatar');
  }

  /**
   * Delete comment (restricted to comment author or admin)
   *
   * @param {string} commentId
   * @param {object} user - Authenticated user
   * @returns {Promise<Comment>}
   */
  static async deleteComment(commentId, user) {
    const comment = await Comment.findById(commentId);

    if (!comment || comment.isDeleted) {
      throw ApiError.notFound(MESSAGES.COMMENT_NOT_FOUND);
    }

    const isOwner = comment.author.toString() === user._id.toString();
    const isAdmin = user.role === ROLES.ADMIN;

    if (!isOwner && !isAdmin) {
      throw ApiError.forbidden(MESSAGES.FORBIDDEN);
    }

    comment.isDeleted = true;
    comment.deletedAt = new Date();
    await comment.save();

    return comment;
  }
}

export default CommentService;
