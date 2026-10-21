import User from '../models/user.model.js';
import Post from '../models/post.model.js';
import Comment from '../models/comment.model.js';
import RefreshToken from '../models/refreshToken.model.js';
import ActivityLog from '../models/activityLog.model.js';
import { ApiError } from '../utils/apiError.js';
import { MESSAGES } from '../constants/messages.js';

export class AdminService {
  /**
   * Aggregate high-level platform metrics
   *
   * @returns {Promise<object>}
   */
  static async getDashboardMetrics() {
    const [totalUsers, activeUsers, totalPosts, totalComments] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Post.countDocuments({ isDeleted: false }),
      Comment.countDocuments({ isDeleted: false }),
    ]);

    return {
      totalUsers,
      activeUsers,
      totalPosts,
      totalComments,
    };
  }

  /**
   * List all users with filtering and pagination
   *
   * @param {object} params - { page, limit, search, role, isActive }
   * @returns {Promise<{ users: User[], pagination: object }>}
   */
  static async getUsers({ page = 1, limit = 10, search, role, isActive }) {
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (role) {
      filter.role = role;
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const skip = (page - 1) * limit;

    const [totalItems, users] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      users,
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
   * Get single user by ID along with their activity metrics
   *
   * @param {string} userId
   * @returns {Promise<object>}
   */
  static async getUserById(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    const [userPostsCount, userCommentsCount] = await Promise.all([
      Post.countDocuments({ author: userId, isDeleted: false }),
      Comment.countDocuments({ author: userId, isDeleted: false }),
    ]);

    return {
      user: user.toJSON(),
      statistics: {
        postsCount: userPostsCount,
        commentsCount: userCommentsCount,
      },
    };
  }

  /**
   * Update user status or role (Admin only)
   *
   * @param {string} targetUserId
   * @param {object} updateData - { role, isActive }
   * @param {string} currentAdminId
   * @returns {Promise<User>}
   */
  static async updateUser(targetUserId, updateData, currentAdminId) {
    const user = await User.findById(targetUserId);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    // Guard: Prevent admin from deactivating or demoting themselves
    if (targetUserId.toString() === currentAdminId.toString()) {
      if (updateData.isActive === false) {
        throw ApiError.badRequest('Administrators cannot deactivate their own account');
      }
      if (updateData.role && updateData.role !== 'admin') {
        throw ApiError.badRequest('Administrators cannot demote their own role');
      }
    }

    if (updateData.role !== undefined) {
      user.role = updateData.role;
    }

    if (updateData.isActive !== undefined) {
      user.isActive = updateData.isActive;
      // If deactivating user, revoke all their active refresh tokens immediately
      if (updateData.isActive === false) {
        await RefreshToken.updateMany({ user: targetUserId }, { isRevoked: true });
      }
    }

    await user.save();
    return user.toJSON();
  }

  /**
   * Delete or deactivate user
   *
   * @param {string} targetUserId
   * @param {string} currentAdminId
   * @returns {Promise<object>}
   */
  static async deleteUser(targetUserId, currentAdminId) {
    if (targetUserId.toString() === currentAdminId.toString()) {
      throw ApiError.badRequest('Administrators cannot delete their own account');
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      throw ApiError.notFound(MESSAGES.USER_NOT_FOUND);
    }

    // Revoke tokens and delete user
    await Promise.all([
      RefreshToken.deleteMany({ user: targetUserId }),
      User.findByIdAndDelete(targetUserId),
    ]);

    return { id: targetUserId, deleted: true };
  }

  /**
   * List all posts including soft-deleted posts for admin review
   *
   * @param {object} params - { page, limit, search, author, isDeleted }
   * @returns {Promise<{ posts: Post[], pagination: object }>}
   */
  static async getPosts({ page = 1, limit = 10, search, author, isDeleted }) {
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (author) {
      filter.author = author;
    }

    if (isDeleted !== undefined) {
      filter.isDeleted = isDeleted;
    }

    const skip = (page - 1) * limit;

    const [totalItems, posts] = await Promise.all([
      Post.countDocuments(filter),
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email avatar')
        .lean(),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      posts,
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
   * Admin update or restore post
   *
   * @param {string} postId
   * @param {object} updateData - { title, content, isDeleted }
   * @returns {Promise<Post>}
   */
  static async updatePost(postId, updateData) {
    const post = await Post.findById(postId);
    if (!post) {
      throw ApiError.notFound(MESSAGES.POST_NOT_FOUND);
    }

    if (updateData.title) post.title = updateData.title.trim();
    if (updateData.content) post.content = updateData.content.trim();

    if (updateData.isDeleted !== undefined) {
      post.isDeleted = updateData.isDeleted;
      post.deletedAt = updateData.isDeleted ? new Date() : null;
    }

    await post.save();
    return await post.populate('author', 'name email avatar');
  }

  /**
   * Admin permanently remove post
   *
   * @param {string} postId
   * @returns {Promise<object>}
   */
  static async deletePost(postId) {
    const post = await Post.findById(postId);
    if (!post) {
      throw ApiError.notFound(MESSAGES.POST_NOT_FOUND);
    }

    // Cascade delete associated comments
    await Promise.all([
      Comment.deleteMany({ post: postId }),
      Post.findByIdAndDelete(postId),
    ]);

    return { id: postId, deleted: true };
  }

  /**
   * Admin list all comments
   *
   * @param {object} params - { page, limit, post, author }
   * @returns {Promise<{ comments: Comment[], pagination: object }>}
   */
  static async getComments({ page = 1, limit = 20, post, author }) {
    const filter = {};
    if (post) filter.post = post;
    if (author) filter.author = author;

    const skip = (page - 1) * limit;

    const [totalItems, comments] = await Promise.all([
      Comment.countDocuments(filter),
      Comment.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name email avatar')
        .populate('post', 'title slug')
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
   * Admin permanently delete a comment
   *
   * @param {string} commentId
   * @returns {Promise<object>}
   */
  static async deleteComment(commentId) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw ApiError.notFound(MESSAGES.COMMENT_NOT_FOUND);
    }

    await Comment.findByIdAndDelete(commentId);
    return { id: commentId, deleted: true };
  }

  /**
   * Admin update a comment's content
   *
   * @param {string} commentId
   * @param {string} newContent
   * @returns {Promise<Comment>}
   */
  static async updateComment(commentId, newContent) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw ApiError.notFound(MESSAGES.COMMENT_NOT_FOUND);
    }

    comment.content = newContent.trim();
    await comment.save();

    return await comment.populate('author', 'name email avatar');
  }

  /**
   * List paginated user activity logs
   *
   * @param {object} params - { page, limit, event, search }
   * @returns {Promise<{ logs: ActivityLog[], pagination: object }>}
   */
  static async getActivityLogs({ page = 1, limit = 20, event, search } = {}) {
    const filter = {};

    if (event) {
      filter.event = event;
    }

    if (search) {
      filter.$or = [
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
        { path: { $regex: search, $options: 'i' } },
        { event: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [totalItems, logs] = await Promise.all([
      ActivityLog.countDocuments(filter),
      ActivityLog.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalItems / limit) || 1;

    return {
      logs,
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
}

export default AdminService;
